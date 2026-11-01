import { useAuth } from '@/lib/AuthContext';

// מנהל = משתמש עם תפקיד admin (אייל). העובד (אנדרי) הוא user.
export const ADMIN_ONLY_PAGES = [
  'Dashboard',
  'BulkTimeEntry',
  'Approvals',
  'Reports',
  'PayrollReportPage',
  'ManageUsers',
];

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'admin';
}
