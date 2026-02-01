package com.gullygram.backend.service;

import com.gullygram.backend.entity.Post;
import com.gullygram.backend.entity.User;

public interface MarketplaceService {
    void validateMarketingPostLimit(User user);
    void handlePostCreated(User user, Post post);
}
