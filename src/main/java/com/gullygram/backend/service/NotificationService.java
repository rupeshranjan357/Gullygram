package com.gullygram.backend.service;

import com.gullygram.backend.dto.response.NotificationResponse;
import com.gullygram.backend.entity.Notification;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.repository.NotificationRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    /**
     * Create a new notification
     */
    @Transactional
    public void createNotification(
            UUID userId,
            Notification.NotificationType type,
            UUID actorId,
            String entityType,
            UUID entityId,
            String message
    ) {
        log.info("Creating notification for user {} of type {}", userId, type);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        User actor = actorId != null ? userRepository.findById(actorId).orElse(null) : null;

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .actor(actor)
                .entityType(entityType)
                .entityId(entityId)
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.info("Notification created successfully: {}", notification.getId());
    }

    /**
     * Get paginated notifications for a user
     */
    @Transactional
    public Page<NotificationResponse> getNotifications(UUID userId, int page, int size) {
        log.info("Fetching notifications for user {}: page={}, size={}", userId, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return notifications.map(this::convertToResponse);
    }

    /**
     * Get unread notification count
     */
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    /**
     * Mark a single notification as read
     */
    @Transactional
    public void markAsRead(UUID userId, UUID notificationId) {
        log.info("Marking notification {} as read for user {}", notificationId, userId);

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public void markAllAsRead(UUID userId) {
        log.info("Marking all notifications as read for user {}", userId);
        int count = notificationRepository.markAllAsRead(userId);
        log.info("Marked {} notifications as read", count);
    }

    /**
     * Convert Notification entity to NotificationResponse DTO
     */
    private NotificationResponse convertToResponse(Notification notification) {
        NotificationResponse.ActorInfo actorInfo = null;
        if (notification.getActor() != null) {
            User actor = notification.getActor();
            UserProfile actorProfile = userProfileRepository.findByUserId(actor.getId()).orElse(null);
            String alias = actorProfile != null ? actorProfile.getAlias() : "Unknown";
            String avatarUrl = actorProfile != null ? actorProfile.getAvatarUrlAlias() : null;
            actorInfo = NotificationResponse.ActorInfo.builder()
                    .userId(actor.getId())
                    .alias(alias)
                    .avatarUrl(avatarUrl)
                    .build();
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .actor(actorInfo)
                .entityType(notification.getEntityType())
                .entityId(notification.getEntityId())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
