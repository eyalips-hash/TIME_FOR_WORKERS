import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Clock, CheckCircle, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "../components/dashboard/StatsCard";
import EmployeeHoursTable from "../components/dashboard/EmployeeHoursTable";
import MonthlyHoursTable from "../components/dashboard/MonthlyHoursTable";

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: allEntries, isLoading } = useQuery({
    queryKey: ['allTimeEntries'],
    queryFn: () => base44.entities.TimeEntry.list("-date"),
    initialData: [],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TimeEntry.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTimeEntries'] });
    },
  });

  const handleUpdateStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const stats = React.useMemo(() => {
    const thisWeekHours = allEntries
      .filter(e => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(e.date) >= weekAgo;
      })
      .reduce((sum, e) => sum + (e.total_hours || 0), 0);

    const thisMonthHours = allEntries
      .filter(e => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return new Date(e.date) >= monthAgo;
      })
      .reduce((sum, e) => sum + (e.total_hours || 0), 0);

    const pendingCount = allEntries.filter(e => e.status === "pending").length;
    const approvedCount = allEntries.filter(e => e.status === "approved").length;

    return { thisWeekHours, thisMonthHours, pendingCount, approvedCount };
  }, [allEntries]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">לוח בקרה</h1>
          <p className="text-lg text-slate-600">מעקב וניהול שעות עבודה</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="השבוע"
            value={`${stats.thisWeekHours.toFixed(1)}`}
            subtitle="שעות"
            icon={Calendar}
            bgColor="bg-blue-500"
          />
          <StatsCard
            title="החודש"
            value={`${stats.thisMonthHours.toFixed(1)}`}
            subtitle="שעות"
            icon={Clock}
            bgColor="bg-purple-500"
          />
          <StatsCard
            title="ממתינים"
            value={stats.pendingCount}
            subtitle="דיווחים"
            icon={Clock}
            bgColor="bg-yellow-500"
          />
          <StatsCard
            title="אושרו"
            value={stats.approvedCount}
            subtitle="דיווחים"
            icon={CheckCircle}
            bgColor="bg-green-500"
          />
        </div>

        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="bg-white shadow-md border border-slate-200 p-1">
            <TabsTrigger value="monthly" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-6 py-2">
              תצוגה חודשית
            </TabsTrigger>
            <TabsTrigger value="approvals" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-6 py-2">
              אישור דיווחים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <MonthlyHoursTable entries={allEntries} />
          </TabsContent>

          <TabsContent value="approvals">
            <EmployeeHoursTable
              entries={allEntries}
              onUpdateStatus={handleUpdateStatus}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}