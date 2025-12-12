import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Calendar, Clock } from "lucide-react";
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
import TimeEntryList from "../components/timeentry/TimeEntryList";
import MonthlyHoursTable from "../components/dashboard/MonthlyHoursTable";
import StatsCard from "../components/dashboard/StatsCard";
import TimeEntryForm from "../components/timeentry/TimeEntryForm";

export default function MyHoursPage() {
  const [user, setUser] = React.useState(null);
  const [deleteId, setDeleteId] = React.useState(null);
  const [editingEntry, setEditingEntry] = React.useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: entries, isLoading } = useQuery({
    queryKey: ['myTimeEntries', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.TimeEntry.filter({ employee_email: user.email }, "-date");
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TimeEntry.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTimeEntries'] });
      setDeleteId(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TimeEntry.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTimeEntries'] });
      setEditingEntry(null);
    },
  });

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
      <div className="max-w-7xl mx-auto">
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

        {editingEntry && (
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-blue-900 font-semibold">עריכת דיווח</p>
              <p className="text-blue-700 text-sm">ניתן לערוך רק דיווחים שטרם אושרו</p>
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
            <TabsTrigger value="list" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white px-6 py-2">
              רשימת דיווחים
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monthly">
            <MonthlyHoursTable entries={entries} />
          </TabsContent>

          <TabsContent value="list">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">היסטוריית דיווחים</h2>
              <TimeEntryList 
                entries={entries} 
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
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