import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Users, MessageCircle, Bell, PlusSquare } from 'lucide-react';
import clsx from 'clsx';
import notificationService from '../services/notificationService';

interface NavItem {
    path: string;
    icon: React.ElementType;
    label: string;
    badge?: number;
}

export const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Initial load
        loadUnreadCount();

        // Poll every 15 seconds
        const interval = setInterval(() => {
            loadUnreadCount();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading unread count:', error);
        }
    };

    const navItems: NavItem[] = [
        { path: '/feed', icon: Home, label: 'Home' },
        { path: '/search', icon: Search, label: 'Search' },
        { path: '/create-post', icon: PlusSquare, label: 'Create' },
        { path: '/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
        { path: '/messages', icon: MessageCircle, label: 'Messages' },
        { path: '/profile', icon: Users, label: 'Profile' }, // Changed Icon to User or Users? Previous was User.
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
                                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all relative',
                                isActive
                                    ? 'text-primary-purple'
                                    : 'text-gray-600 hover:text-gray-900'
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    className={clsx(
                                        'w-6 h-6 transition-all',
                                        isActive && 'scale-110'
                                    )}
                                />
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>
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
