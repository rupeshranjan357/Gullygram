import React from 'react';
import clsx from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    glass?: boolean;
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className,
    glass = false,
    hover = false,
}) => {
    return (
        <div
            className={clsx(
                'rounded-lg p-4',
                glass ? 'glass' : 'bg-white shadow-md',
                hover && 'hover-lift cursor-pointer',
                className
            )}
        >
            {children}
        </div>
    );
};
