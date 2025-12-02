import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PayrollReport from "../components/dashboard/PayrollReport";

export default function PayrollReportPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(window.location.search);
  const employee = searchParams.get("employee");
  const month = parseInt(searchParams.get("month") || new Date().getMonth());
  const year = parseInt(searchParams.get("year") || new Date().getFullYear());


  const { data: entries, isLoading } = useQuery({
    queryKey: ['payrollEntries', employee, month, year],
    queryFn: async () => {
      if (!employee) return [];
      return base44.entities.TimeEntry.filter({ created_by: employee }, "-date");
    },
    enabled: !!employee,
    initialData: [],
  });

  const { data: closedMonths } = useQuery({
    queryKey: ['closedMonths', employee, month, year],
    queryFn: () => base44.entities.ClosedMonth.filter({ employee, month, year }),
    enabled: !!employee,
    initialData: [],
  });

  const isMonthClosed = closedMonths?.length > 0;

  const closeMonthMutation = useMutation({
    mutationFn: async () => {
      const approvedEntries = entries.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getMonth() === month && entryDate.getFullYear() === year && e.status === "approved";
      });
      const totalHours = approvedEntries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
      
      return base44.entities.ClosedMonth.create({
        employee,
        month,
        year,
        total_hours: totalHours,
        closed_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closedMonths'] });
    },
  });



  if (!employee) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-600">חסר פרמטר עובד</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))} className="mt-4">
            חזרה ללוח בקרה
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-xl text-slate-600">טוען נתונים...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="no-print mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(createPageUrl("Reports"))}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            חזרה
          </Button>
          


          {isMonthClosed ? (
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Lock className="w-4 h-4 ml-2" />
              החודש נסגר
            </Badge>
          ) : (
            <Button 
              onClick={() => closeMonthMutation.mutate()}
              disabled={closeMonthMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Lock className="w-4 h-4 ml-2" />
              {closeMonthMutation.isPending ? "סוגר..." : "סגור חודש"}
            </Button>
          )}
        </div>
      </div>

      <PayrollReport
        employee={employee}
        entries={entries}
        month={month}
        year={year}
        isMonthClosed={isMonthClosed}
      />
    </div>
  );
}