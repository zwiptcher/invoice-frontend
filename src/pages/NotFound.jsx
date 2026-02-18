import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
            <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-500 mb-8">Page Not Found</h2>
        <p className="text-gray-400 max-w-xs mb-12">The page you are looking for doesn't exist or has been moved.</p>
        <Link
            to="/"
            className="flex items-center gap-2 px-8 py-3 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200"
        >
            <Home className="w-5 h-5" /> Back Home
        </Link>
    </div>
);

export default NotFound;
