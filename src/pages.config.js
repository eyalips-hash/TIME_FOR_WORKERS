import TimeEntry from './pages/TimeEntry';
import MyHours from './pages/MyHours';
import Dashboard from './pages/Dashboard';
import PayrollReportPage from './pages/PayrollReportPage';
import ManageUsers from './pages/ManageUsers';
import Approvals from './pages/Approvals';
import Reports from './pages/Reports';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "TimeEntry": TimeEntry,
    "MyHours": MyHours,
    "Dashboard": Dashboard,
    "PayrollReportPage": PayrollReportPage,
    "ManageUsers": ManageUsers,
    "Approvals": Approvals,
    "Reports": Reports,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "TimeEntry",
    Pages: PAGES,
    Layout: __Layout,
};