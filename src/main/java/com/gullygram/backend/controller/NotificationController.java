package com.gullygram.backend.controller;

import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.NotificationResponse;
import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUser currentUser;

    /**
     * Get paginated notifications for current user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        UUID userId = currentUser.getUserId();
        log.info("GET /api/notifications - user: {}, page: {}, size: {}", userId, page, size);

        Page<NotificationResponse> notifications = notificationService.getNotifications(userId, page, size);

        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    /**
     * Get unread notification count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        UUID userId = currentUser.getUserId();
        log.info("GET /api/notifications/unread-count - user: {}", userId);

        long count = notificationService.getUnreadCount(userId);
        Map<String, Long> result = new HashMap<>();
        result.put("count", count);

        return ResponseEntity.ok(ApiResponse.success(result));
    }

    /**
     * Mark a single notification as read
     */
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID notificationId) {
        UUID userId = currentUser.getUserId();
        log.info("POST /api/notifications/{}/read - user: {}", notificationId, userId);

        notificationService.markAsRead(userId, notificationId);

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * Mark all notifications as read
     */
    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        UUID userId = currentUser.getUserId();
        log.info("POST /api/notifications/read-all - user: {}", userId);

        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
