import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';

interface Participant {
    userId: UUID;
    alias: string;
    avatarUrl?: string;
}

interface VibeCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    huddleId: string;
    huddleTitle: string;
    participants: Participant[];
}

import { UUID } from 'crypto';

export const VibeCheckModal: React.FC<VibeCheckModalProps> = ({
    isOpen,
    onClose,
    huddleId,
    huddleTitle,
    participants
}) => {
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmitAll = async () => {
        setSubmitting(true);
        try {
            for (const p of participants) {
                const rating = ratings[p.userId as unknown as string] || 5; // Default to 5
                await api.post('/api/karma/vibe-check', {
                    huddleId,
                    revieweeId: p.userId,
                    rating,
                    tags: ['Good Vibe']
                });
            }
            alert('Ratings submitted! Karma points are on the way.');
            onClose();
        } catch (error) {
            console.error('Failed to submit vibe checks:', error);
            alert('Some ratings failed to submit.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white text-center">
                    <h2 className="text-2xl font-bold">Vibe Check! ⚡</h2>
                    <p className="opacity-90">{huddleTitle}</p>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-gray-600 text-center text-sm">
                        Rate the legends you met in this huddle. Good vibes boost everyone's Karma!
                    </p>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {participants.map((p) => (
                            <div key={p.userId as unknown as string} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop'}
                                        className="w-10 h-10 rounded-full border border-purple-200"
                                        alt={p.alias}
                                    />
                                    <span className="font-semibold text-gray-800">@{p.alias}</span>
                                </div>
                                <div className="flex gap-1" data-testid={`rating-${p.alias}`}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRatings(prev => ({ ...prev, [p.userId as unknown as string]: star }))}
                                            className={`text-xl transition-transform hover:scale-125 ${(ratings[p.userId as unknown as string] || 0) >= star ? 'grayscale-0' : 'grayscale text-gray-300'
                                                }`}
                                        >
                                            {star <= 2 ? '🤮' : star === 3 ? '😐' : star === 4 ? '😊' : '🔥'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        className="w-full py-4 rounded-xl text-lg font-bold shadow-lg bg-primary-purple hover:bg-purple-700 text-white"
                        onClick={handleSubmitAll}
                        disabled={submitting}
                        data-testid="submit-vibe-checks"
                    >
                        {submitting ? 'Sending Good Vibes...' : 'Submit Ratings 🚀'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
