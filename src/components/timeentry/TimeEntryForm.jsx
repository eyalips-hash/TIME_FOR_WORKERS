import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function TimeEntryForm({ entry, onSubmit, onCancel, isSubmitting, isAdmin }) {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
    enabled: isAdmin,
  });

  // הגדר אנדרי כברירת מחדל למנהלים
  React.useEffect(() => {
    if (isAdmin && !entry && !formData.employee_email && users && users.length > 0) {
      const andrey = users.find(u => u.full_name?.includes("אנדרי") || u.email?.includes("andrey"));
      if (andrey) {
        setFormData(prev => ({...prev, employee_email: andrey.email}));
      }
    }
  }, [isAdmin, entry, users]);

  const [formData, setFormData] = React.useState({
    employee_email: entry?.employee_email || "",
    date: entry?.date || new Date().toISOString().split('T')[0],
    start_time: entry?.start_time || "09:00",
    end_time: entry?.end_time || "17:00",
    break_minutes: entry?.break_minutes || 0,
    notes: entry?.notes || "",
    status: entry?.status || "pending",
  });

  const [weekendWarning, setWeekendWarning] = React.useState(false);

  React.useEffect(() => {
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const dayOfWeek = selectedDate.getDay();
      setWeekendWarning(dayOfWeek === 5 || dayOfWeek === 6);
    }
  }, [formData.date]);

  const calculateHours = () => {
    const [startHour, startMin] = formData.start_time.split(':').map(Number);
    const [endHour, endMin] = formData.end_time.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const workMinutes = endMinutes - startMinutes - (formData.break_minutes || 0);
    
    return (workMinutes / 60).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalHours = parseFloat(calculateHours());
    const submitData = { ...formData, total_hours: totalHours };
    
    // אם אין employee_email, השתמש במשתמש הנוכחי
    if (!submitData.employee_email) {
      submitData.employee_email = user?.email;
    }
    
    onSubmit(submitData);
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur">
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isAdmin && (
            <div>
              <Label className="text-slate-700 font-semibold mb-2 block">בחר עובד</Label>
              <Select 
                value={formData.employee_email} 
                onValueChange={(value) => setFormData({...formData, employee_email: value})}
                required
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="בחר עובד" />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((u) => (
                    <SelectItem key={u.email} value={u.email}>
                      {u.full_name || u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-700 font-semibold mb-2 block">תאריך</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="h-12 text-base"
              />
              {weekendWarning && (
                <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-orange-600 text-sm font-semibold">⚠️ שים לב: התאריך שבחרת הוא יום שישי או שבת</span>
                </div>
              )}
            </div>
            <div>
              <Label className="text-slate-700 font-semibold mb-2 block">הפסקה (דקות)</Label>
              <Input
                type="number"
                value={formData.break_minutes}
                onChange={(e) => setFormData({...formData, break_minutes: Number(e.target.value)})}
                min="0"
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-700 font-semibold mb-2 block">שעת התחלה</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                required
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-semibold mb-2 block">שעת סיום</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                required
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border-r-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">סה״כ שעות עבודה</p>
                  <p className="text-slate-500 text-xs mt-1">לאחר הפחתת הפסקה</p>
                </div>
              </div>
              <p className="text-4xl font-bold text-blue-900">{calculateHours()}</p>
            </div>
          </div>

          <div>
            <Label className="text-slate-700 font-semibold mb-2 block">הערות</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="הוסף הערות או פרטים נוספים..."
              className="h-24 text-base resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12 text-base font-semibold shadow-lg"
            >
              {isSubmitting ? "שומר..." : (entry ? "עדכן דיווח" : "שמור דיווח")}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-12 px-8"
              >
                ביטול
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}