import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

interface InterestCardProps {
    name: string;
    icon: React.ReactNode;
    colorClass: string;
    selected: boolean;
    onClick: () => void;
}

export const InterestCard: React.FC<InterestCardProps> = ({
    name,
    icon,
    colorClass,
    selected,
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'relative w-full aspect-square rounded-lg p-4',
                'flex flex-col items-center justify-center gap-2',
                'text-white font-semibold transition-all',
                'hover-lift button-press',
                colorClass,
                selected && 'ring-4 ring-white ring-offset-2'
            )}
        >
            <div className="text-4xl">{icon}</div>
            <span className="text-sm md:text-base">{name}</span>
            {selected && (
                <div className="absolute top-2 right-2 bg-white rounded-full p-1 animate-scale-in">
                    <Check className="w-4 h-4 text-primary-purple" />
                </div>
            )}
        </button>
    );
};
