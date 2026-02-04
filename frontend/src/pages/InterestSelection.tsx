import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dumbbell,
    BookOpen,
    Music,
    Camera,
    Plane,
    Pizza,
    Gamepad2,
    Palette,
    Film,
    Shirt,
    ChefHat,
    Heart,
    Laptop,
    CircleDot,
    ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InterestCard } from '@/components/ui/InterestCard';
import { interestService } from '@/services/interestService';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import type { Interest } from '@/types';

// Icon mapping for interests
const iconMap: Record<string, React.ReactNode> = {
    'Bodybuilding': <Dumbbell size={48} />,
    'Books': <BookOpen size={48} />,
    'Dance': <Heart size={48} />,
    'Music': <Music size={48} />,
    'Sports': <CircleDot size={48} />,
    'Technology': <Laptop size={48} />,
    'Food': <Pizza size={48} />,
    'Travel': <Plane size={48} />,
    'Photography': <Camera size={48} />,
    'Gaming': <Gamepad2 size={48} />,
    'Art': <Palette size={48} />,
    'Movies': <Film size={48} />,
    'Fitness': <Heart size={48} />,
    'Cooking': <ChefHat size={48} />,
    'Fashion': <Shirt size={48} />,
};

const colorClassMap: Record<string, string> = {
    'Bodybuilding': 'interest-bodybuilding',
    'Books': 'interest-books',
    'Dance': 'interest-dance',
    'Music': 'interest-music',
    'Sports': 'interest-sports',
    'Technology': 'interest-technology',
    'Food': 'interest-food',
    'Travel': 'interest-travel',
    'Photography': 'interest-photography',
    'Gaming': 'interest-gaming',
    'Art': 'interest-art',
    'Movies': 'interest-movies',
    'Fitness': 'interest-fitness',
    'Cooking': 'interest-cooking',
    'Fashion': 'interest-fashion',
};

export const InterestSelection: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { selectedInterests, setInterests } = useOnboardingStore();
    const { isNewUser } = useAuthStore();
    const isEditing = !isNewUser;

    const { data: interests, isLoading: isLoadingAll } = useQuery({
        queryKey: ['interests'],
        queryFn: interestService.getAllInterests,
    });

    const { data: myInterests, isLoading: isLoadingMy } = useQuery({
        queryKey: ['myInterests'],
        queryFn: interestService.getMyInterests,
        enabled: isEditing,
    });

    useEffect(() => {
        if (isEditing && myInterests) {
            setInterests(myInterests.map(i => i.id));
        }
    }, [isEditing, myInterests, setInterests]);

    const updateInterestsMutation = useMutation({
        mutationFn: interestService.updateInterests,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myInterests'] });
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            navigate('/profile');
        },
        onError: (error: any) => {
            alert(`Failed to update interests: ${error.message}`);
        }
    });

    const toggleInterest = (interestId: number) => {
        if (selectedInterests.includes(interestId)) {
            setInterests(selectedInterests.filter(id => id !== interestId));
        } else {
            setInterests([...selectedInterests, interestId]);
        }
    };

    const handleNext = () => {
        if (selectedInterests.length === 0) {
            alert('Please select at least one interest');
            return;
        }

        if (isEditing) {
            updateInterestsMutation.mutate({ interestIds: selectedInterests });
        } else {
            navigate('/onboarding/radius');
        }
    };

    if (isLoadingAll || (isEditing && isLoadingMy)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-gray-600">Loading interests...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-6">
            <div className="max-w-4xl mx-auto animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8 relative">
                    {isEditing && (
                        <button
                            onClick={() => navigate('/profile')}
                            className="absolute left-0 top-1 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isEditing ? 'Edit Your Interests' : 'Pick Your Interests'}
                    </h1>
                    <p className="text-gray-600">
                        {isEditing
                            ? 'Update what you want to see in your feed'
                            : "We'll show you relevant local content"}
                    </p>
                </div>

                {/* Interest Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {interests?.filter((i: Interest) => !i.name.match(/[0-9_]/))?.map((interest: Interest) => (
                        <InterestCard
                            key={interest.id}
                            name={interest.name}
                            icon={iconMap[interest.name] || <Heart size={48} />}
                            colorClass={colorClassMap[interest.name] || 'bg-gray-500'}
                            selected={selectedInterests.includes(interest.id)}
                            onClick={() => toggleInterest(interest.id)}
                        />
                    ))}
                </div>

                {/* Progress and Next Button */}
                <div className="flex flex-col items-center gap-4">
                    {!isEditing && (
                        <>
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary-purple"></div>
                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                            </div>
                            <p className="text-sm text-gray-600">Step 1 of 2</p>
                        </>
                    )}
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleNext}
                        className="px-12"
                        loading={updateInterestsMutation.isPending}
                    >
                        {isEditing ? 'Save Changes' : 'Next'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
