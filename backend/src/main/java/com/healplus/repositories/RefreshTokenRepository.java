package com.healplus.repositories;

import com.healplus.entities.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
    
    Optional<RefreshToken> findByToken(String token);
    
    List<RefreshToken> findByUserId(String userId);
    
    List<RefreshToken> findByUserIdAndRevokedFalse(String userId);
    
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true, r.revokedAt = :now WHERE r.userId = :userId AND r.revoked = false")
    int revokeAllByUserId(@Param("userId") String userId, @Param("now") Instant now);
    
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :now OR (r.revoked = true AND r.revokedAt < :threshold)")
    int deleteExpiredTokens(@Param("now") Instant now, @Param("threshold") Instant threshold);
    
    @Query("SELECT COUNT(r) FROM RefreshToken r WHERE r.userId = :userId AND r.revoked = false AND r.expiresAt > :now")
    long countActiveTokensByUserId(@Param("userId") String userId, @Param("now") Instant now);
}
