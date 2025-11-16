import TimeEntry from './pages/TimeEntry';
import MyHours from './pages/MyHours';
import Dashboard from './pages/Dashboard';
import PayrollReportPage from './pages/PayrollReportPage';
import ManageUsers from './pages/ManageUsers';
import Layout from './Layout.jsx';


export const PAGES = {
    "TimeEntry": TimeEntry,
    "MyHours": MyHours,
    "Dashboard": Dashboard,
    "PayrollReportPage": PayrollReportPage,
    "ManageUsers": ManageUsers,
}

export const pagesConfig = {
    mainPage: "TimeEntry",
    Pages: PAGES,
    Layout: Layout,
};