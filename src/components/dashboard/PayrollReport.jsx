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

  const filteredEntries = entries
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === month && entryDate.getFullYear() === year && entry.status === "approved";
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

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
        <CardContent className="p-4 print:p-2">
          {/* Header */}
          <div className="border-b border-blue-600 pb-1 mb-2 flex justify-between items-center">
            <h1 className="text-base font-bold text-slate-900">
              {employeeName} {month + 1}-{year.toString().slice(-2)}
            </h1>
            <p className="text-[10px] text-slate-500">
              הופק: {format(new Date(), "d/M/yyyy", { locale: he })}
            </p>
          </div>

          {/* Hours Table */}
          <table className="w-full border-collapse text-[10px] print:text-[9px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="text-right p-1 font-bold border border-slate-300">תאריך</th>
                <th className="text-right p-1 font-bold border border-slate-300">כניסה</th>
                <th className="text-right p-1 font-bold border border-slate-300">יציאה</th>
                <th className="text-right p-1 font-bold border border-slate-300">הפסקה</th>
                <th className="text-right p-1 font-bold border border-slate-300">שעות</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr key={entry.id}>
                  <td className="p-1 border border-slate-300">
                    {format(new Date(entry.date), "dd/MM/yy")}
                  </td>
                  <td className="p-1 border border-slate-300">{entry.start_time}</td>
                  <td className="p-1 border border-slate-300">{entry.end_time}</td>
                  <td className="p-1 border border-slate-300">{entry.break_minutes}'</td>
                  <td className="p-1 border border-slate-300 font-bold">
                    {entry.total_hours?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 font-bold">
                <td colSpan={4} className="p-1 border border-slate-300 text-right">
                  סה״כ שעות מאושרות:
                </td>
                <td className="p-1 border border-slate-300 text-blue-900">
                  {totalHours.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Footer */}
          <div className="mt-2 pt-1 border-t text-center text-slate-400 text-[8px]">
            <p>IPS - מערכת שעות</p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0.3cm;
            size: A4;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}