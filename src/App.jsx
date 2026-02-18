import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence } from 'framer-motion';

// Context
import { ThemeProvider } from './context/ThemeContext';

// Components
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import PageTransition from './components/PageTransition';
import LoadingBar from './components/LoadingBar';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import CreateInvoice from './pages/CreateInvoice';
import InvoiceDetails from './pages/InvoiceDetails';
import Analytics from './pages/Analytics';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AuthTestPage from './pages/AuthTestPage';

const isDev = import.meta.env.MODE === 'development';

/**
 * Root Layout
 * Handles global components like Sidebar, LoadingBar, and ToastContainer.
 */
const RootLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <LoadingBar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <div className="print:hidden">
        <Sidebar />
      </div>

      <main className="flex-1 md:ml-64 p-8 print:ml-0 print:p-0">
        <AnimatePresence mode="wait">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
};

/**
 * Auth Layout
 * Used for Login, Register, Forget Password without the Sidebar.
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <LoadingBar />
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/login',
        element: <GuestRoute><Login /></GuestRoute>
      },
      {
        path: '/register',
        element: <GuestRoute><Register /></GuestRoute>
      },
      {
        path: '/forgot-password',
        element: <GuestRoute><ForgotPassword /></GuestRoute>
      }
    ]
  },
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: 'invoices',
        element: <ProtectedRoute><InvoiceList /></ProtectedRoute>
      },
      {
        path: 'invoices/create',
        element: <ProtectedRoute><CreateInvoice /></ProtectedRoute>
      },
      {
        path: 'invoices/:id',
        element: <ProtectedRoute><InvoiceDetails /></ProtectedRoute>
      },
      {
        path: 'analytics',
        element: <ProtectedRoute><Analytics /></ProtectedRoute>
      },
      // Dev-only routes
      ...(isDev ? [{
        path: 'test-auth',
        element: <AuthTestPage />
      }] : []),
      {
        path: 'settings',
        element: <ProtectedRoute><Settings /></ProtectedRoute>
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]);

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-client-id';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
