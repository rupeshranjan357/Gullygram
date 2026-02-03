import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Zap } from 'lucide-react';

interface AreaVote {
    areaName: string;
    voteCount: number;
}

export const LaunchDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState<AreaVote[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8080/api/growth/leaderboard')
            .then(res => res.json())
            .then(data => {
                setLeaderboard(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch leaderboard", err);
                setIsLoading(false);
            });
    }, []);

    // Active (Beta) Zones are hardcoded for visual contrast
    const activeZones = [
        { name: "Whitefield", status: "LIVE 🟢" },
        { name: "Marathahalli", status: "LIVE 🟢" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <div className="bg-primary-purple text-white p-6 pb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <Zap className="w-64 h-64" />
                </div>

                <div className="relative z-10">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-bold mb-2">Launch Dashboard</h1>
                    <p className="text-purple-100 max-w-xs">
                        See which Gully is winning the race to join the platform!
                    </p>
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 -mt-8 relative z-20">
                {/* Live Zones Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-green-500">
                    <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">
                        Currently Live
                    </h2>
                    <div className="space-y-3">
                        {activeZones.map(zone => (
                            <div key={zone.name} className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                                <span className="font-bold text-gray-900">{zone.name}</span>
                                <span className="text-xs font-bold text-green-700 bg-white px-2 py-1 rounded-full shadow-sm">
                                    {zone.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Leaderboard Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                            Waitlist Leaderboard
                        </h2>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>

                    {isLoading ? (
                        <div className="text-center py-8 text-gray-400">Loading stats...</div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">No votes yet! Be the first.</div>
                    ) : (
                        <div className="space-y-4">
                            {leaderboard.map((area, index) => (
                                <div key={area.areaName} className="relative">
                                    {/* Progress Bar Background */}
                                    <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
                                        <div
                                            className="h-full bg-purple-100 transition-all duration-1000"
                                            style={{ width: `${Math.min((area.voteCount / (leaderboard[0].voteCount || 1)) * 100, 100)}%` }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="relative p-3 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className={`
                                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-200 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white text-gray-500 border'}
                                            `}>
                                                {index + 1}
                                            </div>
                                            <span className="font-semibold text-gray-900">{area.areaName}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-bold text-primary-purple">
                                            <span>{area.voteCount}</span>
                                            <span className="text-xs font-normal text-gray-500">votes</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center text-gray-400 text-xs">
                    Votes update in real-time. Share with neighbors to boost your rank!
                </div>
            </div>
        </div>
    );
};
