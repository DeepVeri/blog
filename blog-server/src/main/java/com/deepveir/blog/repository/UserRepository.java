package com.deepveir.blog.repository;

import com.deepveir.blog.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserId(String userId);
    boolean existsByUserId(String userId);
    List<User> findByEmailContainingIgnoreCaseOrUsernameContainingIgnoreCase(String email, String username);
}
