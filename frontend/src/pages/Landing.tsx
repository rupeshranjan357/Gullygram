import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { InterestPill } from '@/components/ui/InterestPill';

export const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen map-pattern flex items-center justify-center p-6">
            <div className="max-w-md w-full animate-slide-up">
                {/* Logo and Tagline */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        GullyGram
                    </h1>
                    <p className="text-lg text-white/90">
                        Connect Locally, Discover Nearby
                    </p>
                </div>

                {/* Location Radius Preview */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                            <MapPin className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <div className="text-white text-center">
                        <p className="text-2xl font-semibold">10-20km</p>
                        <p className="text-sm opacity-90">radius</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 mb-8">
                    <Button
                        variant="primary"
                        size="lg"
                        className="w-full bg-white text-primary-purple hover:bg-white/90"
                        onClick={() => navigate('/signup')}
                    >
                        SIGN UP
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => navigate('/login')}
                    >
                        LOGIN
                    </Button>
                </div>

                {/* Floating Interest Tags */}
                <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
                    <InterestPill name="Bodybuilding" />
                    <InterestPill name="Books" />
                    <InterestPill name="Dance" />
                    <InterestPill name="Music" />
                </div>
            </div>
        </div>
    );
};
