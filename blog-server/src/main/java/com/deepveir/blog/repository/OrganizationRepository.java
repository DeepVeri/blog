package com.deepveir.blog.repository;

import com.deepveir.blog.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    boolean existsByOrgId(String orgId);

    Optional<Organization> findByOrgId(String orgId);

    List<Organization> findByParentOrgId(String parentOrgId);
}
