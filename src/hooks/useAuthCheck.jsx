import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * useAuthCheck hook
 * Monitors JWT lifetime, shows warnings, and auto-logs out on expiry.
 */
export const useAuthCheck = (onWarning) => {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    const logout = useCallback((reason = 'expired') => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        navigate(`/login?session=${reason}`);
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setIsChecking(false);
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = (decoded.exp - currentTime) * 1000;

            // 1. If already expired
            if (timeUntilExpiry <= 0) {
                logout();
                return;
            }

            // 2. Set absolute timeout for auto-logout
            const logoutTimer = setTimeout(() => {
                logout();
            }, timeUntilExpiry);

            // 3. Set warning timeout (5 minutes before expiry)
            let warningTimer = null;
            const FIVE_MINUTES = 5 * 60 * 1000;
            const timeUntilWarning = timeUntilExpiry - FIVE_MINUTES;

            if (timeUntilWarning > 0) {
                warningTimer = setTimeout(() => {
                    if (onWarning) onWarning();
                }, timeUntilWarning);
            } else if (timeUntilExpiry < FIVE_MINUTES) {
                // If already within 5 minutes, trigger warning immediately
                if (onWarning) onWarning();
            }

            setIsChecking(false);

            return () => {
                clearTimeout(logoutTimer);
                if (warningTimer) clearTimeout(warningTimer);
            };
        } catch (error) {
            console.error('Auth check failed:', error);
            logout('error');
        }
    }, [logout, onWarning]);

    return { isChecking };
};
