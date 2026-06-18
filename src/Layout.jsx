import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, BarChart3, Plus, LogOut, Menu, CheckCircle, FileText, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const { data: pendingEntries } = useQuery({
    queryKey: ['pendingEntries'],
    queryFn: () => base44.entities.TimeEntry.filter({ status: 'pending' }),
    initialData: [],
  });

  const pendingCount = pendingEntries?.length || 0;

  const navigationItems = [
    { title: "לוח בקרה", url: createPageUrl("Dashboard"), icon: BarChart3 },
    { title: "דיווח חדש", url: createPageUrl("TimeEntry"), icon: Plus },
    { title: "השעות שלי", url: createPageUrl("MyHours"), icon: Clock },
    { title: "הזנה מרובה", url: createPageUrl("BulkTimeEntry"), icon: Calendar },
    { title: "אישור דיווחים", url: createPageUrl("Approvals"), icon: CheckCircle, badge: pendingCount },
    { title: "הפקת דוחות", url: createPageUrl("Reports"), icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-xl z-[100]
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-900">מערכת שעות</h2>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-4 rounded-xl transition-all duration-200 ${
                    location.pathname === item.url
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'hover:bg-blue-50 hover:text-blue-700 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon className="w-6 h-6" />
                    <span className="font-semibold text-lg">{item.title}</span>
                  </div>
                  {item.badge > 0 && (
                    <Badge className="bg-red-500 text-white hover:bg-red-500">{item.badge}</Badge>
                  )}
                </Link>
              ))}
            </div>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <button
              onClick={() => base44.auth.logout()}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>התנתק</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[90] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">מערכת שעות</h1>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="hover:bg-slate-100">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}