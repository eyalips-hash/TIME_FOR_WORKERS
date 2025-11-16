import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, UserCheck, UserX } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ManageUsersPage() {
  const queryClient = useQueryClient();
  const [deleteUserId, setDeleteUserId] = React.useState(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => base44.entities.User.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUserId(null);
    },
    onError: (error) => {
      alert("שגיאה במחיקת המשתמש");
      setDeleteUserId(null);
    }
  });

  const handleDeleteClick = (userId) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  const userToDelete = users?.find(u => u.id === deleteUserId);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-600" />
            ניהול עובדים
          </h1>
          <p className="text-lg text-slate-600">צפייה ומחיקת עובדים במערכת</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-900">
              רשימת עובדים ({users?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">טוען נתונים...</div>
            ) : users?.length === 0 ? (
              <div className="p-12 text-center">
                <UserX className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-xl text-slate-500">אין עובדים במערכת</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-right font-bold">שם מלא</TableHead>
                      <TableHead className="text-right font-bold">אימייל</TableHead>
                      <TableHead className="text-right font-bold">תפקיד</TableHead>
                      <TableHead className="text-right font-bold">תאריך הצטרפות</TableHead>
                      <TableHead className="text-right font-bold">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow">
                              <span className="text-white font-bold">
                                {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                              </span>
                            </div>
                            {user.full_name || "ללא שם"}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
                            {user.role === 'admin' ? '👔 מנהל' : '👤 עובד'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {user.created_date ? format(new Date(user.created_date), "d בMMMM yyyy", { locale: he }) : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(user.id)}
                            className="hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            מחק
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>האם למחוק את העובד?</AlertDialogTitle>
              <AlertDialogDescription>
                פעולה זו אינה ניתנת לביטול. העובד {userToDelete?.full_name || userToDelete?.email} יימחק לצמיתות מהמערכת.
                כל דיווחי השעות שלו יישארו במערכת.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ביטול</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                מחק עובד
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}