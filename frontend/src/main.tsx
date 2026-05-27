import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import router from './router.tsx';
import './styles/index.css';
import "./styles/dashboard.css";
import './styles/NavBar.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root element was not found');
}

createRoot(rootElement).render(
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);