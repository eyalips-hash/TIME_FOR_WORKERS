import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Pencil, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import MonthYearSelector from "./MonthYearSelector";

const statusConfig = {
  pending: { label: "ממתין", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "אושר", color: "bg-green-100 text-green-800" },
  rejected: { label: "נדחה", color: "bg-red-100 text-red-800" },
};

export default function EmployeeHoursTable({ entries, onUpdateStatus, onEdit, onDelete }) {
  const [selectedEmployee, setSelectedEmployee] = React.useState(null);
  const [showMonthSelector, setShowMonthSelector] = React.useState(false);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const usersByEmail = React.useMemo(() => {
    const map = {};
    users?.forEach(user => {
      map[user.email] = user.full_name || user.email;
    });
    return map;
  }, [users]);
  
  const employees = [...new Set(entries.map(e => e.created_by))];

  const handleGenerateReportClick = (employee) => {
    setSelectedEmployee(employee);
    setShowMonthSelector(true);
  };

  if (!entries || entries.length === 0) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="py-16 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-xl text-slate-500">אין דיווחי שעות</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showMonthSelector && (
        <MonthYearSelector
          employee={selectedEmployee}
          onClose={() => {
            setShowMonthSelector(false);
            setSelectedEmployee(null);
          }}
        />
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">הפקת דוחות שכר</h3>
          <div className="flex flex-wrap gap-3">
            {employees.map((employee) => (
              <Button
                key={employee}
                onClick={() => handleGenerateReportClick(employee)}
                variant="outline"
                className="bg-white hover:bg-blue-50"
              >
                <FileText className="w-4 h-4 ml-2" />
                דוח ל-{usersByEmail[employee] || employee}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900">דיווחי שעות לאישור</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-right font-bold">תאריך</TableHead>
                  <TableHead className="text-right font-bold">עובד</TableHead>
                  <TableHead className="text-right font-bold">שעות</TableHead>
                  <TableHead className="text-right font-bold">סטטוס</TableHead>
                  <TableHead className="text-right font-bold">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-semibold">
                      {format(new Date(entry.date), "d בMMMM yyyy", { locale: he })}
                    </TableCell>
                    <TableCell>{usersByEmail[entry.created_by] || entry.created_by}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{entry.start_time} - {entry.end_time}</p>
                        <p className="text-slate-500">סה״כ: {entry.total_hours?.toFixed(2)} שעות</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[entry.status]?.color}>
                        {statusConfig[entry.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {entry.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => onUpdateStatus(entry.id, "approved")}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 ml-1" />
                              אשר
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateStatus(entry.id, "rejected")}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4 ml-1" />
                              דחה
                            </Button>
                          </>
                        )}
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}