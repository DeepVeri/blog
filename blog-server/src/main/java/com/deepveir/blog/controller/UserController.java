package com.deepveir.blog.controller;

import com.deepveir.blog.dto.UserRequestDto;
import com.deepveir.blog.entity.Role;
import com.deepveir.blog.entity.User;
import com.deepveir.blog.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // 查: 获取所有用户
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // 查: 按关键字搜索用户（邮箱或昵称模糊匹配）
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam("keyword") String keyword) {
        return userService.searchUsers(keyword);
    }

    // 增: 创建用户
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserRequestDto dto) {
        User user = new User();
        user.setUserId(dto.getUserId());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setUsername(dto.getUsername());
        user.setStatus(dto.getStatus());
        user.setAvatar(dto.getAvatar());
        user.setBio(dto.getBio());
        user.setWebsite(dto.getWebsite());
        user.setOrganization(dto.getOrganization());
        user.setJobTitle(dto.getJobTitle());
        user.setPhone(dto.getPhone());

        if (dto.getRole() != null && dto.getRole().getId() != null) {
            Role role = new Role();
            role.setId(dto.getRole().getId());
            user.setRole(role);
        }

        if (dto.getOrganizationEntity() != null && dto.getOrganizationEntity().getOrgId() != null) {
            com.deepveir.blog.entity.Organization org = new com.deepveir.blog.entity.Organization();
            org.setOrgId(dto.getOrganizationEntity().getOrgId());
            user.setOrganizationEntity(org);
        }

        Object result = userService.createUser(user);
        if (result instanceof Map && ((Map<?, ?>) result).containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    // 查: 获取单个用户
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 查: 通过可读 userId 获取用户（例如 "admin"）
    @GetMapping("/by-user-id/{userId}")
    public ResponseEntity<User> getUserByUserId(@PathVariable String userId) {
        return userService.getUserByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 改: 更新用户信息
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @RequestBody UserRequestDto dto) {
        User userDetails = new User();
        userDetails.setEmail(dto.getEmail());
        userDetails.setPassword(dto.getPassword());
        userDetails.setUsername(dto.getUsername());
        userDetails.setStatus(dto.getStatus());
        userDetails.setAvatar(dto.getAvatar());
        userDetails.setBio(dto.getBio());
        userDetails.setWebsite(dto.getWebsite());
        userDetails.setOrganization(dto.getOrganization());
        userDetails.setJobTitle(dto.getJobTitle());
        userDetails.setPhone(dto.getPhone());

        if (dto.getRole() != null && dto.getRole().getId() != null) {
            Role role = new Role();
            role.setId(dto.getRole().getId());
            userDetails.setRole(role);
        }

        if (dto.getOrganizationEntity() != null && dto.getOrganizationEntity().getOrgId() != null) {
            com.deepveir.blog.entity.Organization org = new com.deepveir.blog.entity.Organization();
            org.setOrgId(dto.getOrganizationEntity().getOrgId());
            userDetails.setOrganizationEntity(org);
        }

        return userService.updateUser(id, userDetails)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 删: 删除用户
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable UUID id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
