import Approvals from './pages/Approvals';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ManageUsers from './pages/ManageUsers';
import MyHours from './pages/MyHours';
import PayrollReportPage from './pages/PayrollReportPage';
import Reports from './pages/Reports';
import TimeEntry from './pages/TimeEntry';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Approvals": Approvals,
    "Dashboard": Dashboard,
    "Home": Home,
    "ManageUsers": ManageUsers,
    "MyHours": MyHours,
    "PayrollReportPage": PayrollReportPage,
    "Reports": Reports,
    "TimeEntry": TimeEntry,
}

export const pagesConfig = {
    mainPage: "TimeEntry",
    Pages: PAGES,
    Layout: __Layout,
};