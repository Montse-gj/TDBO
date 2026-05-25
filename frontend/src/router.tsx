import { createBrowserRouter, Navigate } from 'react-router-dom';
import Root from './components/Root';
import Error from './pages/Error';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Trips from './pages/Trips';
import Expenses from './pages/Expenses';
import Balance from './pages/Balance';
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
            { path: 'trips', element: <Trips /> },
            { path: 'expenses', element: <Expenses /> },
            { path: 'balance', element: <Balance /> },
            { path: 'user', element: <User /> },
        ],
    },
]);

export default router;