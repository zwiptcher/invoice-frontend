import { useState, useEffect } from 'react';
import { createInvoice, generateInvoiceFromAI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash, Save, Sparkles } from 'lucide-react';
import axios from 'axios';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [exchangeRates, setExchangeRates] = useState({});
    const [formData, setFormData] = useState({
        clientName: '',
        clientEmail: '',
        status: 'pending',
        dueDate: '',
        items: [{ id: 1, name: '', qty: 1, price: 0 }]
    });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const { data } = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
                setExchangeRates(data.rates);
            } catch (error) {
                console.error('Error fetching exchange rates:', error);
            }
        };
        fetchRates();
    }, []);

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    };

    const handleAiGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const { data } = await generateInvoiceFromAI(aiPrompt);
            if (data.items) {
                const newItems = data.items.map(item => ({
                    ...item,
                    id: Date.now() + Math.random()
                }));
                setFormData(prev => ({ ...prev, items: newItems }));
            }
        } catch (error) {
            console.error('AI Generation failed:', error);
            const message = error.response?.data?.message || 'Failed to generate invoice. Please check backend logs.';
            alert(message);
        } finally {
            setAiLoading(false);
        }
    };

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { id: Date.now(), name: '', qty: 1, price: 0 }]
        });
    };

    const handleRemoveItem = (id) => {
        setFormData({
            ...formData,
            items: formData.items.filter(item => item.id !== id)
        });
    };

    const handleItemChange = (id, field, value) => {
        setFormData({
            ...formData,
            items: formData.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const totalUSD = calculateTotal();
            const rate = exchangeRates[currency] || 1;
            const convertedTotal = totalUSD * rate;

            await createInvoice({
                ...formData,
                amount: totalUSD,
                currency,
                exchangeRate: rate,
                convertedAmount: convertedTotal
            });
            navigate('/invoices');
        } catch (error) {
            console.error('Error creating invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Invoice</h2>

            {/* AI Generator Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800/50">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">AI Invoice Generator</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Describe your project (e.g. "Web development for bakery, 5 pages, 20 hours") and let AI fill the details.</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Describe your service..."
                                className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                            />
                            <button
                                onClick={handleAiGenerate}
                                disabled={aiLoading || !aiPrompt}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm font-medium whitespace-nowrap"
                            >
                                {aiLoading ? 'Generating...' : 'Auto-Fill'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-8 transition-colors">
                {/* Client Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Client Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                            value={formData.clientEmail}
                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            {['USD', 'EUR', 'GBP', 'INR', 'JPY'].map(curr => (
                                <option key={curr} value={curr}>{curr}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b dark:border-gray-700 pb-2">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white">Invoice Items</h3>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-end bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <div className="col-span-6 md:col-span-5">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Item Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm"
                                        value={item.name}
                                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm"
                                        value={item.qty}
                                        onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Price (USD)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md text-sm"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-1 flex justify-end pb-2">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">${calculateTotal().toFixed(2)} USD</p>
                            {currency !== 'USD' && (
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                                    ≈ {(calculateTotal() * (exchangeRates[currency] || 1)).toFixed(2)} {currency}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/invoices')}
                        className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoice;
