package com.gullygram.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gullygram.backend.dto.request.CreateHuddleRequest;
import com.gullygram.backend.entity.Huddle;
import com.gullygram.backend.entity.HuddleParticipant;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.repository.HuddleParticipantRepository;
import com.gullygram.backend.repository.HuddleRepository;
import com.gullygram.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class HuddleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HuddleRepository huddleRepository;

    @Autowired
    private HuddleParticipantRepository huddleParticipantRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User creator;
    private User joiner;
    private User outsider;

    @BeforeEach
    public void setup() {
        huddleParticipantRepository.deleteAll();
        huddleRepository.deleteAll();
        userRepository.deleteAll();

        // Create Users
        creator = userRepository.save(User.builder()
                .email("creator@test.com").passwordHash("hash").phone("1234567890").status(User.UserStatus.ACTIVE).build());
        
        joiner = userRepository.save(User.builder()
                .email("joiner@test.com").passwordHash("hash").phone("0987654321").status(User.UserStatus.ACTIVE).build());

        outsider = userRepository.save(User.builder()
                .email("outsider@test.com").passwordHash("hash").phone("1122334455").status(User.UserStatus.ACTIVE).build());
    }

    private void mockUser(User user) {
        // Manually setting security context for @CurrentUser resolution
        // Assuming the custom argument resolver uses the Principal or authentication details
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(user.getId(), null, Collections.emptyList())
        );
    }

    @Test
    public void testCreateHuddle_Success() throws Exception {
        mockUser(creator);

        CreateHuddleRequest request = new CreateHuddleRequest();
        request.setTitle("Badminton Match");
        request.setDescription("Looking for 2 players");
        request.setLat(12.9716);
        request.setLon(77.5946);
        request.setLocationName("Cubbon Park");
        request.setStartTime(LocalDateTime.now().plusHours(2));
        request.setEndTime(LocalDateTime.now().plusHours(4));
        request.setMaxParticipants(4);
        request.setGenderFilter(Huddle.GenderFilter.EVERYONE);

        mockMvc.perform(post("/api/huddles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Badminton Match")))
                .andExpect(jsonPath("$.creator.email", is("creator@test.com")))
                .andExpect(jsonPath("$.isJoined", is(true))) // Creator should auto-join
                .andExpect(jsonPath("$.currentParticipants", is(1)));
        
        // Verify DB
        assertEquals(1, huddleRepository.count());
    }

    @Test
    public void testCreateHuddle_PastTime_ShouldFail() throws Exception {
        mockUser(creator);

        CreateHuddleRequest request = new CreateHuddleRequest();
        request.setTitle("Past Event");
        request.setLat(12.9716);
        request.setLon(77.5946);
        request.setStartTime(LocalDateTime.now().minusHours(1)); // PAST
        request.setEndTime(LocalDateTime.now().plusHours(1));

        mockMvc.perform(post("/api/huddles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testGeospatialFiltering() throws Exception {
        // 1. Create Huddle in Bangalore (Central)
        Huddle blrHuddle = huddleRepository.save(Huddle.builder()
                .creator(creator).title("Bangalore Huddle")
                .lat(12.9716).lon(77.5946)
                .startTime(LocalDateTime.now().plusHours(1)).endTime(LocalDateTime.now().plusHours(2))
                .status(Huddle.HuddleStatus.OPEN).maxParticipants(10).genderFilter(Huddle.GenderFilter.EVERYONE)
                .build());

        // 2. Create Huddle in Delhi (Far away)
        huddleRepository.save(Huddle.builder()
                .creator(creator).title("Delhi Huddle")
                .lat(28.7041).lon(77.1025)
                .startTime(LocalDateTime.now().plusHours(1)).endTime(LocalDateTime.now().plusHours(2))
                .status(Huddle.HuddleStatus.OPEN).maxParticipants(10).genderFilter(Huddle.GenderFilter.EVERYONE)
                .build());

        mockUser(joiner);

        // 3. Search near Bangalore (Radius 10km) -> Should find 1
        mockMvc.perform(get("/api/huddles")
                .param("lat", "12.9716")
                .param("lon", "77.5946")
                .param("radius", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Bangalore Huddle")));

        // 4. Search near Mumbai (Far from both) -> Should find 0
        mockMvc.perform(get("/api/huddles")
                .param("lat", "19.0760")
                .param("lon", "72.8777")
                .param("radius", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    public void testJoinAndLeaveHuddle() throws Exception {
        // Create Huddle
        Huddle huddle = huddleRepository.save(Huddle.builder()
                .creator(creator).title("Join Me")
                .lat(12.9716).lon(77.5946)
                .startTime(LocalDateTime.now().plusHours(1)).endTime(LocalDateTime.now().plusHours(2))
                .status(Huddle.HuddleStatus.OPEN).maxParticipants(5).genderFilter(Huddle.GenderFilter.EVERYONE)
                .build());
        
        // Auto-join creator manually for test setup consistency (Service does it, but we used Repo here)
        huddleParticipantRepository.save(HuddleParticipant.builder().huddle(huddle).user(creator).status(HuddleParticipant.ParticipantStatus.JOINED).build());

        mockUser(joiner);

        // 1. Join
        mockMvc.perform(post("/api/huddles/" + huddle.getId() + "/join"))
                .andExpect(status().isOk());

        // Verify participant count
        assertEquals(2, huddleParticipantRepository.countByHuddleIdAndStatus(huddle.getId(), HuddleParticipant.ParticipantStatus.JOINED));
        
        // 2. Idempotent Join (Join again) - Should not error, count remains same
        mockMvc.perform(post("/api/huddles/" + huddle.getId() + "/join"))
                .andExpect(status().isOk());
        assertEquals(2, huddleParticipantRepository.countByHuddleIdAndStatus(huddle.getId(), HuddleParticipant.ParticipantStatus.JOINED));

        // 3. Leave
        mockMvc.perform(post("/api/huddles/" + huddle.getId() + "/leave"))
                .andExpect(status().isOk());
        
        assertEquals(1, huddleParticipantRepository.countByHuddleIdAndStatus(huddle.getId(), HuddleParticipant.ParticipantStatus.JOINED));
        
        // Verify status is LEFT
        assertTrue(huddleParticipantRepository.findByHuddleIdAndUserId(huddle.getId(), joiner.getId()).get().getStatus() == HuddleParticipant.ParticipantStatus.LEFT);
    }

    @Test
    public void testMaxParticipantsLimit() throws Exception {
        // Create Huddle with Max 1 (Creator takes 1 slot)
        Huddle huddle = huddleRepository.save(Huddle.builder()
                .creator(creator).title("Exclusive")
                .lat(12.9716).lon(77.5946)
                .startTime(LocalDateTime.now().plusHours(1)).endTime(LocalDateTime.now().plusHours(2))
                .status(Huddle.HuddleStatus.OPEN).maxParticipants(1).genderFilter(Huddle.GenderFilter.EVERYONE)
                .build());
        huddleParticipantRepository.save(HuddleParticipant.builder().huddle(huddle).user(creator).status(HuddleParticipant.ParticipantStatus.JOINED).build());

        mockUser(joiner);

        // Try to join (Should fail as 1/1 is taken)
        mockMvc.perform(post("/api/huddles/" + huddle.getId() + "/join"))
                .andExpect(status().isBadRequest());
    }
}
