import { Settings as SettingsIcon, Bell, Shield, Palette, User } from 'lucide-react';

const Settings = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and app settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-2">
                <nav className="space-y-1">
                    {[
                        { icon: User, label: 'Profile' },
                        { icon: Bell, label: 'Notifications' },
                        { icon: Shield, label: 'Security' },
                        { icon: Palette, label: 'Appearance' },
                    ].map((item, i) => (
                        <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${i === 0 ? 'bg-violet-600 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                            <item.icon className="w-4 h-4" /> {item.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-20 h-20 rounded-3xl bg-violet-100 text-violet-600 flex items-center justify-center text-3xl font-black">J</div>
                            <button className="px-4 py-2 text-sm font-bold text-violet-600 border-2 border-violet-100 rounded-xl hover:bg-violet-50 transition-colors">Change Avatar</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                                <input type="text" className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-violet-600 rounded-xl outline-none transition-all text-sm" defaultValue="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                                <input type="email" className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-violet-600 rounded-xl outline-none transition-all text-sm" defaultValue="john@example.com" />
                            </div>
                        </div>
                        <button className="px-8 py-3 bg-violet-600 text-white rounded-2xl font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-200">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Settings;
