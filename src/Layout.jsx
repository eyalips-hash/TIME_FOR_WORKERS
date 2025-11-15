import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Clock, BarChart3, Plus, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === 'admin';

  const navigationItems = [
    {
      title: isAdmin ? "לוח בקרה" : "השעות שלי",
      url: isAdmin ? createPageUrl("Dashboard") : createPageUrl("MyHours"),
      icon: isAdmin ? BarChart3 : Clock,
      show: true,
    },
    {
      title: "דיווח חדש",
      url: createPageUrl("TimeEntry"),
      icon: Plus,
      show: true,
    },
  ].filter(item => item.show);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50" dir="rtl">
        <Sidebar className="border-l border-slate-200">
          <SidebarHeader className="border-b border-slate-200 p-6">
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
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl mb-3 h-14 ${
                          location.pathname === item.url ? 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white shadow-lg' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-4 px-4">
                          <item.icon className="w-6 h-6" />
                          <span className="font-semibold text-lg">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user && (
              <div className="mt-8 mx-2">
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
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>התנתק</span>
            </button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 md:hidden shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">מערכת שעות</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}