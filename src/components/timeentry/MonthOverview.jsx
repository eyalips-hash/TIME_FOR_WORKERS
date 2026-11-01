import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, ChevronDown, CalendarDays, Lock } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { he } from "date-fns/locale";

const STATUS = {
  pending: { label: "ממתין לאישור", cls: "bg-yellow-100 text-yellow-800" },
  approved: { label: "מאושר", cls: "bg-green-100 text-green-800" },
  rejected: { label: "נדחה", cls: "bg-red-100 text-red-800" },
};

const fmtHours = (h) => (h == null || isNaN(h) ? "-" : Number(h).toFixed(2));

export default function MonthOverview({ entries = [], closedMonths = [], month, year, onMonthChange, onPickDate }) {
  const [openDay, setOpenDay] = React.useState(null);

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const days = eachDayOfInterval({
    start: startOfMonth(new Date(year, month, 1)),
    end: endOfMonth(new Date(year, month, 1)),
  });

  const byDate = {};
  entries.forEach((e) => { if (e.date) byDate[e.date] = e; });

  const isClosed = closedMonths.some((cm) => cm.month === month && cm.year === year);

  let filledCount = 0, missingCount = 0, totalHours = 0;
  days.forEach((d) => {
    const key = format(d, "yyyy-MM-dd");
    const wd = d.getDay();
    const isWeekend = wd === 5 || wd === 6;
    if (byDate[key]) { filledCount++; totalHours += Number(byDate[key].total_hours) || 0; }
    else if (!isWeekend && key <= todayKey) missingCount++;
  });

  const shift = (delta) => {
    const d = new Date(year, month + delta, 1);
    setOpenDay(null);
    onMonthChange(d.getMonth(), d.getFullYear());
  };

  return (
    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur mt-8">
      <CardHeader className="border-b border-slate-100 p-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          כל הימים בחודש
        </CardTitle>
        <div className="flex items-center justify-between mt-3">
          <Button variant="outline" size="icon" onClick={() => shift(-1)} aria-label="חודש קודם">
            <ChevronRight className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{format(new Date(year, month, 1), "LLLL yyyy", { locale: he })}</p>
            {isClosed && (
              <p className="text-xs text-slate-600 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> החודש נסגר</p>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={() => shift(1)} aria-label="חודש הבא">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-xl font-bold text-green-800">{filledCount}</p>
            <p className="text-xs text-green-700">ימים מולאו</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2">
            <p className="text-xl font-bold text-red-700">{missingCount}</p>
            <p className="text-xs text-red-600">ימים חסרים</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-xl font-bold text-blue-900">{totalHours.toFixed(1)}</p>
            <p className="text-xs text-blue-700">סה״כ שעות</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <div className="space-y-2">
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const wd = d.getDay();
            const isWeekend = wd === 5 || wd === 6;
            const isFuture = key > todayKey;
            const entry = byDate[key];
            const isOpen = openDay === key;

            let rowCls = "bg-slate-50 border-slate-200";
            let right = <span className="text-sm text-slate-400">{isWeekend ? "סוף שבוע" : "עתידי"}</span>;

            if (entry) {
              rowCls = "bg-green-50 border-green-300";
              right = (
                <div className="text-left">
                  <p className="font-bold text-green-900">{fmtHours(entry.total_hours)} ש׳</p>
                  <p className="text-xs text-slate-600" dir="ltr">{entry.start_time}–{entry.end_time}</p>
                </div>
              );
            } else if (!isWeekend && !isFuture) {
              rowCls = "bg-red-50 border-red-300";
              right = <span className="text-sm font-bold text-red-700">חסר</span>;
            }

            const clickable = !!entry || (!isWeekend && !isFuture && !isClosed);

            const handleClick = () => {
              if (entry) setOpenDay(isOpen ? null : key);
              else if (clickable) onPickDate?.(key);
            };

            return (
              <div key={key} className={`rounded-xl border-2 ${rowCls}`}>
                <button
                  type="button"
                  onClick={handleClick}
                  disabled={!clickable}
                  className="w-full flex items-center justify-between p-3 text-right disabled:cursor-default"
                >
                  <div className="flex items-center gap-2">
                    {entry && <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />}
                    <div>
                      <p className="font-bold text-slate-900">{format(d, "dd/MM")} · {format(d, "EEEE", { locale: he })}</p>
                      {!entry && !isWeekend && !isFuture && !isClosed && (
                        <p className="text-xs text-red-600">לחץ כדי למלא את היום הזה</p>
                      )}
                    </div>
                  </div>
                  {right}
                </button>

                {entry && isOpen && (
                  <div className="border-t border-green-200 px-4 py-3 text-sm space-y-2 bg-white rounded-b-xl">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-500">שעת התחלה: </span><b dir="ltr">{entry.start_time}</b></div>
                      <div><span className="text-slate-500">שעת סיום: </span><b dir="ltr">{entry.end_time}</b></div>
                      <div><span className="text-slate-500">הפסקה: </span><b>{entry.break_minutes || 0} דק׳</b></div>
                      <div><span className="text-slate-500">סה״כ: </span><b>{fmtHours(entry.total_hours)} שעות</b></div>
                    </div>
                    <div>
                      <span className="text-slate-500">הערות: </span>
                      <span className="whitespace-pre-wrap">{entry.notes || "—"}</span>
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${(STATUS[entry.status] || STATUS.pending).cls}`}>
                        {(STATUS[entry.status] || STATUS.pending).label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
