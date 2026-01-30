import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, User, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';

export const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { logout, alias } = useAuthStore();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const settingsOptions = [
        { icon: User, label: 'Account', description: 'Manage your account settings', onClick: () => { } },
        { icon: Bell, label: 'Notifications', description: 'Configure notifications', onClick: () => { } },
        { icon: Shield, label: 'Privacy', description: 'Privacy and security settings', onClick: () => { } },
        { icon: HelpCircle, label: 'Help & Support', description: 'Get help and contact support', onClick: () => { } },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Settings</h1>
                </div>
            </div>

            {/* Settings Content */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* User Info */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xl font-bold">
                        {alias?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">@{alias || 'username'}</p>
                        <p className="text-sm text-gray-500">Manage your account</p>
                    </div>
                </div>

                {/* Settings Options */}
                <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100 mb-6">
                    {settingsOptions.map((option, index) => (
                        <button
                            key={index}
                            onClick={option.onClick}
                            className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <option.icon className="w-5 h-5 text-primary-purple" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-gray-900">{option.label}</p>
                                    <p className="text-sm text-gray-500">{option.description}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    ))}
                </div>

                {/* Logout Button */}
                <div className="bg-white rounded-xl shadow-md p-4">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold">Log Out</span>
                    </button>
                </div>

                {/* App Version */}
                <p className="text-center text-gray-400 text-sm mt-8">
                    GullyGram v1.0.0 • Week 2
                </p>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <LogOut className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Log Out?</h2>
                        <p className="text-gray-600 mb-6">Are you sure you want to log out of your account?</p>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowLogoutConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1 !bg-red-600 hover:!bg-red-700"
                                onClick={handleLogout}
                            >
                                Log Out
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
