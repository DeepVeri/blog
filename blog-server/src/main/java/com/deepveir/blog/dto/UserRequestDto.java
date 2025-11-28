package com.deepveir.blog.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class UserRequestDto {

    private String userId;
    private String email;
    private String password;
    private String name;
    private Integer status;

    private String avatar;
    private String bio;
    private String website;
    private String organization;
    private String jobTitle;
    private String phone;

    private RoleRef role;
    private OrganizationRef organizationEntity;

    @Data
    public static class RoleRef {
        private UUID id;
    }

    @Data
    public static class OrganizationRef {
        private String orgId;
        private String name;
    }
}
