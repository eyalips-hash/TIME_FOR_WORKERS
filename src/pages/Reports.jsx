import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

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
const years = [currentYear - 1, currentYear, currentYear + 1];

export default function ReportsPage() {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = React.useState("");
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = React.useState(currentYear.toString());

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: entries } = useQuery({
    queryKey: ['allTimeEntries'],
    queryFn: () => base44.entities.TimeEntry.list("-date"),
    initialData: [],
  });

  const employees = React.useMemo(() => {
    return [...new Set(entries.map(e => e.created_by))];
  }, [entries]);

  const usersByEmail = React.useMemo(() => {
    const map = {};
    users?.forEach(user => {
      map[user.email] = user.full_name || user.email;
    });
    return map;
  }, [users]);

  // הגדר את אנדרי כברירת מחדל
  React.useEffect(() => {
    if (!selectedEmployee && employees.length > 0) {
      const andrey = employees.find(e => usersByEmail[e]?.includes("אנדרי") || e.includes("andrey"));
      if (andrey) {
        setSelectedEmployee(andrey);
      }
    }
  }, [employees, usersByEmail]);

  const handleGenerateReport = () => {
    if (!selectedEmployee) return;
    
    const url = createPageUrl("PayrollReportPage") + 
      `?employee=${encodeURIComponent(selectedEmployee)}&month=${selectedMonth}&year=${selectedYear}`;
    navigate(url);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">הפקת דוחות</h1>
          <p className="text-lg text-slate-600">בחר עובד וחודש להפקת דוח שעות</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              הפקת דוח שעות
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                בחר עובד
              </label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="בחר עובד..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {usersByEmail[employee] || employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month & Year Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  חודש
                </label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="בחר חודש..." />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value.toString()}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  שנה
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="בחר שנה..." />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateReport}
              disabled={!selectedEmployee}
              className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-5 h-5 ml-2" />
              הפק דוח
            </Button>

            {!selectedEmployee && (
              <p className="text-center text-slate-500 text-sm">
                יש לבחור עובד כדי להפיק דוח
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}