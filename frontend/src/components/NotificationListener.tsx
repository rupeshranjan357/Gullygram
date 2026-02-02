import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import notificationService from '@/services/notificationService';
import { useToastStore } from '@/store/toastStore';
import { useLocation } from 'react-router-dom';

export const NotificationListener: React.FC = () => {
    const { isAuthenticated } = useAuthStore();
    const { addToast } = useToastStore();
    const location = useLocation();

    // Store IDs of notifications we've already toasted to avoid duplicates
    // We use a Ref so it persists across renders without triggering re-renders
    const seenNotificationIds = useRef<Set<string>>(new Set());
    const isFirstPoll = useRef(true);

    useEffect(() => {
        if (!isAuthenticated) return;

        const pollNotifications = async () => {
            try {
                // Fetch latest 5 notifications
                const page = await notificationService.getNotifications(0, 5);

                page.content.forEach((notif) => {
                    // Skip if we've seen this notification
                    if (seenNotificationIds.current.has(notif.id)) return;

                    // Mark as seen
                    seenNotificationIds.current.add(notif.id);

                    // Skip toasts on first load (so we don't spam user on refresh)
                    if (isFirstPoll.current) return;

                    // Skip if current user is on the chat page with this person
                    // (Primitive check: if URL contains sender ID, don't toast message)
                    if (notif.type === 'NEW_MESSAGE' && location.pathname.includes(notif.actor?.userId || 'xxxx')) {
                        return;
                    }

                    // Only toast MESSAGES as per user request
                    if (notif.type === 'NEW_MESSAGE') {
                        addToast({
                            type: 'message',
                            message: notif.message,
                            title: notif.actor?.alias || 'New Message',
                            avatarUrl: notif.actor?.avatarUrl,
                            actionPath: `/messages`, // Or specific conversation if we had ID
                            duration: 5000
                        });
                    }
                });

                isFirstPoll.current = false;

            } catch (error) {
                // Silent fail
                console.error("Failed to poll notifications", error);
            }
        };

        // Start polling per 5s
        const intervalId = setInterval(pollNotifications, 5000);

        // Initial run
        pollNotifications();

        return () => clearInterval(intervalId);
    }, [isAuthenticated, addToast, location.pathname]);

    return null; // Invisible component
};
