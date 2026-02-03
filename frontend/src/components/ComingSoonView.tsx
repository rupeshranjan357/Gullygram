import { useNavigate } from 'react-router-dom';
import { MapPin, PartyPopper } from 'lucide-react';
import { Button } from './ui/Button';
import { useLocationStore } from '@/store/locationStore';

interface ComingSoonViewProps {
    onChangeLocation: () => void;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({ onChangeLocation }) => {
    const { addressLabel } = useLocationStore();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-purple-100 p-6 rounded-full mb-6 animate-bounce">
                <PartyPopper className="w-12 h-12 text-primary-purple" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                We haven't reached {addressLabel} yet!
            </h2>

            <p className="text-gray-600 mb-8 max-w-sm">
                GullyGram is currently live exclusively in **Whitefield** and **Marathahalli**.
                We are expanding street by street!
            </p>

            <div className="space-y-3 w-full max-w-xs">
                <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                        // In real app, we would cast a vote API call here
                        navigate('/launch');
                    }}
                >
                    🚀 Vote for {addressLabel}
                </Button>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={onChangeLocation}
                >
                    <MapPin className="w-4 h-4 mr-2" />
                    Change Location to Try Beta
                </Button>
            </div>
        </div>
    );
};
