-- Database Initialization Script
-- Database: MySQL
-- Character Set: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- DROP Tables in dependency order (Child -> Parent)
-- ----------------------------
DROP TABLE IF EXISTS `role_menus`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `organizations`;
DROP TABLE IF EXISTS `menus`;
DROP TABLE IF EXISTS `roles`;

-- ----------------------------
-- 1. Table structure for roles
-- ----------------------------
CREATE TABLE `roles` (
  `id` binary(16) NOT NULL COMMENT 'Internal UUID (Binary)',
  `role_id` varchar(50) NOT NULL COMMENT 'Readable Role ID (e.g. admin)',
  `name` varchar(50) NOT NULL COMMENT 'Display Name',
  `description` varchar(255) DEFAULT NULL,
  `create_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_role_id` (`role_id`),
  UNIQUE KEY `UK_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 2. Table structure for menus
-- ----------------------------
CREATE TABLE `menus` (
  `id` binary(16) NOT NULL,
  `menu_id` varchar(50) NOT NULL COMMENT 'Readable Menu ID',
  `parent_id` varchar(50) DEFAULT NULL COMMENT 'References menu_id',
  `name` varchar(100) NOT NULL,
  `path` varchar(255) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `type` varchar(20) DEFAULT NULL COMMENT 'MENU, BUTTON, DIRECTORY',
  `permission` varchar(100) DEFAULT NULL,
  `visible` bit(1) DEFAULT b'1',
  `status` int DEFAULT '1',
  `create_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_menu_id` (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table structure for organizations (multi-level)
-- 支持多层级组织，通过 parent_org_id 形成树结构
CREATE TABLE `organizations` (
  `id` binary(16) NOT NULL COMMENT 'Internal UUID (Binary)',
  `org_id` varchar(50) NOT NULL COMMENT 'Readable Organization ID (e.g. dev-team)',
  `parent_org_id` varchar(50) DEFAULT NULL COMMENT 'Parent organization org_id',
  `name` varchar(100) NOT NULL COMMENT 'Organization Name',
  `description` varchar(255) DEFAULT NULL,
  `create_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_org_id` (`org_id`),
  KEY `FK_org_parent` (`parent_org_id`),
  CONSTRAINT `FK_org_parent` FOREIGN KEY (`parent_org_id`) REFERENCES `organizations` (`org_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 4. Table structure for users
-- ----------------------------
CREATE TABLE `users` (
  `id` binary(16) NOT NULL,
  `user_id` varchar(50) NOT NULL COMMENT 'Readable User ID',
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `role_id` varchar(50) DEFAULT NULL COMMENT 'References roles.role_id',
  `avatar` varchar(255) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `organization` varchar(100) DEFAULT NULL,
  `org_id` varchar(50) DEFAULT NULL COMMENT 'References organizations.org_id',
  `job_title` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` int DEFAULT '1',
  `last_login_time` datetime(6) DEFAULT NULL,
  `create_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_user_id` (`user_id`),
  UNIQUE KEY `UK_email` (`email`),
  KEY `FK_users_role_id` (`role_id`),
  KEY `FK_users_org_id` (`org_id`),
  CONSTRAINT `FK_users_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL,
  CONSTRAINT `FK_users_org_id` FOREIGN KEY (`org_id`) REFERENCES `organizations` (`org_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 5. Table structure for role_menus
-- ----------------------------
CREATE TABLE `role_menus` (
  `role_id` varchar(50) NOT NULL,
  `menu_id` varchar(50) NOT NULL,
  PRIMARY KEY (`role_id`,`menu_id`),
  KEY `FK_role_menus_menu_id` (`menu_id`),
  CONSTRAINT `FK_role_menus_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_role_menus_menu_id` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`menu_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 6. Table structure for categories
-- ----------------------------
CREATE TABLE `categories` (
  `id` binary(16) NOT NULL,
  `category_id` varchar(50) NOT NULL COMMENT 'Readable category identifier',
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `create_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_category_id` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 7. Table structure for tags
-- ----------------------------
CREATE TABLE `tags` (
  `id` binary(16) NOT NULL,
  `tag_id` varchar(50) NOT NULL COMMENT 'Readable tag identifier',
  `name` varchar(100) NOT NULL,
  `create_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_tag_id` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 7. Table structure for articles
-- ----------------------------
CREATE TABLE `articles` (
  `id` binary(16) NOT NULL,
  `article_id` varchar(50) NOT NULL COMMENT 'Readable Article ID',
  `title` varchar(255) NOT NULL,
  `summary` varchar(512) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `cover_image` varchar(512) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'draft',
  `read_time` varchar(50) DEFAULT NULL,
  `published_at` datetime(6) DEFAULT NULL,
  `author_id` varchar(50) DEFAULT NULL COMMENT 'References users.user_id',
  `category_id` varchar(50) DEFAULT NULL COMMENT 'References categories.category_id',
  `create_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_article_id` (`article_id`),
  KEY `FK_articles_author_id` (`author_id`),
  KEY `FK_articles_category_id` (`category_id`),
  CONSTRAINT `FK_articles_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `FK_articles_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 8. Table structure for article_tag relations
-- ----------------------------
CREATE TABLE `article_tags` (
  `article_id` varchar(50) NOT NULL,
  `tag_id` varchar(50) NOT NULL,
  PRIMARY KEY (`article_id`,`tag_id`),
  KEY `FK_article_tags_tag` (`tag_id`),
  CONSTRAINT `FK_article_tags_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`article_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_article_tags_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`tag_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 6. Initial Data
-- ----------------------------

-- Roles
INSERT INTO `roles` (`id`, `role_id`, `name`, `description`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'admin', 'ADMIN', 'System Administrator'),
(UNHEX(REPLACE(UUID(),'-','')), 'user', 'USER', 'Regular User');

-- Menus
-- Dashboard (Homepage)
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'dashboard', NULL, 0xE68EA7E588B6E58FB0, '/', 'LayoutDashboard', 1, 'MENU', 1);

-- System Management
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'system', NULL, 0xE7B3BBE7BB9FE7AEA1E79086, '/system', 'Settings', 2, 'DIRECTORY', 0);

-- User Management (Top Level)
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `permission`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'user-mgr', NULL, 0xE794A8E688B7E7AEA1E79086, '/users', 'Users', 3, 'MENU', 'user:list', 1);

-- Role Management (Top Level)
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `permission`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'role-mgr', NULL, 0xE8A792E889B2E7AEA1E79086, '/roles', 'Shield', 4, 'MENU', 'role:list', 1);

-- Menu Management (Top Level)
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `permission`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'menu-mgr', NULL, 0xE88F9CE58D95E7AEA1E79086, '/menus', 'Menu', 5, 'MENU', 'menu:list', 1);

-- Article Management (Top Level)
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `permission`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'post-mgr', NULL, 0xE69687E7AB99E7AEA1E79086, '/posts', 'FileText', 6, 'MENU', 'post:list', 1);

-- Category Management (Top Level)
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `permission`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'category-mgr', NULL, 0xE58886E7B1BBE7AEA1E79086, '/categories', 'FolderOpen', 7, 'MENU', 'category:list', 1);

-- Tag Management (Top Level)
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `permission`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'tag-mgr', NULL, 0xE6A087E7ADB7E7AEA1E79086, '/tags', 'Tag', 8, 'MENU', 'tag:list', 1);

-- Comment Management (Top Level)
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `permission`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'comment-mgr', NULL, 0xE893BDE8AF84E7AEA1E79086, '/comments', 'MessageSquare', 9, 'MENU', 'comment:list', 1);


-- Role-Menu Associations (Admin has all)
INSERT INTO `role_menus` (`role_id`, `menu_id`) VALUES
('admin', 'dashboard'),
('admin', 'system'),
('admin', 'user-mgr'),
('admin', 'role-mgr'),
('admin', 'menu-mgr'),
('admin', 'post-mgr'),
('admin', 'category-mgr'),
('admin', 'tag-mgr'),
('admin', 'comment-mgr');

-- Default User (admin / 123456)
-- Note: Password hash below is for '123456' using BCrypt
INSERT INTO `users` (`id`, `user_id`, `email`, `password`, `name`, `role_id`, `status`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'admin', 'admin@example.com', '$2b$12$PQKBGgX9133JNnIb0g5auObRBpFVZ.dZ83EakC5A.vItRN2QRofQ.', 'Admin User', 'admin', 1);

SET FOREIGN_KEY_CHECKS = 1;
