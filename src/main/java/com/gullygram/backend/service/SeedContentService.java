package com.gullygram.backend.service;

import com.gullygram.backend.entity.Interest;
import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.repository.InterestRepository;
import com.gullygram.backend.repository.PostRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.util.GeoUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
    private final InterestRepository interestRepository; 

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

    private User getOrCreateBot() {
        return userRepository.findByEmail(BOT_EMAIL)
            .orElseGet(() -> {
                User newBot = User.builder()
                        .email(BOT_EMAIL)
                        .password("Start123!") // Dummy
                        .alias(BOT_ALIAS)
                        .phone("+919999999999")
                        .status(User.UserStatus.ACTIVE)
                        .build();
                return userRepository.save(newBot);
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
