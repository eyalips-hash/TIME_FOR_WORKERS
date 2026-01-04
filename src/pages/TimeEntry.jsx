import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TimeEntryForm from "../components/timeentry/TimeEntryForm";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function TimeEntryPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setIsAdmin(u?.role === 'admin');
    });
  }, []);

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
    enabled: isAdmin,
  });

  const { data: existingEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ['myTimeEntries', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.TimeEntry.filter({ employee_email: user.email });
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: closedMonths } = useQuery({
    queryKey: ['closedMonths', user?.email],
    queryFn: () => base44.entities.ClosedMonth.filter({ employee: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const createEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.TimeEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      queryClient.invalidateQueries({ queryKey: ['myTimeEntries'] });
      setShowSuccess(true);
      setError(null);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(createPageUrl("MyHours"));
      }, 2000);
    },
    onError: (err) => {
      setError("שגיאה בשמירת הדיווח");
    }
  });

  const handleSubmit = (data) => {
    // אם אין employee_email, השתמש במשתמש הנוכחי (לעובדים רגילים)
    if (!data.employee_email) {
      if (isAdmin) {
        setError("חובה לבחור עובד");
        return;
      }
      data.employee_email = user?.email;
    }

    const entryDate = new Date(data.date);
    const entryMonth = entryDate.getMonth();
    const entryYear = entryDate.getFullYear();

    // בדיקה שהחודש לא סגור
    const isMonthClosed = closedMonths?.some(
      cm => cm.employee === data.employee_email && cm.month === entryMonth && cm.year === entryYear
    );

    if (isMonthClosed) {
      setError("לא ניתן לדווח - החודש נסגר על ידי המנהל.");
      return;
    }

    // בדיקה שאין דיווח כפול לאותו יום
    const dateExists = existingEntries?.some(
      entry => entry.date === data.date && entry.employee_email === data.employee_email
    );
    
    if (dateExists) {
      setError("כבר קיים דיווח לתאריך זה עבור העובד.");
      return;
    }

    setError(null);
    createEntryMutation.mutate(data);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">דיווח שעות עבודה</h1>
          <p className="text-lg text-slate-600">מלא את פרטי העבודה שלך להיום</p>
        </div>

        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-6 flex items-center gap-4 animate-in slide-in-from-top">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-green-900">הדיווח נשמר בהצלחה!</p>
              <p className="text-green-700">מעביר אותך לדף השעות שלך...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-900">שגיאה</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <TimeEntryForm
          onSubmit={handleSubmit}
          isSubmitting={createEntryMutation.isPending}
          isAdmin={isAdmin}
          currentUser={user}
        />
      </div>
    </div>
  );
}