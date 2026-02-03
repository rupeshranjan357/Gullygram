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
import java.util.HashSet; // Added
import java.util.List;
import java.util.Random;
import java.util.Set; // Added
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

    // Replaced by new implementation below
    // (This block is intentionally empty as the logic was moved to the bottom of the file in the previous step
    //  and we are cleaning up the duplicate method signature if it exists, or rather, we should update THIS 
    //  method to be the authoritative one if I didn't replace it correctly).
    //
    // Actually, looking at the previous step, I replaced `inferType` at the BOTTOM with `inferType` + `seedMagicContent`.
    // So now we have TWO `seedMagicContent` methods? Java doesn't allow that.
    // I must DELETE the original `seedMagicContent` method here.
    
    // Deleting the old implementation to avoid compilation error.
    // (The new one is at the bottom of the file)

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

    // --- ENHANCED LOGIC ---

    private void simulateConversation(UUID postId, List<AuthResponse> users) {
        if (users.size() < 2) return;
        
        // Pick two bots to have a chat
        AuthResponse botA = users.get(random.nextInt(users.size()));
        AuthResponse botB = users.get(random.nextInt(users.size()));
        while (botB.getUserId().equals(botA.getUserId())) {
            botB = users.get(random.nextInt(users.size()));
        }

        List<String[]> conversations = Arrays.asList(
            new String[]{"Is this still available?", "Yes! DM me.", "Sent."},
            new String[]{"What time?", "Starts at 7 PM.", "Perfect, see you there!"},
            new String[]{"Can you share location?", "Just sent you a pin.", "Got it, thanks!"},
            new String[]{"Price negotiable?", "Slightly. Make an offer.", "Check DM."},
            new String[]{"Looks amazing!", "You should come next time!", "Definitely will."}
        );

        String[] thread = conversations.get(random.nextInt(conversations.size()));

        for (int i = 0; i < thread.length; i++) {
            // Alternate between A and B
            AuthResponse speaker = (i % 2 == 0) ? botA : botB;
            
            try {
                // Add slight delay simulation (createdAt would need to be tweaked in real world, but for feed sort it's fine)
                CreateCommentRequest req = new CreateCommentRequest();
                req.setText(thread[i]);
                commentService.createComment(postId, speaker.getUserId(), req);
            } catch (Exception ignored) {}
        }
    }

    private double[] getRandomLocationInAnnulus(double centerLat, double centerLon, double minKm, double maxKm) {
        // Random point between minKm and maxKm from center
        double distKm = minKm + (maxKm - minKm) * Math.sqrt(random.nextDouble()); // sqrt for uniform area distribution
        double bearing = random.nextDouble() * 2 * Math.PI;

        double distDeg = distKm / 111.0; // Rough approx
        
        double newLat = centerLat + distDeg * Math.cos(bearing);
        double newLon = centerLon + distDeg * Math.sin(bearing) / Math.cos(Math.toRadians(centerLat));
        
        return new double[]{newLat, newLon};
    }

    @Transactional
    public void seedMagicContent(Double lat, Double lon) {
        log.info("🧙‍♂️ Casting Magic Content Policy at {}, {}", lat, lon);

        String zone = identifyZone(lat, lon);
        List<String> postTemplates = getTemplatesForZone(zone);
        List<AuthResponse> users = ensureBotUsers(zone);

        // 1. DENSE LOCAL CLUSTER (Your hood) - 20 posts
        for (int i = 0; i < 20; i++) {
             String template = postTemplates.get(random.nextInt(postTemplates.size()));
             createPostWithJitter(template, lat, lon, 0.012, users); // ~1km jitter
        }

        // 2. REMOTE CLUSTERS (Hotspots) - 5 posts each
        // Simulating traction in nearby areas
        double[][] hotspots = {
            {12.9141, 77.6518}, // HSR Layout (~8km away)
            {13.0359, 77.5971}, // Hebbal (~10km away)
            {12.2958, 76.6394}  // Mysore (~140km away - good for extreme test)
        };

        List<String> hotspotTemplates = Arrays.asList(
             "Traffic here is worse than Silk Board! 🚦", 
             "Anyone up for a weekend ride? 🏍️",
             "Looking for flatmates in this area.",
             "Just tried the new cafe here. 4/5 stars. ☕",
             "Raining heavily here! Stay safe."
        );

        for (double[] spot : hotspots) {
            for (int k = 0; k < 5; k++) {
                String t = hotspotTemplates.get(random.nextInt(hotspotTemplates.size()));
                createPostWithJitter(t, spot[0], spot[1], 0.01, users);
            }
        }

        // 3. WIDE SCATTER (5km - 50km) - 30 posts
        // Testing the core radius algorithm
        List<String> wideTemplates = Arrays.asList(
            "Weekend getaway plan! #Travel ✈️", 
            "Anyone know a good mechanic in North Bangalore? #Help 🔧",
            "Huge sale at Orion Mall! #Shopping 🛍️",
            "Rain update: Heavy downpour near Airport. Drive safe! #Weather ⛈️",
            "Looking for trekking group for Nandi Hills. #Adventure ⛰️",
            "Review: new tech park cafeteria food. #Food 🍱",
            "Javascript meetup this Saturday! #Technology 💻",
            "Gold's Gym membership transfer available. #Fitness 🏋️‍♂️",
            "Anyone learned Salsa? Looking for classes. #Dance 💃"
        );

        for (int i = 0; i < 30; i++) {
            String template = wideTemplates.get(random.nextInt(wideTemplates.size()));
            double[] loc = getRandomLocationInAnnulus(lat, lon, 4.0, 45.0);
            createPostWithJitter(template, loc[0], loc[1], 0.005, users);
        }
    }

    private void createPostWithJitter(String template, double lat, double lon, double jitter, List<AuthResponse> users) {
        AuthResponse author = users.get(random.nextInt(users.size()));
        
        double pLat = lat + (random.nextDouble() - 0.5) * jitter;
        double pLon = lon + (random.nextDouble() - 0.5) * jitter;

        CreatePostRequest postReq = new CreatePostRequest();
        postReq.setText(template);
        postReq.setLatitude(pLat);
        postReq.setLongitude(pLon);
        postReq.setType(inferType(template));
        postReq.setFriendsOnly(false);

        // --- INTEREST MAPPING (Based on V1__init_users.sql) ---
        Set<Integer> interestIds = new HashSet<>();
        String lower = template.toLowerCase();
        
        if (lower.contains("fitness") || lower.contains("gym")) interestIds.add(13); // Fitness
        if (lower.contains("technology") || lower.contains("react") || lower.contains("javascript")) interestIds.add(6); // Technology
        if (lower.contains("food") || lower.contains("cafe") || lower.contains("sushi")) interestIds.add(8); // Food
        if (lower.contains("travel") || lower.contains("getaway") || lower.contains("trekking")) interestIds.add(7); // Travel
        if (lower.contains("dance") || lower.contains("salsa")) interestIds.add(3); // Dance
        if (lower.contains("music") || lower.contains("jazz")) interestIds.add(4); // Music
        
        if (!interestIds.isEmpty()) {
            postReq.setInterestIds(interestIds);
        }

        PostResponse post = postService.createPost(author.getUserId(), postReq);

        // Time Travel (0 - 3 days to show decent feed history)
        int hoursAgo = random.nextInt(72);
        LocalDateTime pastTime = LocalDateTime.now().minusHours(hoursAgo);
        postRepository.updateCreatedAt(post.getId(), pastTime);

        // Engage
        simulateEngagement(post.getId(), users);
        
        // 60% chance of a full conversation
        if (random.nextDouble() < 0.6) {
            simulateConversation(post.getId(), users);
        }
    }
}
