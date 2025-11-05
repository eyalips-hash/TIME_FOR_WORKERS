import TimeEntry from './pages/TimeEntry';
import MyHours from './pages/MyHours';
import Dashboard from './pages/Dashboard';
import Layout from './Layout.jsx';


export const PAGES = {
    "TimeEntry": TimeEntry,
    "MyHours": MyHours,
    "Dashboard": Dashboard,
}

export const pagesConfig = {
    mainPage: "TimeEntry",
    Pages: PAGES,
    Layout: Layout,
};