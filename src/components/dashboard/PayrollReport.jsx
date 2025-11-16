import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Printer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function PayrollReport({ employee, entries, month, year }) {
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const employeeName = React.useMemo(() => {
    const user = users?.find(u => u.email === employee);
    return user?.full_name || employee;
  }, [users, employee]);

  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate.getMonth() === month && entryDate.getFullYear() === year && entry.status === "approved";
  });

  const totalHours = filteredEntries.reduce((sum, e) => sum + (e.total_hours || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="no-print mb-6 flex gap-4">
        <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
          <Printer className="w-4 h-4 ml-2" />
          הדפס / שמור כ-PDF
        </Button>
      </div>

      <Card className="shadow-xl print:shadow-none">
        <CardContent className="p-12">
          {/* Header */}
          <div className="border-b-4 border-blue-600 pb-6 mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">דוח שעות עבודה</h1>
            <p className="text-lg text-slate-600">
              {format(new Date(year, month), "MMMM yyyy", { locale: he })}
            </p>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-6 rounded-xl">
            <div>
              <p className="text-sm text-slate-500 mb-1">שם עובד</p>
              <p className="text-xl font-bold text-slate-900">{employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">תאריך הפקה</p>
              <p className="text-xl font-bold text-slate-900">
                {format(new Date(), "d בMMMM yyyy", { locale: he })}
              </p>
            </div>
          </div>

          {/* Hours Table */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">פירוט שעות</h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-right p-3 font-bold border border-slate-300">תאריך</th>
                  <th className="text-right p-3 font-bold border border-slate-300">כניסה</th>
                  <th className="text-right p-3 font-bold border border-slate-300">יציאה</th>
                  <th className="text-right p-3 font-bold border border-slate-300">הפסקה</th>
                  <th className="text-right p-3 font-bold border border-slate-300">סה״כ שעות</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="p-3 border border-slate-300">
                      {format(new Date(entry.date), "d בMMMM", { locale: he })}
                    </td>
                    <td className="p-3 border border-slate-300">{entry.start_time}</td>
                    <td className="p-3 border border-slate-300">{entry.end_time}</td>
                    <td className="p-3 border border-slate-300">{entry.break_minutes} דק׳</td>
                    <td className="p-3 border border-slate-300 font-bold">
                      {entry.total_hours?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="text-center">
              <p className="text-lg text-blue-600 mb-2">סה״כ שעות מאושרות</p>
              <p className="text-5xl font-bold text-blue-900">{totalHours.toFixed(2)}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t text-center text-slate-500 text-sm">
            <p>דוח זה הופק אוטומטית ממערכת דיווח השעות</p>
            <p className="mt-1">{format(new Date(), "d/M/yyyy HH:mm", { locale: he })}</p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}