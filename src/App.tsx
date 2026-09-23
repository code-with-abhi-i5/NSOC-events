import { AuthProvider } from "@/context/AuthContext";
import AppRouter from "@/router";
import { Toaster } from "sonner";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster position="bottom-right" richColors />
    </AuthProvider>
  );
}
