package com.gullygram.backend.repository;

import com.gullygram.backend.entity.AreaVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AreaVoteRepository extends JpaRepository<AreaVote, String> {
    
    // Get top areas by votes
    List<AreaVote> findAllByOrderByVoteCountDesc();
}
