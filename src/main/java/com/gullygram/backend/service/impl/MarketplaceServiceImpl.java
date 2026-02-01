package com.gullygram.backend.service.impl;

import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.User;
import com.gullygram.backend.repository.UserRepository;
import com.gullygram.backend.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceServiceImpl implements MarketplaceService {

    private final UserRepository userRepository;

    @Override
    public void validateMarketingPostLimit(User user) {
        if (user.getAccountType() != User.AccountType.COMPANY) {
            throw new IllegalArgumentException("Only COMPANY accounts can create MARKETING posts.");
        }

        if (user.getLastMarketingPostAt() != null) {
            LocalDate lastPostDate = user.getLastMarketingPostAt().toLocalDate();
            LocalDate today = LocalDate.now();

            if (lastPostDate.equals(today)) {
                throw new IllegalStateException("Daily limit reached: Companies can only post 1 marketing post per day.");
            }
        }
    }

    @Override
    @Transactional
    public void handlePostCreated(User user, Post post) {
        if (post.getType() == Post.PostType.MARKETING) {
            user.setLastMarketingPostAt(LocalDateTime.now());
            userRepository.save(user);
            log.info("Updated lastMarketingPostAt for company: {}", user.getId());
        }
    }
}
