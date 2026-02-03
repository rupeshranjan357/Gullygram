package com.gullygram.backend.service;

import com.gullygram.backend.dto.request.CreateCommentRequest;
import com.gullygram.backend.dto.request.CreatePostRequest;
import com.gullygram.backend.dto.request.SignupRequest;
import com.gullygram.backend.dto.response.AuthResponse;
import com.gullygram.backend.dto.response.PostResponse;
import com.gullygram.backend.entity.Post;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MagicContentService {

    private final AuthService authService;
    private final PostService postService;
    private final com.gullygram.backend.repository.PostRepository postRepository;
    private final CommentService commentService;
    private final LikeService likeService;

    private final Random random = new Random();

    // --- TEMPLATES ---
    private static final List<String> COMMON_COMMENTS = Arrays.asList(
        "Totally agree!", "Is this still available?", "Wow, looks great.", "Thanks for sharing!",
        "Can I DM you?", "This is exactly what I was looking for.", "Count me in!", "LOL",
        "Interesting...", "Where exactly is this?"
    );

    @Transactional
    public void seedMagicContent(Double lat, Double lon) {
        log.info("🧙‍♂️ Casting Magic Content Policy at {}, {}", lat, lon);

        // 1. Determine Context (Simple Geofence for Demo)
        String zone = identifyZone(lat, lon);
        List<String> postTemplates = getTemplatesForZone(zone);

        // 2. Create/Get a Pool of "Bot" Users
        List<AuthResponse> users = ensureBotUsers(zone);

        // 3. Generate Posts
        for (String template : postTemplates) {
            // Pick a random author
            AuthResponse author = users.get(random.nextInt(users.size()));
            
            // Jitter location slightly (within ~500m)
            double pLat = lat + (random.nextDouble() - 0.5) * 0.01;
            double pLon = lon + (random.nextDouble() - 0.5) * 0.01;

            Post.PostType type = inferType(template);

            CreatePostRequest postReq = new CreatePostRequest();
            postReq.setText(template);
            postReq.setLatitude(pLat);
            postReq.setLongitude(pLon);
            postReq.setType(type);
            postReq.setFriendsOnly(false); // Public by default

            PostResponse post = postService.createPost(author.getUserId(), postReq);

            // 4. "Time Travel" to make it look alive (0 to 48 hours ago)
            int hoursAgo = random.nextInt(48);
            int minutesAgo = random.nextInt(60);
            LocalDateTime pastTime = LocalDateTime.now().minusHours(hoursAgo).minusMinutes(minutesAgo);
            
            postRepository.updateCreatedAt(post.getId(), pastTime);
            
            simulateEngagement(post.getId(), users);
        }
    }

    private void simulateEngagement(UUID postId, List<AuthResponse> users) {
        // Random Likes (0 to 15)
        int likeCount = random.nextInt(16);
        for (int i = 0; i < likeCount; i++) {
            AuthResponse liker = users.get(random.nextInt(users.size()));
            try {
                likeService.toggleLike(postId, liker.getUserId());
            } catch (Exception ignored) {} // Ignore double likes
        }

        // Random Comments (0 to 5)
        int commentCount = random.nextInt(6);
        for (int i = 0; i < commentCount; i++) {
            AuthResponse commenter = users.get(random.nextInt(users.size()));
            CreateCommentRequest commentReq = new CreateCommentRequest();
            commentReq.setText(COMMON_COMMENTS.get(random.nextInt(COMMON_COMMENTS.size())));
            
            try {
                commentService.createComment(postId, commenter.getUserId(), commentReq);
            } catch (Exception ignored) {}
        }
    }

    private List<AuthResponse> ensureBotUsers(String zone) {
        List<AuthResponse> bots = new ArrayList<>();
        // Create 5 bots specific to this seeding run if needed, or reuse.
        // For speed, let's create 5 fresh ones every time (not efficient for DB but fine for demo)
        // Or better: Try to login, if fail, signup.
        
        String[] names = {"Rohan", "Priya", "Rahul", "Sneha", "Vikram", "Anjali", "Karthik", "Neha"};
        
        for (int i = 0; i < 5; i++) {
            String name = names[random.nextInt(names.length)];
            // Use nanoTime to ensure uniqueness across multiple runs
            String handle = name.toLowerCase() + "_" + zone.toLowerCase().substring(0,3) + "_" + System.nanoTime();
            String email = handle + "@bot.com";
            
            try {
                // Try Signup
                SignupRequest signup = new SignupRequest();
                signup.setEmail(email);
                signup.setPassword("password123");
                signup.setAlias(handle);
                signup.setRealName(name + " from " + zone);
                signup.setPhone("99" + (10000000 + random.nextInt(90000000))); // Random phone

                bots.add(authService.signup(signup));
            } catch (Exception e) {
                // If exists, likely duplicate email/phone. In a real scenario we'd login.
                // For this demo, just skip or login.
                // Shortcuts: just skip adding to list, assumes we have enough or will create new unique ones next time.
            }
        }
        
        // Ensure we returned at least some users. If all failed, we might need a fallback.
        if (bots.isEmpty()) {
            throw new RuntimeException("Failed to create bot users for seeding. Database might be full of duplicates.");
        }
        return bots;
    }

    private String identifyZone(Double lat, Double lon) {
        // Simple Euclidean distance check
        if (isNear(lat, lon, 12.9698, 77.7499)) return "Whitefield";
        if (isNear(lat, lon, 12.9716, 77.6412)) return "Indiranagar";
        if (isNear(lat, lon, 12.9352, 77.6245)) return "Koramangala";
        return "Bangalore";
    }

    private boolean isNear(double lat1, double lon1, double lat2, double lon2) {
        return Math.abs(lat1 - lat2) < 0.05 && Math.abs(lon1 - lon2) < 0.05; // ~5km
    }

    private List<String> getTemplatesForZone(String zone) {
        switch (zone) {
            case "Whitefield":
                return Arrays.asList(
                    "Traffic is deadlocked at Hope Farm signal! 🚗😱",
                    "Anyone want to carpool to Manyata from ITPL?",
                    "Best place for lunch near EPIP zone?",
                    "Selling my Gym membership (Gold's Gym). DM me.",
                    "Is the purple line metro running late today?",
                    "Found a set of keys near prestige shantiniketan gate 2.",
                    "Looking for a badminton partner at Gopalan Sports.",
                    "New brewery alert: Ironhill is packed tonight! 🍺"
                );
            case "Indiranagar":
                return Arrays.asList(
                    "Toit is absolutely full. Any other suggestions?",
                    "Live jazz at The Humming Tree tonight was epic! 🎷",
                    "Who is the best tattoo artist in 100ft road?",
                    "Lost my wallet near Metro station. Black leather.",
                    "Yoga classes starting in Defence Colony. Join us!",
                    "Apartment for rent: 2BHK, 45k. DM for details.",
                    "Review: The new sushi place is overrated. 🍣",
                    "Anyone heading to the flea market this Sunday?"
                );
            case "Koramangala":
                return Arrays.asList(
                    "Startup meet at Third Wave was intense! 🚀",
                    "Looking for a React developer. Immediate joining.",
                    "House party at 5th block. BYOB! 🍻",
                    "Anyone want to adopt a kitten? Found in 4th block.",
                    "Best coworking space for night owls?",
                    "Book club meeting this Saturday at 10am.",
                    "Selling my PS5. Barely used.",
                    "Traffic cops checking near Empire hotel. Watch out!"
                );
            default:
                return Arrays.asList(
                    "What a beautiful weather in Bangalore today! 🌦️",
                    "Traffic is crazy everywhere.",
                    "Best dosa place nearby?",
                    "Looking for friends to hang out with.",
                    "Anyone watching the match tonight?"
                );
        }
    }

    private Post.PostType inferType(String text) {
        String lower = text.toLowerCase();
        if (lower.contains("selling") || lower.contains("rent") || lower.contains("available")) return Post.PostType.MARKETPLACE;
        if (lower.contains("tonight") || lower.contains("meet") || lower.contains("party") || lower.contains("join")) return Post.PostType.EVENT_PROMO;
        if (lower.contains("news") || lower.contains("alert") || lower.contains("traffic")) return Post.PostType.LOCAL_NEWS;
        return Post.PostType.GENERAL;
    }
}
