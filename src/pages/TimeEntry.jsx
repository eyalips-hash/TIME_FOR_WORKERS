import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TimeEntryForm from "../components/timeentry/TimeEntryForm";
import { CheckCircle } from "lucide-react";

export default function TimeEntryPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = React.useState(false);

  const createEntryMutation = useMutation({
    mutationFn: (data) => base44.entities.TimeEntry.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate(createPageUrl("MyHours"));
      }, 2000);
    },
  });

  const handleSubmit = (data) => {
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

        <TimeEntryForm
          onSubmit={handleSubmit}
          isSubmitting={createEntryMutation.isPending}
        />

        {createEntryMutation.isError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-900 font-semibold">שגיאה בשמירת הדיווח</p>
            <p className="text-red-700 text-sm mt-1">אנא נסה שוב</p>
          </div>
        )}
      </div>
    </div>
  );
}