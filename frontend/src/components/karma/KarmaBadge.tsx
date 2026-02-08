import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '@/styles/karma.css';

interface KarmaBadgeProps {
    score: number;
    isLoading?: boolean;
}

export const KarmaBadge: React.FC<KarmaBadgeProps> = ({ score, isLoading }) => {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="w-32 h-16 rounded-xl bg-gray-800 animate-pulse mx-auto mb-4"></div>
        );
    }

    return (
        <button
            onClick={() => navigate('/karma/history')}
            className="group relative flex flex-col items-center justify-center p-4 rounded-2xl karma-badge-glow transition-transform active:scale-95 w-full max-w-[200px] mx-auto mb-6"
        >
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 animate-shimmer opacity-30"></div>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-lg">
                    {score}
                </span>
                <Star className="w-6 h-6 text-purple-400 fill-purple-400 animate-pulse" />
            </div>

            <span className="text-xs font-medium text-gray-400 mt-1 uppercase tracking-wider group-hover:text-purple-300 transition-colors">
                Trust Score
            </span>
        </button>
    );
};
