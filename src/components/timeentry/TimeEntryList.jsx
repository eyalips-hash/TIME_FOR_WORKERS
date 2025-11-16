import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const statusConfig = {
  pending: {
    label: "ממתין לאישור",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: AlertCircle,
  },
  approved: {
    label: "אושר",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
  },
  rejected: {
    label: "נדחה",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
  },
};

export default function TimeEntryList({ entries, isLoading, onEdit, onDelete }) {
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

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>טוען נתונים...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
        <CardContent className="py-16 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-xl text-slate-500 font-medium">אין דיווחי שעות עדיין</p>
          <p className="text-slate-400 mt-2">הדיווח הראשון שלך יופיע כאן</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const StatusIcon = statusConfig[entry.status]?.icon || AlertCircle;
        const canEdit = entry.status === "pending";
        
        return (
          <Card key={entry.id} className="shadow-md border-0 bg-white/90 backdrop-blur hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {format(new Date(entry.date), "d בMMMM yyyy", { locale: he })}
                    </p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(entry.created_date), "HH:mm", { locale: he })} • דווח על ידי {usersByEmail[entry.created_by] || entry.created_by}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusConfig[entry.status]?.color} border font-semibold px-3 py-1 flex items-center gap-2`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig[entry.status]?.label}
                  </Badge>
                  {canEdit && (
                    <div className="flex gap-2">
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
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">התחלה</p>
                  <p className="text-lg font-bold text-slate-900">{entry.start_time}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">סיום</p>
                  <p className="text-lg font-bold text-slate-900">{entry.end_time}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">הפסקה</p>
                  <p className="text-lg font-bold text-slate-900">{entry.break_minutes} דקות</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-blue-600 mb-1">סה״כ</p>
                  <p className="text-lg font-bold text-blue-700">{entry.total_hours?.toFixed(2)} שעות</p>
                </div>
              </div>

              {entry.notes && (
                <div className="bg-slate-50 rounded-xl p-4 border-r-4 border-blue-500">
                  <p className="text-sm text-slate-600 font-medium mb-1">הערות:</p>
                  <p className="text-slate-700">{entry.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}