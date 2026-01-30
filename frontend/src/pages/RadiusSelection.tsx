import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MapPin, Compass } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { profileService } from '@/services/profileService';
import { interestService } from '@/services/interestService';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';

export const RadiusSelection: React.FC = () => {
    const navigate = useNavigate();
    const { selectedInterests, selectedRadius, reset } = useOnboardingStore();
    const { setProfileComplete } = useAuthStore();
    const [localRadius, setLocalRadius] = useState(selectedRadius);

    const updateInterestsMutation = useMutation({
        mutationFn: interestService.updateInterests,
    });

    const updateProfileMutation = useMutation({
        mutationFn: profileService.updateProfile,
        onSuccess: () => {
            setProfileComplete(true);
            reset();
            navigate('/profile');
        },
        onError: (error) => {
            console.error('Failed to update profile:', error);
            alert('Failed to complete onboarding. Please try again.');
        },
    });

    const handleGetStarted = async () => {
        try {
            // Update interests
            await updateInterestsMutation.mutateAsync({
                interestIds: selectedInterests,
            });

            // Update radius
            await updateProfileMutation.mutateAsync({
                defaultRadiusKm: localRadius,
            });
        } catch (error) {
            console.error('Onboarding error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-6">
            <div className="max-w-2xl mx-auto animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Set Your Radius
                    </h1>
                    <p className="text-gray-600">
                        How far do you want to explore?
                    </p>
                </div>

                {/* Map Visual */}
                <div className="mb-8 flex justify-center">
                    <div className="relative w-64 h-64">
                        {/* Concentric circles representing radius */}
                        <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
                        <div className="absolute inset-4 rounded-full border-4 border-purple-300"></div>
                        <div className="absolute inset-8 rounded-full border-4 border-purple-400"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                                <Compass className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Radius Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setLocalRadius(10)}
                        className={clsx(
                            'transition-all',
                            localRadius === 10 && 'ring-4 ring-primary-purple ring-offset-2'
                        )}
                    >
                        <Card className="text-left hover-lift cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <MapPin className="w-6 h-6 text-primary-blue" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg">10km</h3>
                                        {localRadius === 10 && (
                                            <div className="w-3 h-3 rounded-full bg-primary-purple"></div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Smaller area, focused.
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Ideal for local discoveries.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </button>

                    <button
                        onClick={() => setLocalRadius(20)}
                        className={clsx(
                            'transition-all',
                            localRadius === 20 && 'ring-4 ring-primary-purple ring-offset-2'
                        )}
                    >
                        <Card className="text-left hover-lift cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Compass className="w-6 h-6 text-primary-purple" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg">20km</h3>
                                        {localRadius === 20 && (
                                            <div className="w-3 h-3 rounded-full bg-primary-purple"></div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Wider area, explorer.
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Perfect for finding new gems.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </button>
                </div>

                {/* Info */}
                <p className="text-center text-sm text-gray-500 mb-6">
                    You can change this anytime in settings
                </p>

                {/* Progress and Get Started Button */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary-purple"></div>
                        <div className="w-3 h-3 rounded-full bg-primary-purple"></div>
                    </div>
                    <p className="text-sm text-gray-600">Step 2 of 2</p>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGetStarted}
                        loading={updateInterestsMutation.isPending || updateProfileMutation.isPending}
                        className="px-12"
                    >
                        Get Started
                    </Button>
                </div>
            </div>
        </div>
    );
};
