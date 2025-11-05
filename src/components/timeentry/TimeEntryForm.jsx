import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Calendar, Coffee } from "lucide-react";
import { format } from "date-fns";

export default function TimeEntryForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    start_time: "",
    end_time: "",
    break_minutes: 0,
    notes: "",
  });

  const calculateHours = () => {
    if (!formData.start_time || !formData.end_time) return 0;
    
    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = (formData.break_minutes || 0) / 60;
    
    return Math.max(0, diffHours - breakHours);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalHours = calculateHours();
    onSubmit({ ...formData, total_hours: totalHours });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
      <CardHeader className="border-b border-slate-100 pb-6">
        <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          דיווח שעות עבודה
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                תאריך
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="break_minutes" className="text-base font-semibold text-slate-700 flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                הפסקה (דקות)
              </Label>
              <Input
                id="break_minutes"
                type="number"
                min="0"
                value={formData.break_minutes}
                onChange={(e) => setFormData({ ...formData, break_minutes: parseInt(e.target.value) || 0 })}
                className="text-lg h-12"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start_time" className="text-base font-semibold text-slate-700">
                שעת התחלה
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
                className="text-lg h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time" className="text-base font-semibold text-slate-700">
                שעת סיום
              </Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
                className="text-lg h-12"
              />
            </div>
          </div>

          {formData.start_time && formData.end_time && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-center text-lg">
                <span className="text-slate-600 font-medium">סה״כ שעות עבודה: </span>
                <span className="text-2xl font-bold text-blue-600">{calculateHours().toFixed(2)}</span>
                <span className="text-slate-600 font-medium"> שעות</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-base font-semibold text-slate-700">
              הערות
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="הערות נוספות (אופציונלי)"
              className="h-24 text-base"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? "שומר..." : "שמור דיווח"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}