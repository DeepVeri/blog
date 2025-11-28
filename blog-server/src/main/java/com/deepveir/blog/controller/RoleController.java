package com.deepveir.blog.controller;

import com.deepveir.blog.entity.Role;
import com.deepveir.blog.entity.Menu;
import com.deepveir.blog.repository.RoleRepository;
import com.deepveir.blog.repository.MenuRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleRepository roleRepository;
    private final MenuRepository menuRepository;

    public RoleController(RoleRepository roleRepository, MenuRepository menuRepository) {
        this.roleRepository = roleRepository;
        this.menuRepository = menuRepository;
    }

    // List all roles
    @GetMapping
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    // Create a role
    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody Role role) {
        if (roleRepository.existsByName(role.getName())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role name already exists"));
        }
        // Ensure roleId is set (NOT NULL column)
        if (role.getRoleId() == null || role.getRoleId().isEmpty()) {
            String baseId = role.getName() != null ? role.getName() : "role";
            baseId = baseId.toLowerCase().replaceAll("[^a-z0-9-]", "-");
            if (baseId.isEmpty()) {
                baseId = "role";
            }
            role.setRoleId(baseId);
        }
        Role savedRole = roleRepository.save(role);
        return ResponseEntity.ok(savedRole);
    }

    // Update a role
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRole(@PathVariable UUID id, @RequestBody Role roleDetails) {
        return roleRepository.findById(id).map(role -> {
            if (roleDetails.getName() != null) role.setName(roleDetails.getName());
            if (roleDetails.getDescription() != null) role.setDescription(roleDetails.getDescription());
            roleRepository.save(role);
            return ResponseEntity.ok(role);
        }).orElse(ResponseEntity.notFound().build());
    }

    // Delete a role
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable UUID id) {
        return roleRepository.findById(id).map(role -> {
            roleRepository.delete(role);
            return ResponseEntity.ok(Map.of("message", "Role deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // Get menu IDs assigned to a role
    @GetMapping("/{id}/menus")
    public ResponseEntity<?> getRoleMenus(@PathVariable UUID id) {
        return roleRepository.findById(id)
                .map(role -> {
                    Set<Menu> menus = role.getMenus();
                    List<String> menuIds = menus.stream()
                            .map(Menu::getMenuId)
                            .toList();
                    return ResponseEntity.ok(menuIds);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Update menus assigned to a role
    @PutMapping("/{id}/menus")
    public ResponseEntity<?> updateRoleMenus(@PathVariable UUID id, @RequestBody List<String> menuIds) {
        return roleRepository.findById(id)
                .map(role -> {
                    List<Menu> menus = menuIds == null || menuIds.isEmpty()
                            ? List.of()
                            : menuRepository.findByMenuIdIn(menuIds);
                    role.setMenus(new HashSet<>(menus));
                    roleRepository.save(role);
                    return ResponseEntity.ok(Map.of("message", "Role menus updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
