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
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
public class KarmaIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    
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

    private User hostUser;
    private User participantUser;
    private String hostToken;
    private String participantToken;
    private Huddle huddle;

    @BeforeEach
    void setUp() throws Exception {
        // CLEANUP
        vibeCheckRepository.deleteAll();
        karmaTransactionRepository.deleteAll();
        huddleRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Users
        hostUser = userRepository.save(User.builder()
                .email("host@test.com")
                .phone("9999999991")
                .passwordHash("hash")
                .karmaScore(100)
                .build());
        
        participantUser = userRepository.save(User.builder()
                .email("participant@test.com")
                .phone("9999999992")
                .passwordHash("hash")
                .karmaScore(100)
                .build());

        hostToken = jwtUtil.generateToken(hostUser.getId());
        participantToken = jwtUtil.generateToken(participantUser.getId());

        // 2. Create Huddle (Host is creator -> automatically joined)
        CreateHuddleRequest createRequest = new CreateHuddleRequest();
        createRequest.setTitle("Karma Completion Test Huddle");
        createRequest.setLat(12.9716);
        createRequest.setLon(77.6412);
        createRequest.setStartTime(LocalDateTime.now().plusHours(1));
        createRequest.setEndTime(LocalDateTime.now().plusHours(2));
        createRequest.setMaxParticipants(5);
        createRequest.setGenderFilter(Huddle.GenderFilter.EVERYONE);

        String huddleJson = mockMvc.perform(post("/api/huddles")
                .header("Authorization", "Bearer " + hostToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        
        // Extract Huddle ID
        String huddleIdStr = huddleJson.split("\"id\":\"")[1].split("\"")[0];
        huddle = huddleRepository.findById(UUID.fromString(huddleIdStr)).get();

        // 3. Participant joins Huddle
        mockMvc.perform(post("/api/huddles/" + huddle.getId() + "/join")
                .header("Authorization", "Bearer " + participantToken))
                .andExpect(status().isOk());
    }

    @Test
    void testHuddleCompletionTriggersKarmaUpdate() throws Exception {
        // 1. Participant rates Host (5 stars)
        SubmitVibeCheckRequest vibeRequest = new SubmitVibeCheckRequest();
        vibeRequest.setHuddleId(huddle.getId());
        vibeRequest.setRevieweeId(hostUser.getId());
        vibeRequest.setRating(5);
        vibeRequest.setTags(List.of("Great Host"));

        mockMvc.perform(post("/api/karma/vibe-check")
                .header("Authorization", "Bearer " + participantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vibeRequest)))
                .andExpect(status().isOk());

        // VERIFY: No karma change yet (removed immediate award)
        User hostBeforeCompletion = userRepository.findById(hostUser.getId()).get();
        assertEquals(100, hostBeforeCompletion.getKarmaScore(), "Karma should not change before completion");

        // 2. Host completes the Huddle
        mockMvc.perform(post("/api/huddles/" + huddle.getId() + "/complete")
                .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isOk());

        // 3. Verify Huddle Status is COMPLETED
        Huddle completedHuddle = huddleRepository.findById(huddle.getId()).get();
        assertEquals(Huddle.HuddleStatus.COMPLETED, completedHuddle.getStatus());

        // 4. Verify Host Karma Increased (+5)
        User hostAfterCompletion = userRepository.findById(hostUser.getId()).get();
        assertEquals(105, hostAfterCompletion.getKarmaScore(), "Karma should increase by 5 after completion");
        
        // 5. Verify Transaction
        assertTrue(karmaTransactionRepository.findAll().stream()
                .anyMatch(t -> t.getUser().getId().equals(hostUser.getId()) && t.getAmount() == 5));
    }
    
    @Test
    void testHuddleCompletionWithNegativeRating() throws Exception {
        // 1. Participant rates Host (1 star)
        SubmitVibeCheckRequest vibeRequest = new SubmitVibeCheckRequest();
        vibeRequest.setHuddleId(huddle.getId());
        vibeRequest.setRevieweeId(hostUser.getId());
        vibeRequest.setRating(1);
        vibeRequest.setTags(List.of("Did not show up"));

        mockMvc.perform(post("/api/karma/vibe-check")
                .header("Authorization", "Bearer " + participantToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vibeRequest)))
                .andExpect(status().isOk());

        // 2. Host completes the Huddle
        mockMvc.perform(post("/api/huddles/" + huddle.getId() + "/complete")
                .header("Authorization", "Bearer " + hostToken))
                .andExpect(status().isOk());

        // 3. Verify Host Karma Decreased (-10)
        User hostAfterCompletion = userRepository.findById(hostUser.getId()).get();
        assertEquals(90, hostAfterCompletion.getKarmaScore(), "Karma should decrease by 10 after completion");
    }
}
