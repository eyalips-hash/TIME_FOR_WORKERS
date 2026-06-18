import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function ApprovalsPage() {
  const queryClient = useQueryClient();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['pendingEntries'],
    queryFn: () => base44.entities.TimeEntry.filter({ status: 'pending' }, '-date'),
    initialData: [],
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.TimeEntry.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingEntries'] });
      queryClient.invalidateQueries({ queryKey: ['allTimeEntries'] });
    },
  });

  const approveAll = () => {
    entries.forEach(entry => updateStatusMutation.mutate({ id: entry.id, status: 'approved' }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">אישור דיווחים</h1>
            <p className="text-lg text-slate-600">
              {entries.length > 0 ? `${entries.length} דיווחים ממתינים לאישור` : 'אין דיווחים ממתינים'}
            </p>
          </div>
          {entries.length > 0 && (
            <Button onClick={approveAll} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-5 h-5 ml-2" />
              אשר הכל ({entries.length})
            </Button>
          )}
        </div>

        {entries.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="py-16 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <p className="text-xl text-slate-500">אין דיווחים ממתינים לאישור</p>
              <p className="text-slate-400 mt-2">כל הדיווחים אושרו</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-right font-bold">תאריך</TableHead>
                      <TableHead className="text-right font-bold">שעות</TableHead>
                      <TableHead className="text-right font-bold">סה״כ</TableHead>
                      <TableHead className="text-right font-bold">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>{format(new Date(entry.date), "dd/MM/yy")}</TableCell>
                        <TableCell>
                          <span className="font-medium">{entry.start_time}</span>
                          <span className="text-slate-400 mx-1">-</span>
                          <span className="font-medium">{entry.end_time}</span>
                        </TableCell>
                        <TableCell className="font-bold text-lg">{entry.total_hours?.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => updateStatusMutation.mutate({ id: entry.id, status: 'approved' })} className="bg-green-500 hover:bg-green-600" disabled={updateStatusMutation.isPending}>
                              <CheckCircle className="w-4 h-4 ml-1" />אשר
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateStatusMutation.mutate({ id: entry.id, status: 'rejected' })} className="text-red-600 hover:bg-red-50" disabled={updateStatusMutation.isPending}>
                              <XCircle className="w-4 h-4 ml-1" />דחה
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}