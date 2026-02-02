package com.gullygram.backend.service;

import com.gullygram.backend.entity.Interest;
import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.entity.UserProfile;
import com.gullygram.backend.repository.InterestRepository;
import com.gullygram.backend.repository.PostRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.repository.UserProfileRepository;
import com.gullygram.backend.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeedContentService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final InterestRepository interestRepository;
    private final PasswordEncoder passwordEncoder; 

    private static final String BOT_EMAIL = "community@gullygram.com";
    private static final String BOT_ALIAS = "GullyGuide";

    @Transactional
    public void seedKoramangala() {
        User bot = getOrCreateBot();
        
        // 1. Events (Koramangala is the pub hub)
        createEvent(bot, "Startup Mixer @ Third Wave", 
            "Who's coming for the SaaS founder mixer tonight? Coffee is on me!", 
            12.9352, 77.6245, "Third Wave Coffee, Kormangala", "Koramangala", LocalDateTime.now().plusHours(4), "#Tech #Startup");

        createEvent(bot, "Live Jazz Night", 
            "The best Jazz band in town is playing tonight. Don't miss it!", 
            12.9340, 77.6100, "Gilly's Redefined", "Koramangala", LocalDateTime.now().plusDays(1).withHour(20), "#Music #Jazz #Nightlife");

        // 2. Chatter (General Posts)
        createPost(bot, "Traffic is absolute madness at Sony World Signal today! Avoid if possible. 🚗🛑", 
            12.9360, 77.6250, "#Traffic #Koramangala");

        createPost(bot, "Any good badminton courts open nearby for a game at 6 PM?", 
            12.9345, 77.6190, "#Sports #Badminton");

        createPost(bot, "Just tried the new cloud kitchen on 5th Block. amazing Biryani! 🍗", 
            12.9330, 77.6200, "#Foodie #Biryani");

        log.info("Seeded Koramangala content");
    }

    @Transactional
    public void seedIndiranagar() {
        User bot = getOrCreateBot();

        // 1. Events
        createEvent(bot, "Standup Comedy Open Mic", 
            "Come laugh (or cringe) at the new open mic night!", 
            12.9719, 77.6412, "Backyard, Indiranagar", "Indiranagar", LocalDateTime.now().plusDays(2).withHour(19), "#Comedy #Events");

        createEvent(bot, "Sunday Morning Park Run", 
            "Join us for a 5k run at Defense Colony Park. Beginners welcome!", 
            12.9700, 77.6400, "Defense Colony Park", "Indiranagar", LocalDateTime.now().plusDays(3).withHour(7), "#Fitness #Running");

        // 2. Chatter
        createPost(bot, "Toit is packed as usual! 🍺 Anyone here?", 
            12.9790, 77.6405, "#Nightlife #Indiranagar");

        createPost(bot, "Looking for a flatmate in decent 2BHK near 100ft road. DM me!", 
            12.9750, 77.6350, "#Housing #Flatmate");

        log.info("Seeded Indiranagar content");
    }

    @Transactional
    public void seedCustomLocation(double lat, double lon) {
        User bot = getOrCreateBot();
        String locationName = "Current Location";

        // 1. Events nearby
        createEvent(bot, "Local Tech Meetup", 
            "Weekly developer hangout. Come say hi!", 
            lat + 0.002, lon + 0.002, "Nearby Cafe", locationName, LocalDateTime.now().plusDays(1).withHour(18), "#Tech #Networking");

        createEvent(bot, "Morning Yoga Session", 
            "Open air yoga session tomorrow morning. Bring your mats!", 
            lat - 0.002, lon - 0.001, "Local Park", locationName, LocalDateTime.now().plusDays(1).withHour(6), "#Fitness #Yoga");

        // 2. Chatter around the user
        createPost(bot, "Does anyone know if the gym nearby is open 24/7?", 
            lat + 0.001, lon - 0.001, "#Fitness #Question");

        createPost(bot, "Found a set of keys near the metro station. DM me if lost!", 
            lat - 0.001, lon + 0.001, "#LostAndFound");
            
        createPost(bot, "Beautiful sunset today! ☀️", 
            lat, lon, "#Nature #Vibes");

        log.info("Seeded content at custom location: {}, {}", lat, lon);
    }

    private User getOrCreateBot() {
        return userRepository.findByEmail(BOT_EMAIL)
            .orElseGet(() -> {
                User newBot = User.builder()
                        .email(BOT_EMAIL)
                        .passwordHash(passwordEncoder.encode("Start123!")) // Dummy
                        .phone("+919999999999")
                        .status(User.UserStatus.ACTIVE)
                        .build();
                User savedBot = userRepository.save(newBot);
                
                // Create profile for bot
                UserProfile botProfile = UserProfile.builder()
                        .user(savedBot)
                        .alias(BOT_ALIAS)
                        .realName("Gully Guide")
                        .bio("Your friendly neighborhood guide to local happenings!")
                        .defaultRadiusKm(20)
                        .build();
                userProfileRepository.save(botProfile);
                
                return savedBot;
            });
    }

    private void createPost(User author, String text, double lat, double lon, String hashtags) {
        Set<Interest> interests = parseInterests(hashtags);
        
        Post post = Post.builder()
                .author(author)
                .type(Post.PostType.GENERAL)
                .text(text + " " + hashtags)
                .lat(lat)
                .lon(lon)
                .geohash(GeoUtil.generateGeohash(lat, lon))
                .visibilityRadiusKm(10)
                .visibility(Post.PostVisibility.PUBLIC)
                .interests(interests)
                .build();
        
        postRepository.save(post);
    }

    private void createEvent(User author, String title, String text, double lat, double lon, 
                             String venue, String city, LocalDateTime date, String hashtags) {
        Set<Interest> interests = parseInterests(hashtags);

        Post post = Post.builder()
                .author(author)
                .type(Post.PostType.EVENT_PROMO)
                .text("**" + title + "**\n" + text + " " + hashtags)
                .lat(lat)
                .lon(lon)
                .geohash(GeoUtil.generateGeohash(lat, lon))
                .visibilityRadiusKm(20)
                .visibility(Post.PostVisibility.PUBLIC) // Events are public
                .eventDate(date)
                .eventLocationName(venue)
                .eventCity(city)
                .interests(interests)
                .build();

        postRepository.save(post);
    }

    private Set<Interest> parseInterests(String tags) {
        // Simple parser using the existing names
        Set<Interest> interests = new HashSet<>();
        // In a real scenario, we'd lookup or create. For now, try lookup.
        // Or leave empty if we trust the PostService auto-tagging (but we are bypassing service here to be fast)
        // Let's rely on manual lookup for simplicity or just empty.
        // Actually, to make "Interest Boost" work, we SHOULD link them.
        String[] parts = tags.split(" ");
        for (String part : parts) {
            if (part.startsWith("#")) {
                String name = part.substring(1);
                interestRepository.findByName(name).ifPresent(interests::add);
            }
        }
        return interests;
    }
}
