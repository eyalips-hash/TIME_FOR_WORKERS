import React from "react";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import Dashboard from "./Dashboard";
import TimeEntry from "./TimeEntry";

export default function HomePage() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await base44.auth.me();
        console.log("Full user object:", JSON.stringify(u));
        setUser(u);
        setIsAdmin(u?.role === 'admin');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Debug display
  console.log("Is admin:", isAdmin, "Role:", user?.role);

  if (isAdmin) {
    return <Dashboard />;
  }

  return <TimeEntry />;
}