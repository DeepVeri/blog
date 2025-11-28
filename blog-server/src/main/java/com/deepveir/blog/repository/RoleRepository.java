package com.deepveir.blog.repository;

import com.deepveir.blog.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    boolean existsByName(String name);
    boolean existsByRoleId(String roleId);
    Optional<Role> findByRoleId(String roleId);
}
