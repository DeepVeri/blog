package com.deepveir.blog.controller;

import com.deepveir.blog.entity.Organization;
import com.deepveir.blog.repository.OrganizationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationRepository organizationRepository;

    public OrganizationController(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    // 列表: 获取所有组织
    @GetMapping
    public List<Organization> getAll() {
        return organizationRepository.findAll();
    }

    // 获取单个组织
    @GetMapping("/{id}")
    public ResponseEntity<Organization> getById(@PathVariable UUID id) {
        return organizationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 创建组织
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Organization org) {
        if (org.getOrgId() != null && organizationRepository.existsByOrgId(org.getOrgId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "组织ID已存在"));
        }
        if (org.getOrgId() == null || org.getOrgId().isEmpty()) {
            org.setOrgId(generateOrgId(org.getName()));
        }
        Organization saved = organizationRepository.save(org);
        return ResponseEntity.ok(saved);
    }

    // 更新组织
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Organization details) {
        Optional<Organization> optional = organizationRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Organization org = optional.get();
        if (details.getName() != null) org.setName(details.getName());
        if (details.getDescription() != null) org.setDescription(details.getDescription());
        if (details.getParentOrgId() != null) org.setParentOrgId(details.getParentOrgId());
        Organization saved = organizationRepository.save(org);
        return ResponseEntity.ok(saved);
    }

    // 删除组织
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        Optional<Organization> optional = organizationRepository.findById(id);
        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        organizationRepository.delete(optional.get());
        return ResponseEntity.ok(Map.of("message", "Organization deleted successfully"));
    }

    private String generateOrgId(String name) {
        if (name == null || name.isEmpty()) {
            return "org-" + System.currentTimeMillis();
        }
        String base = name.toLowerCase().replaceAll("[^a-z0-9-]", "-");
        if (base.isEmpty()) {
            base = "org";
        }
        return base + "-" + (System.currentTimeMillis() % 10000);
    }
}
