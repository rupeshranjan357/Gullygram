import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusCircle, User, Users, MessageCircle } from 'lucide-react';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/feed', icon: Home, label: 'Feed' },
        { path: '/discover', icon: Users, label: 'Discover' },
        { path: '/messages', icon: MessageCircle, label: 'Messages' },
        { path: '/create-post', icon: PlusCircle, label: 'Create' },
        { path: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
            <div className="max-w-2xl mx-auto flex items-center justify-around py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={clsx(
                                'flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-all',
                                isActive
                                    ? 'text-primary-purple'
                                    : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            <Icon
                                className={clsx(
                                    'w-6 h-6 transition-all',
                                    isActive && 'scale-110'
                                )}
                            />
                            <span
                                className={clsx(
                                    'text-xs font-semibold',
                                    isActive && 'font-bold'
                                )}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
