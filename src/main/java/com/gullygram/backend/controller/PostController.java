package com.gullygram.backend.controller;

import com.gullygram.backend.dto.request.CreateCommentRequest;
import com.gullygram.backend.dto.request.CreatePostRequest;
import com.gullygram.backend.dto.response.ApiResponse;
import com.gullygram.backend.dto.response.CommentResponse;
import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.security.CurrentUser;
import com.gullygram.backend.service.CommentService;
import com.gullygram.backend.service.LikeService;
import com.gullygram.backend.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final LikeService likeService;
    private final CommentService commentService;
    private final CurrentUser currentUser;

    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody CreatePostRequest request) {
        UUID userId = currentUser.getUserId();
        PostResponse post = postService.createPost(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Post created successfully", post));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPost(@PathVariable UUID id) {
        UUID userId = currentUser.getUserId();
        PostResponse post = postService.getPostById(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Success", post));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable UUID id) {
        UUID userId = currentUser.getUserId();
        postService.deletePost(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(@PathVariable UUID id) {
        UUID userId = currentUser.getUserId();
        boolean liked = likeService.toggleLike(id, userId);
        long likeCount = likeService.getLikeCount(id);

        Map<String, Object> result = new HashMap<>();
        result.put("liked", liked);
        result.put("likeCount", likeCount);

        return ResponseEntity.ok(ApiResponse.success(
            liked ? "Post liked" : "Post unliked", 
            result
        ));
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCommentRequest request) {
        UUID userId = currentUser.getUserId();
        CommentResponse comment = commentService.createComment(id, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Comment added successfully", comment));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getComments(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = currentUser.getUserId();
        List<CommentResponse> comments = commentService.getCommentsByPost(id, userId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Success", comments));
    }
}
