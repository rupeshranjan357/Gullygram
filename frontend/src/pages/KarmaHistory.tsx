import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, User, Users, LogIn, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { karmaService } from '@/services/karmaService';
import { useAuthStore } from '@/store/authStore';
import { KarmaTransaction } from '@/types/karma.types';
import '@/styles/karma.css';

export const KarmaHistory: React.FC = () => {
    const navigate = useNavigate();
    // const { user } = useAuthStore();

    const { data: history, isLoading } = useQuery({
        queryKey: ['karma-history'],
        queryFn: karmaService.getKarmaHistory,
    });

    const { data: score } = useQuery({
        queryKey: ['karma-score'],
        queryFn: karmaService.getKarmaScore,
    });

    // Helper to get icon and color based on source type
    const getTransactionStyle = (type: KarmaTransaction['sourceType']) => {
        switch (type) {
            case 'VIBE_CHECK':
                return { icon: <Star size={18} />, color: 'text-green-400', bg: 'bg-green-400/10' };
            case 'HUDDLE_HOST':
                return { icon: <Users size={18} />, color: 'text-blue-400', bg: 'bg-blue-400/10' };
            case 'DAILY_LOGIN':
                return { icon: <LogIn size={18} />, color: 'text-purple-400', bg: 'bg-purple-400/10' };
            default:
                return { icon: <TrendingUp size={18} />, color: 'text-gray-400', bg: 'bg-gray-400/10' };
        }
    };

    const formatSourceType = (type: string) => {
        return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="min-h-screen bg-[#1a1a2e] text-white font-sans">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#1a1a2e]/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-white/5">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Karma History</h1>
            </div>

            <div className="p-6">
                {/* Total Score Card */}
                <div className="bg-[#242442] rounded-3xl p-6 mb-8 relative overflow-hidden border border-white/5 shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex items-center gap-2 text-purple-300 mb-1">
                            <TrendingUp size={20} />
                            <span className="text-sm font-medium uppercase tracking-wider">Trending Up</span>
                        </div>
                        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mt-2 mb-2">
                            {score ?? '...'}
                        </div>
                        <div className="text-gray-400 text-sm">Total Karma Points</div>
                    </div>
                </div>

                {/* Transaction List */}
                <h3 className="text-lg font-bold mb-4 px-2">Recent Activity</h3>

                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-gray-800/50 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : history && history.length > 0 ? (
                    <div className="space-y-3">
                        {history.map((tx) => {
                            const style = getTransactionStyle(tx.sourceType);
                            return (
                                <div key={tx.id} className="bg-[#242442] p-4 rounded-xl flex items-center justify-between border border-white/5 hover:border-purple-500/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${style.bg} ${style.color}`}>
                                            {style.icon}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">
                                                {tx.description || formatSourceType(tx.sourceType)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        <User size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No karma history yet.<br />Start joining Huddles!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
