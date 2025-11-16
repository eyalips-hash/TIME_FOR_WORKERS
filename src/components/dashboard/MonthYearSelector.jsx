import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { X } from "lucide-react";

const months = [
  { value: 0, label: "ינואר" },
  { value: 1, label: "פברואר" },
  { value: 2, label: "מרץ" },
  { value: 3, label: "אפריל" },
  { value: 4, label: "מאי" },
  { value: 5, label: "יוני" },
  { value: 6, label: "יולי" },
  { value: 7, label: "אוגוסט" },
  { value: 8, label: "ספטמבר" },
  { value: 9, label: "אוקטובר" },
  { value: 10, label: "נובמבר" },
  { value: 11, label: "דצמבר" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

export default function MonthYearSelector({ employee, onClose }) {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = React.useState(currentYear);

  const handleGenerate = () => {
    const url = `${createPageUrl("PayrollReportPage")}?employee=${encodeURIComponent(employee)}&month=${selectedMonth}&year=${selectedYear}`;
    navigate(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">בחר חודש ושנה לדוח</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">חודש</label>
            <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={String(month.value)}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">שנה</label>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleGenerate} className="flex-1 bg-blue-600 hover:bg-blue-700">
              הפק דוח
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              ביטול
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}