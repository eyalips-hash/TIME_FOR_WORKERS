import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PayrollReport from "../components/dashboard/PayrollReport";

export default function PayrollReportPage() {
  const navigate = useNavigate();
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
        <Button 
          variant="outline" 
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="mb-4"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          חזרה ללוח בקרה
        </Button>
      </div>

      <PayrollReport
        employee={employee}
        entries={entries}
        month={month}
        year={year}
      />
    </div>
  );
}