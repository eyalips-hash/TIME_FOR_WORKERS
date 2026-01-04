import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";

export default function BulkEditForm({ selectedEntries, onSubmit, onCancel, isSubmitting }) {
  const [bulkData, setBulkData] = React.useState({
    start_time: "",
    end_time: "",
    break_minutes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // רק שדות שמולאו יעודכנו
    const updates = {};
    if (bulkData.start_time) updates.start_time = bulkData.start_time;
    if (bulkData.end_time) updates.end_time = bulkData.end_time;
    if (bulkData.break_minutes !== "") updates.break_minutes = Number(bulkData.break_minutes);

    // חישוב שעות מחדש אם יש שינוי בזמנים
    if (updates.start_time || updates.end_time || updates.break_minutes !== undefined) {
      onSubmit(updates);
    }
  };

  return (
    <Card className="shadow-xl border-2 border-blue-500 bg-white/95 backdrop-blur mb-6">
      <CardHeader className="bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-blue-900">
            עריכה מרובה - {selectedEntries.length} דיווחים נבחרו
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-blue-900 font-semibold">
              💡 השדות שתמלא יעודכנו בכל הדיווחים הנבחרים
            </p>
            <p className="text-sm text-blue-700 mt-1">
              השאר שדה ריק אם אינך רוצה לעדכן אותו
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <Label className="text-slate-700 font-semibold mb-2 block">שעת התחלה</Label>
              <Input
                type="time"
                value={bulkData.start_time}
                onChange={(e) => setBulkData({...bulkData, start_time: e.target.value})}
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-semibold mb-2 block">שעת סיום</Label>
              <Input
                type="time"
                value={bulkData.end_time}
                onChange={(e) => setBulkData({...bulkData, end_time: e.target.value})}
                className="h-12 text-base"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-semibold mb-2 block">הפסקה (דקות)</Label>
              <Input
                type="number"
                value={bulkData.break_minutes}
                onChange={(e) => setBulkData({...bulkData, break_minutes: e.target.value})}
                min="0"
                placeholder="השאר ריק ללא שינוי"
                className="h-12 text-base"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || (!bulkData.start_time && !bulkData.end_time && bulkData.break_minutes === "")}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12 text-base font-semibold shadow-lg"
            >
              <Save className="w-5 h-5 ml-2" />
              {isSubmitting ? "מעדכן..." : `עדכן ${selectedEntries.length} דיווחים`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-12 px-8"
            >
              ביטול
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}