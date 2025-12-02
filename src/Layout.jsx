import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, BarChart3, Plus, LogOut, Menu, Users, CheckCircle, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';

  const { data: pendingEntries } = useQuery({
    queryKey: ['pendingEntries'],
    queryFn: () => base44.entities.TimeEntry.filter({ status: 'pending' }),
    initialData: [],
    enabled: isAdmin,
  });

  const pendingCount = pendingEntries?.length || 0;

  const navigationItems = [
    {
      title: isAdmin ? "לוח בקרה" : "דיווח חדש",
      url: isAdmin ? createPageUrl("Dashboard") : createPageUrl("TimeEntry"),
      icon: isAdmin ? BarChart3 : Plus,
      show: true,
    },
    {
      title: isAdmin ? "דיווח חדש" : "השעות שלי",
      url: isAdmin ? createPageUrl("TimeEntry") : createPageUrl("MyHours"),
      icon: isAdmin ? Plus : Clock,
      show: true,
    },
    {
      title: "אישור דיווחים",
      url: createPageUrl("Approvals"),
      icon: CheckCircle,
      show: isAdmin,
      badge: pendingCount,
    },
    {
      title: "הפקת דוחות",
      url: createPageUrl("Reports"),
      icon: FileText,
      show: isAdmin,
    },
    {
      title: "ניהול עובדים",
      url: createPageUrl("ManageUsers"),
      icon: Users,
      show: isAdmin,
    },
  ].filter(item => item.show);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
      {/* Sidebar */}
      <aside className={`
        fixed top-0 right-0 h-full w-72 bg-white border-l border-slate-200 shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-900">מערכת שעות</h2>
                <p className="text-sm text-slate-500">
                  {isAdmin ? "ניהול ובקרה" : "דיווחי עובדים"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
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
                    <Badge className="bg-red-500 text-white hover:bg-red-500">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>

            {user && (
              <div className="mt-8">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{user.full_name || 'משתמש'}</p>
                      <p className="text-sm text-slate-500">
                        {user.role === 'admin' ? '👔 מנהל' : '👤 עובד'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>התנתק</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">מערכת שעות</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}