package com.deepveir.blog.service;

import com.deepveir.blog.entity.Role;
import com.deepveir.blog.entity.User;
import com.deepveir.blog.repository.OrganizationRepository;
import com.deepveir.blog.repository.RoleRepository;
import com.deepveir.blog.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       OrganizationRepository organizationRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return userRepository.findAll();
        }
        return userRepository.findByEmailContainingIgnoreCaseOrNameContainingIgnoreCase(keyword, keyword);
    }

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByUserId(String userId) {
        return userRepository.findByUserId(userId);
    }

    public Object createUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return Map.of("error", "该邮箱已被注册");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            return Map.of("error", "密码不能为空");
        }

        if (user.getUserId() == null || user.getUserId().isEmpty()) {
            String email = user.getEmail();
            String baseId = email != null ? email.split("@")[0] : "user";
            baseId = baseId.toLowerCase().replaceAll("[^a-z0-9-]", "-");
            if (baseId.isEmpty()) {
                baseId = "user";
            }
            // 检查 userId 是否已存在，如果存在则添加随机后缀
            String finalUserId = baseId;
            int suffix = 1;
            while (userRepository.findByUserId(finalUserId).isPresent()) {
                finalUserId = baseId + "-" + suffix;
                suffix++;
            }
            user.setUserId(finalUserId);
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            Optional<Role> userRole = roleRepository.findAll().stream()
                    .filter(r -> "user".equalsIgnoreCase(r.getName()))
                    .findFirst();

            if (userRole.isPresent()) {
                user.setRole(userRole.get());
            } else {
                return Map.of("error", "System default role 'USER' not found.");
            }
        } else {
            if (user.getRole().getId() != null) {
                Optional<Role> role = roleRepository.findById(user.getRole().getId());
                if (role.isPresent()) {
                    user.setRole(role.get());
                } else {
                    return Map.of("error", "Invalid Role ID");
                }
            }
        }

        if (user.getOrganizationEntity() != null && user.getOrganizationEntity().getOrgId() != null) {
            organizationRepository.findByOrgId(user.getOrganizationEntity().getOrgId())
                    .ifPresent(org -> {
                        user.setOrganizationEntity(org);
                        user.setOrganization(org.getName());
                    });
        }

        User savedUser = userRepository.save(user);
        return savedUser;
    }

    public Optional<User> updateUser(UUID id, User userDetails) {
        return userRepository.findById(id).map(user -> {
            if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
            if (userDetails.getName() != null) user.setName(userDetails.getName());
            if (userDetails.getAvatar() != null) user.setAvatar(userDetails.getAvatar());
            if (userDetails.getBio() != null) user.setBio(userDetails.getBio());
            if (userDetails.getWebsite() != null) user.setWebsite(userDetails.getWebsite());
            if (userDetails.getOrganization() != null) user.setOrganization(userDetails.getOrganization());
            if (userDetails.getJobTitle() != null) user.setJobTitle(userDetails.getJobTitle());
            if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
            if (userDetails.getStatus() != null) user.setStatus(userDetails.getStatus());

            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }

            if (userDetails.getOrganizationEntity() != null &&
                    userDetails.getOrganizationEntity().getOrgId() != null) {
                organizationRepository.findByOrgId(userDetails.getOrganizationEntity().getOrgId())
                        .ifPresent(org -> {
                            user.setOrganizationEntity(org);
                            user.setOrganization(org.getName());
                        });
            }
            return userRepository.save(user);
        });
    }

    public boolean deleteUser(UUID id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return true;
        }).orElse(false);
    }
}
