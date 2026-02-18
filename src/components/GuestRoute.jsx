import { Navigate, useLocation } from 'react-router-dom';

/**
 * GuestRoute component
 * Prevents authenticated users from accessing guest-only pages like Login/Register.
 */
const GuestRoute = ({ children }) => {
    const location = useLocation();
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');

    if (token && user) {
        // If logged in, redirect to dashboard or the page they were trying to access
        const from = location.state?.from?.pathname || '/dashboard';
        return <Navigate to={from} replace />;
    }

    return children;
};

export default GuestRoute;
