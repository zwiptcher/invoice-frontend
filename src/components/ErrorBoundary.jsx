import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

const ErrorBoundary = () => {
    const error = useRouteError();
    console.error('Routing Error:', error);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-gray-900">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mb-8">
                <AlertOctagon className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-10">
                An unexpected error occurred while navigating. Our team has been notified.
                <br />
                <code className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded mt-4 inline-block text-red-500">
                    {error?.message || 'Unknown routing error'}
                </code>
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all"
                >
                    <RefreshCw className="w-4 h-4" /> Reload Page
                </button>
                <Link
                    to="/"
                    className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                    <Home className="w-4 h-4" /> Go Home
                </Link>
            </div>
        </div>
    );
};

export default ErrorBoundary;
