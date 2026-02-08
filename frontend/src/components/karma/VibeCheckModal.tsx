import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SubmitVibeCheckRequest } from '../../types/karma.types';
import { karmaService } from '../../services/karmaService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import '@/styles/karma.css';

interface VibeCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    huddleId: string;
    revieweeId: string;
    revieweeName: string;
}

const TAGS = [
    { id: 'chill', label: 'Chill', colorClass: 'bg-blue-500' },
    { id: 'ontime', label: 'On Time', colorClass: 'bg-green-500' },
    { id: 'fun', label: 'Fun', colorClass: 'bg-purple-500' },
    { id: 'goodvibes', label: 'Good Vibes', colorClass: 'bg-orange-500' },
];

export const VibeCheckModal: React.FC<VibeCheckModalProps> = ({
    isOpen, onClose, huddleId, revieweeId, revieweeName
}) => {
    const [rating, setRating] = useState(0);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: karmaService.submitVibeCheck,
        onSuccess: () => {
            toast.success('Vibe Check submitted! + Karma awarded');
            queryClient.invalidateQueries({ queryKey: ['karma-history'] });
            queryClient.invalidateQueries({ queryKey: ['karma-score'] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to submit Vibe Check');
        }
    });

    if (!isOpen) return null;

    const toggleTag = (tagLabel: string) => {
        if (selectedTags.includes(tagLabel)) {
            setSelectedTags(prev => prev.filter(t => t !== tagLabel));
        } else {
            if (selectedTags.length < 3) {
                setSelectedTags(prev => [...prev, tagLabel]);
            }
        }
    };

    const handleSubmit = () => {
        if (rating === 0) {
            toast.error('Please select a star rating');
            return;
        }

        const request: SubmitVibeCheckRequest = {
            huddleId,
            revieweeId,
            rating,
            tags: selectedTags
        };
        mutation.mutate(request);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in backdrop-blur-sm">
            <div className="bg-[#1a1a2e] text-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative karma-border-glow border border-white/10">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-xl font-bold mb-2">Vibe Check</h2>
                    <p className="text-gray-300">
                        Rate your Huddle with <span className="text-purple-400 font-bold">@{revieweeName}</span>
                    </p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                        <button
                            key={starIdx}
                            onClick={() => setRating(starIdx)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill={starIdx <= rating ? "#fbbf24" : "none"}
                                stroke={starIdx <= rating ? "#fbbf24" : "#4b5563"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="lucide lucide-star"
                            >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </button>
                    ))}
                </div>

                {/* Tags */}
                <div className="mb-6">
                    <p className="text-sm text-gray-400 mb-3 text-center">What went well?</p>
                    <div className="grid grid-cols-2 gap-3">
                        {TAGS.map((tag) => (
                            <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.label)}
                                className={`
                                    py-2 px-4 rounded-xl text-sm font-semibold transition-all
                                    ${selectedTags.includes(tag.label)
                                        ? `${tag.colorClass} text-white shadow-lg scale-105`
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
                                `}
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Note (Optional) */}
                <div className="mb-6">
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note (optional)..."
                        className="w-full bg-gray-800 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none border border-gray-700"
                        rows={3}
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={mutation.isPending}
                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? 'Submitting...' : 'Submit Vibe Check'}
                </button>
            </div>
        </div>
    );
};
