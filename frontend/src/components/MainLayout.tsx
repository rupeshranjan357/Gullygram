import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';

export const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20 ensures content is not hidden behind the fixed BottomNav */}
            <div className="max-w-2xl mx-auto min-h-screen bg-white shadow-xl relative animate-in fade-in duration-300">
                <Outlet />
            </div>
            <BottomNav />
        </div>
    );
};
