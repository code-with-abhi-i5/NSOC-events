import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import type { UserRole, User } from "@/types";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  role: UserRole;
  isDemoMode: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN: User = {
  id: "demo-admin-01",
  email: "admin@nsoc.dev",
  displayName: "NSOC Lead Admin",
  role: "ADMIN",
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("nsoc_demo_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Resolve user profile
        setUser({
          id: fbUser.uid,
          email: fbUser.email || "",
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "Admin",
          role: "ADMIN", // Default elevated role for dashboard admin access
          photoURL: fbUser.photoURL || undefined,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Keep demo user if logged in via demo
        const saved = localStorage.getItem("nsoc_demo_user");
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginDemo = async () => {
    setUser(DEMO_ADMIN);
    localStorage.setItem("nsoc_demo_user", JSON.stringify(DEMO_ADMIN));
  };

  const login = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      const demoUser: User = {
        ...DEMO_ADMIN,
        email,
        displayName: email.split("@")[0] || "Admin",
      };
      setUser(demoUser);
      localStorage.setItem("nsoc_demo_user", JSON.stringify(demoUser));
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      // If default admin email is used before creating user in Firebase Console, fallback to demo admin
      if (email === "admin@nsoc.dev") {
        await loginDemo();
        return;
      }
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      const demoUser: User = {
        ...DEMO_ADMIN,
        displayName: "Google Demo User",
      };
      setUser(demoUser);
      localStorage.setItem("nsoc_demo_user", JSON.stringify(demoUser));
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem("nsoc_demo_user");
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.log("Demo password reset sent to:", email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        role: user?.role || "ADMIN",
        isDemoMode: !isFirebaseConfigured,
        login,
        loginDemo,
        loginWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
