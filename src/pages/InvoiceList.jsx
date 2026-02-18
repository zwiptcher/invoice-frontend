import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInvoices, deleteInvoice } from '../services/api';
import { Trash2, Eye, Filter } from 'lucide-react';

const InvoiceList = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            const { data } = await getInvoices();
            setInvoices(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await deleteInvoice(id);
            setInvoices(invoices.filter(i => i._id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const filteredInvoices = filter === 'all'
        ? invoices
        : invoices.filter(inv => inv.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Invoices</h2>
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-0 overflow-hidden transition-colors">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Client</th>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filteredInvoices.map((inv) => (
                            <tr key={inv._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{inv.clientName}</td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {new Date(inv.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-gray-900 dark:text-white">${Number(inv.amount).toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium capitalize ${inv.status === 'paid'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/invoices/${inv._id}`)}
                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                            title="View Invoice"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(inv._id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredInvoices.length === 0 && (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No invoices found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoiceList;
