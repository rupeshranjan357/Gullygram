package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.CreateCommentRequest;
import com.gullygram.backend.dto.response.AuthorView;
import com.gullygram.backend.dto.response.CommentResponse;
import com.gullygram.backend.entity.Comment;
import com.gullygram.backend.entity.Notification;
import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.CommentRepository;
import com.gullygram.backend.repository.PostRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final AuthorViewService authorViewService;
    private final UserProfileRepository userProfileRepository;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse createComment(UUID postId, UUID userId, CreateCommentRequest request) {
        Post post = postRepository.findByIdAndNotDeleted(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = Comment.builder()
            .post(post)
            .author(user)
            .text(request.getText())
            .build();

        Comment savedComment = commentRepository.save(comment);
        log.info("User {} commented on post {}", userId, postId);
        
        // Create notification for post author (don't notify if commenting on own post)
        if (!post.getAuthor().getId().equals(userId)) {
            UserProfile commenterProfile = userProfileRepository.findByUserId(userId).orElse(null);
            String commenterAlias = commenterProfile != null ? commenterProfile.getAlias() : "Someone";
            notificationService.createNotification(
                post.getAuthor().getId(),
                Notification.NotificationType.POST_COMMENT,
                userId,
                "POST",
                postId,
                commenterAlias + " commented on your post"
            );
        }

        return convertToResponse(savedComment, userId);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPost(UUID postId, UUID viewerId, int page, int size) {
        // Verify post exists
        postRepository.findByIdAndNotDeleted(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> comments = commentRepository.findByPostIdAndNotDeleted(postId, pageable);

        return comments.stream()
            .map(comment -> convertToResponse(comment, viewerId))
            .collect(Collectors.toList());
    }

    private CommentResponse convertToResponse(Comment comment, UUID viewerId) {
        // Use AuthorViewService for identity reveal based on relationship
        AuthorView authorView = authorViewService.buildAuthorView(viewerId, comment.getAuthor());

        return CommentResponse.builder()
            .id(comment.getId())
            .author(authorView)
            .text(comment.getText())
            .createdAt(comment.getCreatedAt())
            .updatedAt(comment.getUpdatedAt())
            .build();
    }
}
