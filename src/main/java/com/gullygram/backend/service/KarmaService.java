package com.gullygram.backend.service;

import com.gullygram.backend.entity.KarmaSourceType;
import com.gullygram.backend.entity.KarmaTransaction;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.repository.KarmaTransactionRepository;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.repository.VibeCheckRepository;
import com.gullygram.backend.entity.VibeCheck;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KarmaService {

    private final KarmaTransactionRepository karmaTransactionRepository;
    private final UserRepository userRepository;
    private final VibeCheckRepository vibeCheckRepository;

    @Transactional
    public void awardKarma(UUID userId, int amount, KarmaSourceType sourceType, UUID sourceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create Transaction Record
        KarmaTransaction transaction = KarmaTransaction.builder()
                .user(user)
                .amount(amount)
                .sourceType(sourceType)
                .sourceId(sourceId)
                .build();
        
        karmaTransactionRepository.save(transaction);

        // Update Cached Score
        int newScore = (user.getKarmaScore() == null ? 100 : user.getKarmaScore()) + amount;
        user.setKarmaScore(newScore); // Update object for consistency if used later in transaction
        userRepository.updateKarmaScore(userId, newScore); // Native update avoids entity save issues

        log.info("Awarded {} karma to user {} for {}. New Score: {}", amount, userId, sourceType, newScore);
    }

    public int getKarmaScore(UUID userId) {
        return userRepository.findById(userId)
                .map(user -> Optional.ofNullable(user.getKarmaScore()).orElse(100))
                .orElse(100);
    }
    
    // TODO: Add pagination for history
    public java.util.List<KarmaTransaction> getKarmaHistory(UUID userId) {
        return karmaTransactionRepository.findAll().stream()
                .filter(kt -> kt.getUser().getId().equals(userId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(java.util.stream.Collectors.toList());
        // Note: In real app, use repository method findAllByUserIdOrderByCreatedAtDesc
    }

    @Transactional
    public void processHuddleCompletion(UUID huddleId) {
        log.info("Processing karma for completed huddle: {}", huddleId);
        
        List<VibeCheck> vibeChecks = vibeCheckRepository.findAllByHuddleId(huddleId);
        
        for (VibeCheck check : vibeChecks) {
            int rating = check.getVibeRating();
            int karmaChange;
            
            switch (rating) {
                case 5: karmaChange = 5; break;
                case 4: karmaChange = 2; break;
                case 3: karmaChange = 0; break; 
                case 2: karmaChange = -5; break;
                case 1: karmaChange = -10; break;
                default: karmaChange = 0;
            }
            
            if (karmaChange != 0) {
                try {
                    awardKarma(check.getReviewee().getId(), karmaChange, KarmaSourceType.VIBE_CHECK, check.getId());
                } catch (Exception e) {
                    log.error("Failed to award karma to user {} for vibe check {}", check.getReviewee().getId(), check.getId(), e);
                }
            }
        }
    }
    }
