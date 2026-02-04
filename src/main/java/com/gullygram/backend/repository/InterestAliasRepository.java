package com.gullygram.backend.repository;

import com.gullygram.backend.entity.InterestAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface InterestAliasRepository extends JpaRepository<InterestAlias, Integer> {
    
    Optional<InterestAlias> findByAliasIgnoreCase(String alias);
    
    @Query("SELECT ia FROM InterestAlias ia WHERE LOWER(ia.alias) IN :aliases")
    List<InterestAlias> findByAliasIn(@Param("aliases") Set<String> aliases);
}
