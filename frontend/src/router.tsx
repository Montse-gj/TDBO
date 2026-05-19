import { createBrowserRouter } from 'react-router';
import { Navigate } from 'react-router';
import Root from './components/Root';
import Error from './pages/Error';
import Home from './pages/Home';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Page4 from './pages/Page4';
import Page5 from './pages/Page5';
import User from './pages/User';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Root />,
        errorElement: <Error />,
        children: [
            { index: true, element: <Navigate to="/home" /> },
            { path: 'home', element: <Home /> },
            { path: 'page1', element: <Page1 /> },
            { path: 'page2', element: <Page2 /> },
            { path: 'page3', element: <Page3 /> },
            { path: 'page4', element: <Page4 /> },
            { path: 'page5', element: <Page5 /> },
            { path: 'user', element: <User /> },
        ],
    },
]);

export default router;