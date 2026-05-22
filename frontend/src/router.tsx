import { createBrowserRouter, Navigate } from 'react-router-dom';
import Root from './components/Root';
import Error from './pages/Error';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: 'page3', element: <Page3 /> },
            { path: 'page4', element: <Page4 /> },
            { path: 'page5', element: <Page5 /> },
            { path: 'user', element: <User /> },
        ],
    },
]);

export default router;