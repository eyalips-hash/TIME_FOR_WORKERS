import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Clock, CheckCircle, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatsCard from "../components/dashboard/StatsCard";
import EmployeeHoursTable from "../components/dashboard/EmployeeHoursTable";
import MonthlyHoursTable from "../components/dashboard/MonthlyHoursTable";
import TimeEntryForm from "../components/timeentry/TimeEntryForm";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = React.useState(null);
  const [editingEntry, setEditingEntry] = React.useState(null);

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

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TimeEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTimeEntries'] });
      setDeleteId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTimeEntries'] });
      setEditingEntry(null);
    },
  });

  const handleUpdateStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
  };

  const handleUpdate = (data) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    }
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

        {editingEntry && (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-blue-900 font-semibold">עריכת דיווח</p>
              <p className="text-blue-700 text-sm">תוכל לערוך את כל פרטי הדיווח</p>
            </div>
            <TimeEntryForm
              entry={editingEntry}
              onSubmit={handleUpdate}
              onCancel={() => setEditingEntry(null)}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        )}

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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם למחוק את הדיווח?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו אינה ניתנת לביטול. הדיווח יימחק לצמיתות.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                מחק
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}