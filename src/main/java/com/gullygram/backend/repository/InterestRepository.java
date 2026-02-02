package com.gullygram.backend.repository;

import com.gullygram.backend.entity.Interest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterestRepository extends JpaRepository<Interest, Integer> {
    
    Optional<Interest> findByName(String name);
    
    List<Interest> findByIdIn(List<Integer> ids);

    List<Interest> findByNameInIgnoreCase(List<String> names);
}
