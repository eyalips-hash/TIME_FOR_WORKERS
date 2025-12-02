import React from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";
import Dashboard from "./Dashboard";
import TimeEntry from "./TimeEntry";

export default function HomePage() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <Dashboard />;
  }

  return <TimeEntry />;
}