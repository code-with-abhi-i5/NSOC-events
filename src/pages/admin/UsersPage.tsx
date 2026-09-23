import { useState, useEffect } from "react";
import { UserPlus, Shield, X } from "lucide-react";
import type { User, UserRole } from "@/types";
import { useAuth } from "@/context/AuthContext";

const USERS_STORAGE_KEY = "nsoc_admin_users_v2";

export default function UsersPage() {
  const { user: currentAuthUser } = useAuth();
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return currentAuthUser ? [currentAuthUser] : [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("ORGANIZER");

  useEffect(() => {
    if (users.length === 0 && currentAuthUser) {
      setUsers([currentAuthUser]);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([currentAuthUser]));
    }
  }, [currentAuthUser]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newUser: User = {
      id: "usr-" + Math.random().toString(36).substring(2, 7),
      displayName: name,
      email,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    setName("");
    setEmail("");
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    const updated = users.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u));
    setUsers(updated);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Administrative Access Control
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage authorized administrators, event organizers, and role-based permissions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite Team Member
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs font-semibold uppercase text-muted-foreground border-b border-border/60">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Joined</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">
                  No administrative users added yet.
                </td>
              </tr>
            ) : (
              users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="font-semibold text-foreground">{u.displayName}</div>
                  <div className="text-[11px] text-muted-foreground">{u.email}</div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                      u.role === "ADMIN"
                        ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                        : u.role === "ORGANIZER"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Shield className="h-3 w-3" />
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      u.isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {u.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleToggleStatus(u.id)}
                    className="rounded-md border border-border/60 bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            )))
          }
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h3 className="text-base font-semibold text-foreground">
                Grant Admin Access
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-medium text-foreground">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanya Gupta"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Email</label>
                <input
                  type="email"
                  required
                  placeholder="sanya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="ORGANIZER">ORGANIZER (Manage events & certificates)</option>
                  <option value="ADMIN">ADMIN (Full platform permissions)</option>
                  <option value="VIEWER">VIEWER (Read-only analytics)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-border/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Confirm Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
