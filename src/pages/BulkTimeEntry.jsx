import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Save, CheckCircle, AlertCircle } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { he } from "date-fns/locale";

export default function BulkTimeEntryPage() {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dayEntries, setDayEntries] = useState({});
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: existingEntries } = useQuery({
    queryKey: ['existingEntries', selectedEmployee, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!selectedEmployee) return [];
      const monthStart = startOfMonth(new Date(selectedYear, selectedMonth, 1));
      const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth, 1));
      const allEntries = await base44.entities.TimeEntry.filter({ employee_email: selectedEmployee });
      return allEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });
    },
    enabled: !!selectedEmployee,
    initialData: [],
  });

  const employees = useMemo(() => {
    return users?.filter(u => u.role !== 'admin') || [];
  }, [users]);

  const daysInMonth = useMemo(() => {
    const monthStart = startOfMonth(new Date(selectedYear, selectedMonth, 1));
    const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth, 1));
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [selectedMonth, selectedYear]);

  // אתחול ימי החודש כשבוחרים עובד או משנים חודש
  React.useEffect(() => {
    if (selectedEmployee) {
      const newEntries = {};
      daysInMonth.forEach(day => {
        const dateKey = format(day, "yyyy-MM-dd");
        const hasEntry = existingEntries?.some(e => e.date === dateKey);
        
        if (!hasEntry) {
          newEntries[dateKey] = {
            enabled: false,
            start_time: "09:00",
            end_time: "17:00",
            break_minutes: 30,
            notes: ""
          };
        }
      });
      setDayEntries(newEntries);
    }
  }, [selectedEmployee, selectedMonth, selectedYear, existingEntries]);

  const createBulkMutation = useMutation({
    mutationFn: async (entries) => {
      return base44.entities.TimeEntry.bulkCreate(entries);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['existingEntries'] });
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError("שגיאה בשמירת הדיווחים");
    }
  });

  const handleDayChange = (dateKey, field, value) => {
    setDayEntries(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [field]: value
      }
    }));
  };

  const calculateHours = (start, end, breakMin) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const workMinutes = endMinutes - startMinutes - breakMin;
    return (workMinutes / 60).toFixed(2);
  };

  const handleSubmit = () => {
    if (!selectedEmployee) {
      setError("חובה לבחור עובד");
      return;
    }

    const entriesToCreate = [];
    Object.entries(dayEntries).forEach(([dateKey, data]) => {
      if (data.enabled) {
        entriesToCreate.push({
          employee_email: selectedEmployee,
          date: dateKey,
          start_time: data.start_time,
          end_time: data.end_time,
          break_minutes: data.break_minutes,
          notes: data.notes || "",
          status: "approved",
          total_hours: parseFloat(calculateHours(data.start_time, data.end_time, data.break_minutes))
        });
      }
    });

    if (entriesToCreate.length === 0) {
      setError("לא נבחרו ימים לדיווח");
      return;
    }

    createBulkMutation.mutate(entriesToCreate);
  };

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
    { value: 11, label: "דצמבר" }
  ];

  const years = [2024, 2025, 2026, 2027];

  const totalHours = useMemo(() => {
    return Object.entries(dayEntries)
      .filter(([_, data]) => data.enabled)
      .reduce((sum, [_, data]) => {
        return sum + parseFloat(calculateHours(data.start_time, data.end_time, data.break_minutes));
      }, 0);
  }, [dayEntries]);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">הזנה מרובה של שעות</h1>
          <p className="text-lg text-slate-600">הזן שעות עבודה לעובד לכל החודש בבת אחת</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
            <div>
              <p className="text-lg font-bold text-green-900">הדיווחים נשמרו בהצלחה!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
            <AlertCircle className="w-7 h-7 text-red-600" />
            <div>
              <p className="text-lg font-bold text-red-900">שגיאה</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <Card className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-600" />
              בחירת עובד וחודש
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Label className="text-slate-700 font-semibold mb-2 block">עובד</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="בחר עובד" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.email} value={emp.email}>
                        {emp.full_name || emp.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 font-semibold mb-2 block">חודש</Label>
                <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(Number(v))}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map(m => (
                      <SelectItem key={m.value} value={m.value.toString()}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 font-semibold mb-2 block">שנה</Label>
                <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map(y => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedEmployee && Object.keys(dayEntries).length > 0 && (
          <>
            <Card className="mb-6 shadow-xl border-0 bg-white/90 backdrop-blur">
              <CardHeader className="border-b border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle>ימי עבודה לדיווח</CardTitle>
                  <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg font-bold text-lg">
                    סה״כ: {totalHours.toFixed(1)} שעות
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {daysInMonth.map(day => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const dayData = dayEntries[dateKey];
                    const hasExisting = existingEntries?.some(e => e.date === dateKey);
                    
                    if (!dayData) return null;

                    return (
                      <div 
                        key={dateKey} 
                        className={`grid md:grid-cols-7 gap-4 items-center p-4 rounded-xl border-2 ${
                          dayData.enabled ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={dayData.enabled}
                            onChange={(e) => handleDayChange(dateKey, 'enabled', e.target.checked)}
                            className="w-5 h-5"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{format(day, "dd/MM/yyyy")}</p>
                            <p className="text-sm text-slate-600">{format(day, "EEEE", { locale: he })}</p>
                          </div>
                        </div>
                        
                        <Input
                          type="time"
                          value={dayData.start_time}
                          onChange={(e) => handleDayChange(dateKey, 'start_time', e.target.value)}
                          className="h-10"
                        />
                        
                        <Input
                          type="time"
                          value={dayData.end_time}
                          onChange={(e) => handleDayChange(dateKey, 'end_time', e.target.value)}
                          className="h-10"
                        />
                        
                        <Input
                          type="number"
                          value={dayData.break_minutes}
                          onChange={(e) => handleDayChange(dateKey, 'break_minutes', Number(e.target.value))}
                          className="h-10"
                        />
                        
                        <div className="md:col-span-2">
                          <Input
                            type="text"
                            value={dayData.notes}
                            onChange={(e) => handleDayChange(dateKey, 'notes', e.target.value)}
                            placeholder="הערות"
                            className="h-10"
                          />
                        </div>
                        
                        <div className="text-left">
                          <p className="text-2xl font-bold text-blue-900">
                            {calculateHours(dayData.start_time, dayData.end_time, dayData.break_minutes)}
                          </p>
                          <p className="text-xs text-slate-600">שעות</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                onClick={handleSubmit}
                disabled={createBulkMutation.isPending || Object.values(dayEntries).filter(d => d.enabled).length === 0}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-14 px-8 text-lg font-bold shadow-lg"
              >
                <Save className="w-6 h-6 ml-2" />
                {createBulkMutation.isPending ? "שומר..." : `שמור ${Object.values(dayEntries).filter(d => d.enabled).length} דיווחים`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}