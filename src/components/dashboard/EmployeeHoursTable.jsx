import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const statusConfig = {
  pending: { label: "ממתין", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "אושר", color: "bg-green-100 text-green-800" },
  rejected: { label: "נדחה", color: "bg-red-100 text-red-800" },
};

export default function EmployeeHoursTable({ entries, onUpdateStatus }) {
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
                  <TableCell>{entry.created_by}</TableCell>
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
                    {entry.status === "pending" && (
                      <div className="flex gap-2">
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
                      </div>
                    )}
                    {entry.status !== "pending" && (
                      <span className="text-sm text-slate-500">
                        {entry.status === "approved" ? "אושר" : "נדחה"}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}