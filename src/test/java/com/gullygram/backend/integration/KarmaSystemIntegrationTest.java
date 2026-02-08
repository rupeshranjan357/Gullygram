package com.gullygram.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gullygram.backend.dto.request.CreateHuddleRequest;
import com.gullygram.backend.dto.request.SubmitVibeCheckRequest;
import com.gullygram.backend.entity.Huddle;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.repository.HuddleRepository;
import com.gullygram.backend.repository.KarmaTransactionRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.repository.VibeCheckRepository;
import com.gullygram.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
public class KarmaSystemIntegrationTest {

    @Autowired
    private MockMvc mockMvc; // Injects MockMvc, not standard web client
    
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private HuddleRepository huddleRepository;
    @Autowired
    private VibeCheckRepository vibeCheckRepository;
    @Autowired
    private KarmaTransactionRepository karmaTransactionRepository;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private ObjectMapper objectMapper;

    private User userA; // Reviewer
    private User userB; // Reviewee
    private String tokenA;
    private String tokenB;
    private Huddle huddle;

    @BeforeEach
    void setUp() throws Exception {
        // CLEANUP
        vibeCheckRepository.deleteAll();
        karmaTransactionRepository.deleteAll();
        huddleRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Users
        userA = userRepository.save(User.builder()
                .email("reviewer@test.com")
                .phone("9999999991")
                .passwordHash("hash")
                .karmaScore(100)
                .build());
        
        userB = userRepository.save(User.builder()
                .email("reviewee@test.com")
                .phone("9999999992")
                .passwordHash("hash")
                .karmaScore(100)
                .build());

        tokenA = jwtUtil.generateToken(userA.getId());
        tokenB = jwtUtil.generateToken(userB.getId());

        // 2. Create Huddle (User A is creator -> automatically joined)
        CreateHuddleRequest createRequest = new CreateHuddleRequest();
        createRequest.setTitle("Karma Test Huddle");
        createRequest.setLat(12.9716);
        createRequest.setLon(77.6412);
        createRequest.setStartTime(LocalDateTime.now().plusHours(1));
        createRequest.setEndTime(LocalDateTime.now().plusHours(2));
        createRequest.setMaxParticipants(5);
        createRequest.setGenderFilter(Huddle.GenderFilter.EVERYONE);

        String huddleJson = mockMvc.perform(post("/api/huddles")
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        
        // Extract Huddle ID
        // Simple extraction for test speed
        String huddleIdStr = huddleJson.split("\"id\":\"")[1].split("\"")[0];
        huddle = huddleRepository.findById(java.util.UUID.fromString(huddleIdStr)).get();

        // 3. User B joins Huddle
        mockMvc.perform(post("/api/huddles/" + huddle.getId() + "/join")
                .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk());
    }

    @Test
    void testVibeCheckFlow() throws Exception {
        // User A gives User B a 5-star rating
        SubmitVibeCheckRequest vibeRequest = new SubmitVibeCheckRequest();
        vibeRequest.setHuddleId(huddle.getId());
        vibeRequest.setRevieweeId(userB.getId());
        vibeRequest.setRating(5);
        vibeRequest.setTags(List.of("Chill", "On Time"));

        // ACTION: Submit Vibe Check
        mockMvc.perform(post("/api/karma/vibe-check")
                .header("Authorization", "Bearer " + tokenA) // A reviews B
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vibeRequest)))
                .andExpect(status().isOk());

        // VERIFICATION 1: Check Vibe Check saved
        assertTrue(vibeCheckRepository.existsByReviewerIdAndRevieweeIdAndHuddleId(
                userA.getId(), userB.getId(), huddle.getId()));

        // VERIFICATION 2: Check User B Karma Increased (+5)
        User updatedUserB = userRepository.findById(userB.getId()).get();
        assertEquals(105, updatedUserB.getKarmaScore());

        // VERIFICATION 3: Check History
        mockMvc.perform(get("/api/karma/history")
                .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk());
        
        // ERROR CASE: Duplicate Review
        mockMvc.perform(post("/api/karma/vibe-check")
                .header("Authorization", "Bearer " + tokenA)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vibeRequest)))
                .andExpect(status().isConflict()); // Should return 409
    }
}
