import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Clock, Pencil, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const statusConfig = {
  pending: { label: "ממתין", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  approved: { label: "אושר", color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { label: "נדחה", color: "bg-red-100 text-red-800", icon: XCircle },
};

export default function MonthlyHoursTable({ entries, onUpdateStatus, onEdit, onDelete }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const { data: closedMonths } = useQuery({
    queryKey: ['closedMonths'],
    queryFn: () => base44.entities.ClosedMonth.list(),
    initialData: [],
  });

  const isMonthClosed = (entry) => {
    const entryDate = new Date(entry.date);
    const entryMonth = entryDate.getMonth();
    const entryYear = entryDate.getFullYear();
    return closedMonths?.some(
      cm => cm.employee === entry.employee_email && cm.month === entryMonth && cm.year === entryYear
    );
  };

  const usersByEmail = React.useMemo(() => {
    const map = {};
    users?.forEach(user => {
      map[user.email] = user.full_name || user.email;
    });
    return map;
  }, [users]);

  const entriesByEmployee = React.useMemo(() => {
    const grouped = {};
    entries?.forEach(entry => {
      const entryDate = new Date(entry.date);
      if (entryDate >= monthStart && entryDate <= monthEnd && entry.employee_email) {
        if (!grouped[entry.employee_email]) {
          grouped[entry.employee_email] = [];
        }
        grouped[entry.employee_email].push(entry);
      }
    });
    return grouped;
  }, [entries, monthStart, monthEnd]);

  const totalHours = React.useMemo(() => {
    return entries
      ?.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart && entryDate <= monthEnd && entry.employee_email;
      })
      .reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
  }, [entries, monthStart, monthEnd]);

  const approvedHours = React.useMemo(() => {
    return entries
      ?.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= monthStart && entryDate <= monthEnd && entry.status === "approved" && entry.employee_email;
      })
      .reduce((sum, entry) => sum + (entry.total_hours || 0), 0) || 0;
  }, [entries, monthStart, monthEnd]);

  const nextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const today = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation Header */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-600" />
              טבלת שעות חודשית
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" onClick={today} className="px-4">
                {format(currentMonth, "MMMM yyyy", { locale: he })}
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border-r-4 border-blue-500">
              <p className="text-sm text-blue-600 mb-1">סה״כ שעות</p>
              <p className="text-3xl font-bold text-blue-900">{totalHours.toFixed(1)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-r-4 border-green-500">
              <p className="text-sm text-green-600 mb-1">שעות מאושרות</p>
              <p className="text-3xl font-bold text-green-900">{approvedHours.toFixed(1)}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border-r-4 border-purple-500">
              <p className="text-sm text-purple-600 mb-1">ימי עבודה</p>
              <p className="text-3xl font-bold text-purple-900">
                {entries?.filter(e => {
                  const entryDate = new Date(e.date);
                  return entryDate >= monthStart && entryDate <= monthEnd && e.employee_email;
                }).length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Tables */}
      {Object.entries(entriesByEmployee).map(([employee, employeeEntries]) => {
        const entriesByDate = {};
        employeeEntries.forEach(entry => {
          const dateKey = format(new Date(entry.date), "yyyy-MM-dd");
          entriesByDate[dateKey] = entry;
        });

        const employeeTotalHours = employeeEntries.reduce((sum, e) => sum + (e.total_hours || 0), 0);
        const employeeApprovedHours = employeeEntries
          .filter(e => e.status === "approved")
          .reduce((sum, e) => sum + (e.total_hours || 0), 0);

        return (
          <Card key={employee} className="shadow-lg border-0 bg-white/90 backdrop-blur">
            <CardHeader className="border-b border-slate-100 bg-slate-50">
              <CardTitle className="text-xl font-bold text-slate-900">
                {usersByEmail[employee] || employee}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Days Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-right font-bold w-32">תאריך</TableHead>
                      <TableHead className="text-right font-bold">יום</TableHead>
                      <TableHead className="text-right font-bold">שעות</TableHead>
                      <TableHead className="text-right font-bold">זמנים</TableHead>
                      <TableHead className="text-right font-bold">סטטוס</TableHead>
                      <TableHead className="text-right font-bold">הערות</TableHead>
                      {(onEdit || onUpdateStatus || onDelete) && (
                        <TableHead className="text-right font-bold">פעולות</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {daysInMonth.map((day) => {
                      const dateKey = format(day, "yyyy-MM-dd");
                      const entry = entriesByDate[dateKey];
                      const isToday = isSameDay(day, new Date());
                      const isWeekend = day.getDay() === 5 || day.getDay() === 6;

                      return (
                        <TableRow 
                          key={dateKey} 
                          className={`
                            ${isToday ? "bg-blue-50 border-r-4 border-blue-500" : ""}
                            ${isWeekend ? "bg-slate-50" : ""}
                            ${entry ? "hover:bg-slate-50" : ""}
                            transition-colors
                          `}
                        >
                          <TableCell className="font-semibold">
                            <div className="flex items-center gap-2">
                              {isToday && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                              {format(day, "d/M")}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">
                            {format(day, "EEEE", { locale: he })}
                          </TableCell>
                          <TableCell>
                            {entry ? (
                              <span className="font-bold text-lg text-slate-900">
                                {entry.total_hours?.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {entry ? (
                              <div className="text-sm">
                                <span className="font-medium">{entry.start_time}</span>
                                <span className="text-slate-400 mx-1">←</span>
                                <span className="font-medium">{entry.end_time}</span>
                                {entry.break_minutes > 0 && (
                                  <span className="text-slate-500 text-xs mr-2">
                                    (הפסקה: {entry.break_minutes}')
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {entry ? (
                              <Badge className={`${statusConfig[entry.status]?.color} flex items-center gap-1 w-fit`}>
                                {React.createElement(statusConfig[entry.status]?.icon, { className: "w-3 h-3" })}
                                {statusConfig[entry.status]?.label}
                              </Badge>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {entry?.notes ? (
                              <span className="text-sm text-slate-600">{entry.notes}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </TableCell>
                          {(onEdit || onUpdateStatus || onDelete) && (
                            <TableCell>
                              {entry ? (
                                <div className="flex gap-2">
                                  {!isMonthClosed(entry) ? (
                                    <>
                                      {onEdit && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => onEdit(entry)}
                                          className="hover:bg-blue-50"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </Button>
                                      )}
                                      {onUpdateStatus && entry.status !== "approved" && (
                                        <Button
                                          size="sm"
                                          onClick={() => onUpdateStatus(entry.id, "approved")}
                                          className="bg-green-500 hover:bg-green-600"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                        </Button>
                                      )}
                                      {onUpdateStatus && entry.status !== "rejected" && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => onUpdateStatus(entry.id, "rejected")}
                                          className="text-red-600 hover:bg-red-50"
                                        >
                                          <XCircle className="w-4 h-4" />
                                        </Button>
                                      )}
                                      {onDelete && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => onDelete(entry.id)}
                                          className="hover:bg-red-50 text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </>
                                  ) : (
                                    <Badge variant="outline" className="text-slate-500 text-xs">חודש סגור</Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </TableCell>
                          )}
                          </TableRow>
                          );
                          })}
                          </TableBody>
                </Table>
              </div>

              {/* Employee Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      סיכום {usersByEmail[employee] || employee}
                    </p>
                    <p className="text-xs text-slate-600">
                      {employeeEntries.length} ימי עבודה
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-600">סה״כ שעות</p>
                    <p className="text-2xl font-bold text-blue-900">{employeeTotalHours.toFixed(1)}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-green-600">שעות מאושרות</p>
                    <p className="text-2xl font-bold text-green-900">{employeeApprovedHours.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}