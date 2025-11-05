import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Calendar, Clock } from "lucide-react";
import TimeEntryList from "../components/timeentry/TimeEntryList";
import StatsCard from "../components/dashboard/StatsCard";

export default function MyHoursPage() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['myTimeEntries', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.TimeEntry.filter({ created_by: user.email }, "-date");
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const thisWeekHours = React.useMemo(() => {
    if (!entries) return 0;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entries
      .filter(e => new Date(e.date) >= weekAgo)
      .reduce((sum, e) => sum + (e.total_hours || 0), 0);
  }, [entries]);

  const thisMonthHours = React.useMemo(() => {
    if (!entries) return 0;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return entries
      .filter(e => new Date(e.date) >= monthAgo)
      .reduce((sum, e) => sum + (e.total_hours || 0), 0);
  }, [entries]);

  const pendingCount = React.useMemo(() => {
    return entries?.filter(e => e.status === "pending").length || 0;
  }, [entries]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">השעות שלי</h1>
            <p className="text-lg text-slate-600">מעקב אחר שעות העבודה שלך</p>
          </div>
          <Link to={createPageUrl("TimeEntry")}>
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg h-12 px-6 text-base">
              <Plus className="w-5 h-5 ml-2" />
              דיווח חדש
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="השבוע"
            value={`${thisWeekHours.toFixed(1)} שעות`}
            icon={Calendar}
            bgColor="bg-blue-500"
          />
          <StatsCard
            title="החודש"
            value={`${thisMonthHours.toFixed(1)} שעות`}
            icon={Clock}
            bgColor="bg-purple-500"
          />
          <StatsCard
            title="ממתינים לאישור"
            value={pendingCount}
            subtitle="דיווחים"
            icon={Clock}
            bgColor="bg-yellow-500"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">היסטוריית דיווחים</h2>
          <TimeEntryList entries={entries} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}