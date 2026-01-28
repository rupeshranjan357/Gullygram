import React from 'react';
import clsx from 'clsx';

interface InterestPillProps {
    name: string;
    color?: string;
    className?: string;
}

const interestColors: Record<string, string> = {
    'Music': 'bg-primary-purple',
    'Food': 'bg-secondary-orange',
    'Art': 'bg-secondary-green',
    'Tech': 'bg-secondary-red',
    'Technology': 'bg-primary-blue',
    'Sports': 'bg-secondary-green',
    'Bodybuilding': 'bg-secondary-orange',
    'Books': 'bg-secondary-teal',
    'Dance': 'bg-secondary-pink',
    'Travel': 'bg-secondary-teal',
    'Photography': 'bg-secondary-yellow',
    'Gaming': 'bg-primary-purple',
    'Movies': 'bg-primary-purple',
    'Fitness': 'bg-secondary-green',
    'Cooking': 'bg-secondary-red',
    'Fashion': 'bg-secondary-pink',
};

export const InterestPill: React.FC<InterestPillProps> = ({
    name,
    color,
    className,
}) => {
    const bgColor = color || interestColors[name] || 'bg-gray-600';

    return (
        <span
            className={clsx(
                'inline-block px-3 py-1 rounded-full text-white text-xs font-semibold',
                bgColor,
                className
            )}
        >
            #{name}
        </span>
    );
};
