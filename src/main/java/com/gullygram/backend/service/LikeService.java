package com.gullygram.backend.service;

import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.PostLike;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.PostLikeRepository;
import com.gullygram.backend.repository.PostRepository;
import com.gullygram.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class LikeService {

    private final PostLikeRepository postLikeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Transactional
    public boolean toggleLike(UUID postId, UUID userId) {
        Post post = postRepository.findByIdAndNotDeleted(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId);

        if (existingLike.isPresent()) {
            // Unlike
            postLikeRepository.delete(existingLike.get());
            log.info("User {} unliked post {}", userId, postId);
            return false;
        } else {
            // Like
            PostLike postLike = PostLike.builder()
                .id(new PostLike.PostLikeId(postId, userId))
                .post(post)
                .user(user)
                .build();
            postLikeRepository.save(postLike);
            log.info("User {} liked post {}", userId, postId);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public boolean isLikedByUser(UUID postId, UUID userId) {
        return postLikeRepository.findByPostIdAndUserId(postId, userId).isPresent();
    }

    @Transactional(readOnly = true)
    public long getLikeCount(UUID postId) {
        return postLikeRepository.countByPostId(postId);
    }
}
