package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.CreatePostRequest;
import com.gullygram.backend.dto.response.AuthorView;
import com.gullygram.backend.dto.response.InterestResponse;
import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.entity.Interest;
import com.gullygram.backend.entity.InterestAlias;
import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.exception.BadRequestException;
import com.gullygram.backend.exception.ResourceNotFoundException;
import com.gullygram.backend.repository.InterestAliasRepository;
import com.gullygram.backend.repository.InterestRepository;
import com.gullygram.backend.repository.PostLikeRepository;
import com.gullygram.backend.repository.CommentRepository;
import com.gullygram.backend.repository.PostRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final InterestRepository interestRepository;
    private final InterestAliasRepository interestAliasRepository;
    private final PostLikeRepository postLikeRepository;
    private final CommentRepository commentRepository;
    private final AuthorViewService authorViewService;
    private final MarketplaceService marketplaceService;

    @Transactional
    public PostResponse createPost(UUID userId, CreatePostRequest request) {
        // Validate geo coordinates
        if (!GeoUtil.isValidLatitude(request.getLatitude())) {
            throw new BadRequestException("Invalid latitude");
        }
        if (!GeoUtil.isValidLongitude(request.getLongitude())) {
            throw new BadRequestException("Invalid longitude");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate Marketing Rate Limit
        if (request.getType() == Post.PostType.MARKETING) {
            marketplaceService.validateMarketingPostLimit(user);
        }

        // Build post
        Post.PostBuilder postBuilder = Post.builder()
            .author(user)
            .type(request.getType())
            .text(request.getText())
            .lat(request.getLatitude())
            .lon(request.getLongitude())
            .geohash(GeoUtil.generateGeohash(request.getLatitude(), request.getLongitude()))
            .visibilityRadiusKm(request.getVisibilityRadiusKm() != null ? request.getVisibilityRadiusKm() : 10)
            .visibility(request.isFriendsOnly() ? Post.PostVisibility.FRIENDS_ONLY : Post.PostVisibility.PUBLIC);

        // Map Event Fields
        if (request.getType() == Post.PostType.EVENT_PROMO) {
            String dateStr = request.getEventDate();
            if (dateStr != null && !dateStr.trim().isEmpty()) {
                try {
                    postBuilder.eventDate(java.time.LocalDateTime.parse(dateStr));
                } catch (java.time.format.DateTimeParseException e) {
                    throw new BadRequestException("Invalid event date format: " + dateStr);
                }
            }
            postBuilder.eventLocationName(request.getEventLocationName());
            postBuilder.eventCity(request.getEventCity());
        }

        Post post = postBuilder.build();

        // Set media URLs directly (converter will handle JSON conversion)
        if (request.getMediaUrls() != null && !request.getMediaUrls().isEmpty()) {
            post.setMediaUrls(request.getMediaUrls());
        }

        // Add interests
        Set<Interest> interests = new HashSet<>();
        if (request.getInterestIds() != null && !request.getInterestIds().isEmpty()) {
            for (Integer interestId : request.getInterestIds()) {
                Interest interest = interestRepository.findById(interestId)
                    .orElseThrow(() -> new ResourceNotFoundException("Interest not found: " + interestId));
                interests.add(interest);
            }
        }
        
        // Auto-detect hashtags from text and map to Interests via Aliases
        if (request.getText() != null) {
            Set<String> hashtags = extractHashtags(request.getText());
            if (!hashtags.isEmpty()) {
                // 1. Direct Match (Hashtag = Interest Name)
                List<Interest> directMatches = interestRepository.findByNameInIgnoreCase(new ArrayList<>(hashtags));
                interests.addAll(directMatches);
                
                // 2. Alias Match (Hashtag = Alias -> Interest)
                List<InterestAlias> aliasMatches = interestAliasRepository.findByAliasIn(hashtags);
                for (InterestAlias alias : aliasMatches) {
                    interests.add(alias.getInterest());
                }
            }
        }
        
        post.setInterests(interests);

        Post savedPost = postRepository.save(post);
        
        // Handle post-creation logic (e.g., updating limits)
        marketplaceService.handlePostCreated(user, savedPost);

        log.info("Created post {} by user {} at location ({}, {})", 
                savedPost.getId(), userId, request.getLatitude(), request.getLongitude());

        return convertToResponse(savedPost, userId);
    }

    @Transactional(readOnly = true)
    public PostResponse getPostById(UUID postId, UUID currentUserId) {
        Post post = postRepository.findByIdAndNotDeleted(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        
        return convertToResponse(post, currentUserId);
    }

    /**
     * Get posts by user (for profile page)
     */
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<PostResponse> getPostsByUser(
            UUID userId, UUID currentUserId, int page, int size) {
        
        org.springframework.data.domain.Pageable pageable = 
            org.springframework.data.domain.PageRequest.of(page, size);
        
        org.springframework.data.domain.Page<Post> posts = 
            postRepository.findByAuthorId(userId, pageable);
        
        return posts.map(post -> convertToResponse(post, currentUserId));
    }

    @Transactional
    public void deletePost(UUID postId, UUID userId) {
        Post post = postRepository.findByIdAndNotDeleted(postId)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own posts");
        }

        post.softDelete();
        postRepository.save(post);
        log.info("Soft deleted post {} by user {}", postId, userId);
    }

    public PostResponse convertToResponse(Post post, UUID currentUserId) {
        // Get media URLs directly (converter handles JSON conversion)
        List<String> mediaUrls = post.getMediaUrls();

        // Get engagement metrics
        long likeCount = postLikeRepository.countByPostId(post.getId());
        long commentCount = commentRepository.countByPostIdAndNotDeleted(post.getId());
        boolean likedByCurrentUser = postLikeRepository.findByPostIdAndUserId(post.getId(), currentUserId).isPresent();

        // Build author view with identity reveal based on relationship
        AuthorView authorView = authorViewService.buildAuthorView(currentUserId, post.getAuthor());

        // Convert interests
        Set<InterestResponse> interestResponses = post.getInterests().stream()
            .map(interest -> InterestResponse.builder()
                .id(interest.getId())
                .name(interest.getName())
                .description(interest.getDescription())
                .build())
            .collect(Collectors.toSet());

        return PostResponse.builder()
            .id(post.getId())
            .author(authorView)
            .type(post.getType())
            .text(post.getText())
            .mediaUrls(mediaUrls)
            .latitude(post.getLat())
            .longitude(post.getLon())
            .visibilityRadiusKm(post.getVisibilityRadiusKm())
            .interests(interestResponses)
            .likeCount(likeCount)
            .commentCount(commentCount)
            .likedByCurrentUser(likedByCurrentUser)
            .visibility(post.getVisibility().name())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .build();
    }

    /**
     * Extract hashtags from text (words starting with #)
     */
    private Set<String> extractHashtags(String text) {
        Set<String> hashtags = new HashSet<>();
        if (text == null || text.isEmpty()) {
            return hashtags;
        }
        
        // Match hashtags: # followed by alphanumeric characters
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("#(\\w+)");
        java.util.regex.Matcher matcher = pattern.matcher(text);
        
        while (matcher.find()) {
            hashtags.add(matcher.group(1).toLowerCase()); // Remove # and lowercase
        }
        
        return hashtags;
    }

}
