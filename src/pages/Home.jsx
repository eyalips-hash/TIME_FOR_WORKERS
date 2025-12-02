import React from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  React.useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.role === 'admin') {
        navigate(createPageUrl("Dashboard"), { replace: true });
      } else {
        navigate(createPageUrl("TimeEntry"), { replace: true });
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
}