import React, { useState } from 'react';
import { Huddle, huddleService } from '@/services/huddleService';
import { Button } from '@/components/ui/Button'; // Assuming you have a reusable Button
// If you don't have a reusable Modal, we can build a simple one or use a library.
// For now, I'll build a simple overlay.
import { format } from 'date-fns';
import { VibeCheckModal } from './VibeCheckModal';

interface HuddleDetailsModalProps {
    huddle: Huddle;
    isOpen: boolean;
    onClose: () => void;
    onJoin: (huddleId: string) => void;
    currentUserId: string | null;
    onComplete?: () => void; // Callback to refresh data after completion
}

export const HuddleDetailsModal: React.FC<HuddleDetailsModalProps> = ({
    huddle,
    isOpen,
    onClose,
    onJoin,
    currentUserId,
    onComplete
}) => {
    const [isCompleting, setIsCompleting] = useState(false);
    const [showVibeCheck, setShowVibeCheck] = useState(false);
    const [participants, setParticipants] = useState<any[]>([]);

    if (!isOpen) return null;

    const isCreator = currentUserId === huddle.creator.userId;
    const isCompleted = huddle.status === 'COMPLETED';

    const handleRatingClick = async () => {
        try {
            const list = await huddleService.getParticipants(huddle.id);
            // Filter out self
            setParticipants(list.filter(p => p.userId !== currentUserId));
            setShowVibeCheck(true);
        } catch (err) {
            console.error('Failed to load participants', err);
        }
    };
    const handleCompleteHuddle = async () => {
        if (!confirm('Are you sure you want to complete this Huddle? This will trigger Karma awards for everyone.')) return;

        setIsCompleting(true);
        try {
            await huddleService.completeHuddle(huddle.id);
            console.log('Huddle completed successfully! Karma has been awarded.');
            if (onComplete) onComplete();
            onClose();
        } catch (error) {
            console.error('Failed to complete huddle:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative">
                {/* Header */}
                <div className="bg-primary-purple p-4 text-white">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white hover:text-gray-200"
                    >
                        ✕
                    </button>
                    <h2 className="text-xl font-bold" data-testid="huddle-modal-title">{huddle.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${huddle.status === 'OPEN' ? 'bg-green-500' :
                            isCompleted ? 'bg-blue-500' : 'bg-gray-500'
                            }`}>
                            {huddle.status}
                        </span>
                        <span className="text-sm opacity-90">by @{huddle.creator.alias}</span>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-700">{huddle.description || 'No description provided.'}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex flex-col">
                            <span className="text-gray-500">📍 Location</span>
                            <span className="font-medium text-gray-800">{huddle.locationName || 'Unknown'}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">⏰ Time</span>
                            <span className="font-medium text-gray-800">
                                {format(new Date(huddle.startTime), 'MMM d, h:mm a')}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">👥 Participants</span>
                            <span className="font-medium text-gray-800">
                                {huddle.currentParticipants} / {huddle.maxParticipants}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500">🚻 Filter</span>
                            <span className="font-medium text-gray-800">
                                {huddle.genderFilter === 'WOMEN_ONLY' ? 'Women Only' :
                                    huddle.genderFilter === 'MEN_ONLY' ? 'Men Only' : 'Everyone'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                        {isCreator && huddle.status === 'OPEN' && (
                            <Button
                                variant="primary"
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                onClick={handleCompleteHuddle}
                                disabled={isCompleting}
                                data-testid="complete-huddle-button"
                            >
                                {isCompleting ? 'Completing...' : '✅ Complete Huddle'}
                            </Button>
                        )}

                        {!huddle.isJoined && huddle.status === 'OPEN' && (
                            <Button
                                variant="primary"
                                className="w-full bg-primary-purple hover:bg-purple-700 text-white"
                                onClick={() => onJoin(huddle.id)}
                                disabled={huddle.currentParticipants >= huddle.maxParticipants}
                            >
                                {huddle.currentParticipants >= huddle.maxParticipants ? 'Full' : 'Join Huddle'}
                            </Button>
                        )}

                        {huddle.isJoined && (
                            <>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center text-green-700 text-sm">
                                    You have joined this huddle! 🎉
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full border-green-500 text-green-600 hover:bg-green-50"
                                    onClick={handleRatingClick}
                                    data-testid="rate-huddle-button"
                                >
                                    ⭐ Rate Participants
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <VibeCheckModal
                    isOpen={showVibeCheck}
                    onClose={() => setShowVibeCheck(false)}
                    huddleId={huddle.id}
                    huddleTitle={huddle.title}
                    participants={participants}
                />
            </div>
        </div>
    );
};
