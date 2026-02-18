import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceById } from '../services/api';
import { Printer, ArrowLeft, Mail, CheckCircle, XCircle, Loader2, Link, Unlink } from 'lucide-react';
import axios from 'axios';

const API_BASE = "https://invoice-backend-wku1.onrender.com";

const InvoiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [gmailConnected, setGmailConnected] = useState(false);
    const [sending, setSending] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    };

    const checkGmailStatus = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/auth/status`);
            setGmailConnected(data.connected);
        } catch {
            setGmailConnected(false);
        }
    }, []);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const { data } = await getInvoiceById(id);
                setInvoice(data);
            } catch (error) {
                console.error('Error fetching invoice:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
        checkGmailStatus();

        // Check for OAuth callback params
        const params = new URLSearchParams(window.location.search);
        if (params.get('gmail_connected') === 'true') {
            showToast('success', 'Gmail connected successfully!');
            window.history.replaceState({}, '', window.location.pathname);
            checkGmailStatus();
        } else if (params.get('gmail_error')) {
            showToast('error', 'Failed to connect Gmail. Please try again.');
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [id, checkGmailStatus]);

    const handleConnectGmail = () => {
        window.location.href = `${API_BASE}/auth/google`;
    };

    const handleDisconnectGmail = async () => {
        try {
            await axios.delete(`${API_BASE}/auth/disconnect`);
            setGmailConnected(false);
            showToast('success', 'Gmail disconnected.');
        } catch {
            showToast('error', 'Failed to disconnect Gmail.');
        }
    };

    const handleSendEmail = async () => {
        if (!invoice.clientEmail) {
            showToast('error', 'This invoice has no client email address.');
            return;
        }
        setSending(true);
        try {
            const { data } = await axios.post(`${API_BASE}/api/email/send`, { invoiceId: invoice._id });
            showToast('success', data.message || 'Invoice sent successfully!');
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to send email.';
            showToast('error', msg);
        } finally {
            setSending(false);
        }
    };

    const handlePrint = () => window.print();

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading invoice...</div>;
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 print:max-w-none print:mx-0 print:space-y-0">

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-white text-sm font-medium transition-all animate-fade-in ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.type === 'success'
                        ? <CheckCircle className="w-5 h-5 shrink-0" />
                        : <XCircle className="w-5 h-5 shrink-0" />
                    }
                    {toast.message}
                </div>
            )}

            {/* Header Actions - Hidden when printing */}
            <div className="flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate('/invoices')}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </button>
                <div className="flex gap-3 items-center">
                    {/* Gmail Connect / Disconnect */}
                    {gmailConnected ? (
                        <button
                            onClick={handleDisconnectGmail}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                        >
                            <Unlink className="w-4 h-4 text-green-500" />
                            Gmail Connected
                        </button>
                    ) : (
                        <button
                            onClick={handleConnectGmail}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-sm shadow-sm"
                        >
                            <Link className="w-4 h-4" />
                            Connect Gmail
                        </button>
                    )}

                    {/* Send via Gmail */}
                    <button
                        onClick={handleSendEmail}
                        disabled={!gmailConnected || sending}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                            : <><Mail className="w-4 h-4" /> Send via Gmail</>
                        }
                    </button>

                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Printer className="w-4 h-4" /> Print / PDF
                    </button>
                </div>
            </div>

            {/* Gmail info banner if no email */}
            {!invoice.clientEmail && (
                <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-300 text-sm print:hidden">
                    <XCircle className="w-5 h-5 shrink-0" />
                    This invoice has no client email. Add one to enable Gmail sending.
                </div>
            )}

            {/* Invoice Printable Area */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 print:shadow-none print:border-0 print:p-0 transition-colors">
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center print:bg-indigo-600">
                                <span className="text-white font-bold text-xl">I</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white print:text-gray-900">InvoiceMgr</h1>
                        </div>
                        <address className="not-italic text-gray-500 dark:text-gray-400 text-sm print:text-gray-500">
                            123 Business Avenue<br />
                            Tech City, TC 90210<br />
                            support@invoicemgr.com
                        </address>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold text-indigo-100 dark:text-indigo-900/30 mb-2 print:text-gray-200">INVOICE</h2>
                        <div className="text-gray-600 dark:text-gray-300 print:text-gray-600">
                            <span className="font-medium">Invoice #:</span> {invoice._id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 print:text-gray-600">
                            <span className="font-medium">Date:</span> {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 print:text-gray-600">
                            <span className="font-medium">Due Date:</span> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Due on Receipt'}
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-700/30 rounded-lg print:bg-gray-50/50">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
                    <div className="text-gray-900 dark:text-white font-bold text-lg mb-1 print:text-gray-900">{invoice.clientName}</div>
                    <div className="text-gray-600 dark:text-gray-300 print:text-gray-600">{invoice.clientEmail}</div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-12">
                    <thead>
                        <tr className="border-b-2 border-gray-100 dark:border-gray-700 print:border-gray-100">
                            <th className="py-3 text-left font-semibold text-gray-600 dark:text-gray-400 print:text-gray-600">Description</th>
                            <th className="py-3 text-right font-semibold text-gray-600 dark:text-gray-400 print:text-gray-600">Qty</th>
                            <th className="py-3 text-right font-semibold text-gray-600 dark:text-gray-400 print:text-gray-600">Price</th>
                            <th className="py-3 text-right font-semibold text-gray-600 dark:text-gray-400 print:text-gray-600">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 print:divide-gray-100">
                        {invoice.items.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4 text-gray-900 dark:text-white print:text-gray-900">{item.name}</td>
                                <td className="py-4 text-right text-gray-600 dark:text-gray-300 print:text-gray-600">{item.qty}</td>
                                <td className="py-4 text-right text-gray-600 dark:text-gray-300 print:text-gray-600">${Number(item.price).toFixed(2)}</td>
                                <td className="py-4 text-right font-medium text-gray-900 dark:text-white print:text-gray-900">
                                    ${(Number(item.qty) * Number(item.price)).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-80 space-y-4">
                        <div className="flex justify-between text-gray-600 dark:text-gray-300 print:text-gray-600">
                            <span>Subtotal (USD)</span>
                            <span>${Number(invoice.amount).toFixed(2)}</span>
                        </div>
                        {invoice.currency && invoice.currency !== 'USD' && (
                            <div className="flex justify-between text-gray-600 dark:text-gray-300 print:text-gray-600">
                                <span>Exchange Rate (1 USD)</span>
                                <span>{Number(invoice.exchangeRate).toFixed(4)} {invoice.currency}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-gray-600 dark:text-gray-300 print:text-gray-600">
                            <span>Tax (0%)</span>
                            <span>$0.00</span>
                        </div>

                        <div className="pt-4 border-t-2 border-gray-100 dark:border-gray-700 print:border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-gray-900 dark:text-white print:text-gray-900">Total (USD)</span>
                                <span className="font-bold text-xl text-gray-900 dark:text-white print:text-gray-900">${Number(invoice.amount).toFixed(2)}</span>
                            </div>

                            {invoice.currency && invoice.currency !== 'USD' && (
                                <div className="flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg mt-2 print:bg-transparent print:p-0">
                                    <span className="font-bold text-indigo-900 dark:text-indigo-200 print:text-indigo-900">Total ({invoice.currency})</span>
                                    <span className="font-bold text-2xl text-indigo-600 dark:text-indigo-300 print:text-indigo-600">
                                        {Number(invoice.convertedAmount).toFixed(2)} {invoice.currency}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-700 print:border-gray-100 text-center text-gray-500 dark:text-gray-400 text-sm print:text-gray-500">
                    <p>Thank you for your business!</p>
                    <p className="mt-2 text-xs">Payment is due within 30 days. Please make checks payable to InvoiceMgr Inc.</p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;
