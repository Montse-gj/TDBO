import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import router from './router.tsx';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('#root element was not found');
}

createRoot(rootElement).render(
  <RouterProvider router={router} />
);