-- Database Initialization Script
-- Database: MySQL
-- Character Set: utf8mb4

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- DROP Tables in dependency order (Child -> Parent)
-- ----------------------------
DROP TABLE IF EXISTS `article_tags`;
DROP TABLE IF EXISTS `articles`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `categories`;
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
  `user_id` varchar(50) NOT NULL COMMENT 'UUID 格式',
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `username` varchar(50) DEFAULT NULL COMMENT '用户名/昵称',
  `role_name` varchar(50) DEFAULT NULL COMMENT '角色名称（冗余）',
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
  `token_version` int DEFAULT '1' COMMENT 'Token版本号，用于单点登录',
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
-- 8. Table structure for articles
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
-- 9. Table structure for article_tag relations
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
-- 10. Initial Data
-- ----------------------------

-- Roles
INSERT INTO `roles` (`id`, `role_id`, `name`, `description`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'admin', '超级管理员', '系统超级管理员，拥有所有权限'),
(UNHEX(REPLACE(UUID(),'-','')), 'editor', '内容编辑', '负责内容管理'),
(UNHEX(REPLACE(UUID(),'-','')), 'user', '普通用户', '普通注册用户');

-- Organizations (insert parent first, then children)
INSERT INTO `organizations` (`id`, `org_id`, `parent_org_id`, `name`, `description`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'headquarters', NULL, '总公司', '集团总部');

INSERT INTO `organizations` (`id`, `org_id`, `parent_org_id`, `name`, `description`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'dev-dept', 'headquarters', '研发部', '负责产品研发'),
(UNHEX(REPLACE(UUID(),'-','')), 'ops-dept', 'headquarters', '运维部', '负责系统运维');

-- Menus
-- 一级菜单，路径与前端 AdminLayout 期望的格式一致
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'dashboard', NULL, '控制台', '/', 'Home', 1, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'articles', NULL, '文章管理', '/posts', 'FileText', 2, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'categories', NULL, '分类管理', '/categories', 'FolderOpen', 3, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'tags', NULL, '标签管理', '/tags', 'Tag', 4, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'comments', NULL, '评论管理', '/comments', 'MessageSquare', 5, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'users', NULL, '用户管理', '/users', 'Users', 6, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'roles', NULL, '角色管理', '/roles', 'Shield', 7, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'menus', NULL, '菜单管理', '/menus', 'Menu', 8, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'orgs', NULL, '组织管理', '/organizations', 'Building', 9, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'system', NULL, '系统管理', NULL, 'Settings', 90, 'MENU', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'settings', NULL, '系统设置', '/settings', 'Settings', 99, 'MENU', 1);

-- 系统管理子菜单
INSERT INTO `menus` (`id`, `menu_id`, `parent_id`, `name`, `path`, `icon`, `sort_order`, `type`, `visible`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'pages', 'system', '页面管理', '/pages', 'FileCode', 1, 'MENU', 1);

-- Role-Menu Associations
-- Admin gets everything
INSERT INTO `role_menus` (`role_id`, `menu_id`) SELECT 'admin', `menu_id` FROM `menus`;

-- Editor gets content management (dashboard, articles, categories, tags, comments)
INSERT INTO `role_menus` (`role_id`, `menu_id`) VALUES
('editor', 'dashboard'),
('editor', 'articles'),
('editor', 'categories'),
('editor', 'tags'),
('editor', 'comments');

-- User gets dashboard only
INSERT INTO `role_menus` (`role_id`, `menu_id`) VALUES
('user', 'dashboard');

-- Users
-- Passwords are '123456' (BCrypt)
-- user_id 使用 UUID 格式
INSERT INTO `users` (`id`, `user_id`, `email`, `password`, `username`, `role_name`, `role_id`, `org_id`, `status`, `avatar`, `bio`, `website`, `organization`, `job_title`, `phone`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), UUID(), 'admin@example.com', '$2b$12$PQKBGgX9133JNnIb0g5auObRBpFVZ.dZ83EakC5A.vItRN2QRofQ.', '管理员', '超级管理员', 'admin', 'dev-dept', 1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '系统管理员', 'https://example.com', '研发部', 'Senior Developer', '13800000000'),
(UNHEX(REPLACE(UUID(),'-','')), UUID(), 'editor@example.com', '$2b$12$PQKBGgX9133JNnIb0g5auObRBpFVZ.dZ83EakC5A.vItRN2QRofQ.', '编辑人员', '内容编辑', 'editor', 'ops-dept', 1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor', '内容创作与编辑', NULL, '运维部', 'Content Editor', '13900000000'),
(UNHEX(REPLACE(UUID(),'-','')), UUID(), 'test@example.com', '$2b$12$PQKBGgX9133JNnIb0g5auObRBpFVZ.dZ83EakC5A.vItRN2QRofQ.', '测试用户', '普通用户', 'user', 'dev-dept', 1, 'https://api.dicebear.com/7.x/avataaars/svg?seed=test', '普通测试用户', NULL, '研发部', 'QA Engineer', '13700000000');

-- Categories
INSERT INTO `categories` (`id`, `category_id`, `name`, `description`, `sort_order`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'tech', '技术', '技术分享与教程', 1),
(UNHEX(REPLACE(UUID(),'-','')), 'life', '生活', '生活随笔', 2),
(UNHEX(REPLACE(UUID(),'-','')), 'frontend', '前端开发', 'Web 前端技术栈', 3),
(UNHEX(REPLACE(UUID(),'-','')), 'backend', '后端架构', '服务端开发与架构设计', 4),
(UNHEX(REPLACE(UUID(),'-','')), 'devops', 'DevOps', '自动化运维与部署', 5),
(UNHEX(REPLACE(UUID(),'-','')), 'database', '数据库', 'SQL 与 NoSQL 技术', 6),
(UNHEX(REPLACE(UUID(),'-','')), 'ai', '人工智能', '机器学习与大模型', 7),
(UNHEX(REPLACE(UUID(),'-','')), 'cloud', '云计算', '云原生技术与实践', 8),
(UNHEX(REPLACE(UUID(),'-','')), 'security', '网络安全', 'Web 安全与渗透测试', 9),
(UNHEX(REPLACE(UUID(),'-','')), 'mobile', '移动开发', 'iOS 与 Android 开发', 10),
(UNHEX(REPLACE(UUID(),'-','')), 'product', '产品设计', 'UI/UX 与产品思维', 11),
(UNHEX(REPLACE(UUID(),'-','')), 'career', '职业发展', '职场经验与面试技巧', 12);

-- Tags
INSERT INTO `tags` (`id`, `tag_id`, `name`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'java', 'Java'),
(UNHEX(REPLACE(UUID(),'-','')), 'springboot', 'Spring Boot'),
(UNHEX(REPLACE(UUID(),'-','')), 'react', 'React'),
(UNHEX(REPLACE(UUID(),'-','')), 'python', 'Python'),
(UNHEX(REPLACE(UUID(),'-','')), 'golang', 'Go'),
(UNHEX(REPLACE(UUID(),'-','')), 'rust', 'Rust'),
(UNHEX(REPLACE(UUID(),'-','')), 'vue', 'Vue.js'),
(UNHEX(REPLACE(UUID(),'-','')), 'angular', 'Angular'),
(UNHEX(REPLACE(UUID(),'-','')), 'docker', 'Docker'),
(UNHEX(REPLACE(UUID(),'-','')), 'k8s', 'Kubernetes'),
(UNHEX(REPLACE(UUID(),'-','')), 'mysql', 'MySQL'),
(UNHEX(REPLACE(UUID(),'-','')), 'redis', 'Redis'),
(UNHEX(REPLACE(UUID(),'-','')), 'mongodb', 'MongoDB'),
(UNHEX(REPLACE(UUID(),'-','')), 'aws', 'AWS'),
(UNHEX(REPLACE(UUID(),'-','')), 'linux', 'Linux'),
(UNHEX(REPLACE(UUID(),'-','')), 'nginx', 'Nginx'),
(UNHEX(REPLACE(UUID(),'-','')), 'git', 'Git'),
(UNHEX(REPLACE(UUID(),'-','')), 'cicd', 'CI/CD'),
(UNHEX(REPLACE(UUID(),'-','')), 'microservices', 'Microservices'),
(UNHEX(REPLACE(UUID(),'-','')), 'graphql', 'GraphQL'),
(UNHEX(REPLACE(UUID(),'-','')), 'restapi', 'REST API'),
(UNHEX(REPLACE(UUID(),'-','')), 'algorithm', 'Algorithms'),
(UNHEX(REPLACE(UUID(),'-','')), 'design-system', 'System Design');

-- Articles
INSERT INTO `articles` (`id`, `article_id`, `title`, `summary`, `content`, `status`, `author_id`, `category_id`, `published_at`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'welcome', '欢迎使用博客系统', '这是一个基于 Spring Boot 开发的博客系统。', '# 欢迎\n\n你好！这是你的第一篇文章。\n\n## 功能特性\n- 用户管理\n- 角色权限\n- 文章发布\n- 组织架构', 'published', 'admin', 'tech', NOW()),
(UNHEX(REPLACE(UUID(),'-','')), 'java-21-features', 'Java 21 新特性深度解析：虚拟线程与模式匹配', 'Java 21 作为最新的 LTS 版本，带来了虚拟线程（Virtual Threads）和模式匹配（Pattern Matching）等革命性更新，彻底改变了高并发编程范式。', '# Java 21 新特性深度解析\n\nJava 21 是继 Java 17 之后的又一个长期支持（LTS）版本。它引入了许多开发者期待已久的特性。\n\n## 虚拟线程 (Virtual Threads)\n\n虚拟线程是 Project Loom 的核心成果，它旨在解决传统 Java 线程模型在高并发场景下的资源瓶颈。\n\n```java\ntry (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    IntStream.range(0, 10_000).forEach(i -> {\n        executor.submit(() -> {\n            Thread.sleep(Duration.ofSeconds(1));\n            return i;\n        });\n    });\n}\n```\n\n## Switch 模式匹配\n\nswitch 表达式现在支持模式匹配，使代码更加简洁。\n\n## 总结\n\nJava 21 的发布标志着 Java 平台在云原生时代的重大进步。', 'published', 'admin', 'backend', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'springboot-3-migration', 'Spring Boot 3.0 迁移指南：从 2.x 到 3.x 的平滑过渡', 'Spring Boot 3.0 基于 Java 17 构建，完全支持 Jakarta EE 9。本文详细介绍了升级过程中的关键注意点和依赖调整。', '# Spring Boot 3.0 迁移指南\n\nSpring Boot 3.0 是 Spring Boot 历史上的一个重要里程碑。\n\n## 前置要求\n\n- **Java 17**: Spring Boot 3.0 最低要求 Java 17。\n- **Jakarta EE 9**: `javax.*` 包名已更改为 `jakarta.*`。\n\n## 关键变更\n\n1. **Spring Framework 6**: 底层依赖全面升级。\n2. **GraalVM Native Image**: 提供了一流的 GraalVM 支持，启动速度飞快。\n\n## 迁移步骤\n\n1. 升级 Java 版本。\n2. 替换 javax 依赖。\n3. 运行配置检查。\n\n> 建议在升级前备份项目，并充分运行单元测试。', 'published', 'admin', 'backend', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'react-hooks-best-practices', 'React Hooks 最佳实践与性能优化指南', '深入探讨 useEffect、useMemo 和 useCallback 的正确使用场景，避免常见的闭包陷阱和性能浪费。', '# React Hooks 最佳实践\n\n自 React 16.8 引入 Hooks 以来，它已成为 React 开发的标准范式。\n\n## useEffect 的依赖数组\n\n永远不要欺骗 React 的依赖检查机制。如果你在 effect 中使用了某个变量，请务必将其加入依赖数组。\n\n```javascript\nuseEffect(() => {\n  const subscription = props.source.subscribe();\n  return () => {\n    subscription.unsubscribe();\n  };\n}, [props.source]);\n```\n\n## 使用 useMemo 优化计算\n\n对于昂贵的计算逻辑，使用 `useMemo` 可以避免重复计算。\n\n## 自定义 Hooks\n\n将复用逻辑提取为自定义 Hook 是保持代码整洁的关键。', 'published', 'editor', 'frontend', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'docker-k8s-guide', 'Docker 与 Kubernetes：容器化部署实战入门', '从 Dockerfile 编写到 Kubernetes Pod 部署，手把手教你构建可扩展的微服务运行环境。', '# Docker 与 Kubernetes 实战\n\n容器化技术已经成为现代 DevOps 的基石。\n\n## Docker 基础\n\n编写高效的 Dockerfile 是第一步。利用多阶段构建（Multi-stage Builds）可以显著减小镜像体积。\n\n## Kubernetes 核心概念\n\n- **Pod**: K8s 的最小部署单元。\n- **Service**: 定义一组 Pod 的访问策略。\n- **Deployment**: 管理 Pod 的副本和更新。\n\n## 部署示例\n\n使用 kubectl apply -f deployment.yaml 即可一键部署应用。', 'published', 'admin', 'devops', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'mysql-performance-tuning', 'MySQL 性能调优：索引优化与 SQL 分析实战', '如何通过 Explain 分析慢查询？B+树索引的工作原理是什么？本文带你深入 MySQL 性能优化的核心。', '# MySQL 性能调优实战\n\n数据库往往是系统的性能瓶颈所在。\n\n## 索引原理\n\nMySQL 主要使用 B+树作为索引结构。理解最左前缀原则（Leftmost Prefixing）对于创建有效索引至关重要。\n\n## Explain 命令详解\n\n使用 `EXPLAIN` 关键字可以查看 SQL 的执行计划。\n\n- **type**: 访问类型，system > const > eq_ref > ref > range > index > ALL\n- **key**: 实际使用的索引\n- **rows**: 预计扫描的行数\n\n## 常见优化策略\n\n1. 避免 `SELECT *`\n2. 使用覆盖索引\n3. 优化分页查询', 'published', 'admin', 'database', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'redis-caching-strategies', 'Redis 缓存策略：缓存穿透、击穿与雪崩解决方案', '在高并发系统中，Redis 是不可或缺的组件。本文详解三种常见的缓存失效场景及其解决方案。', '# Redis 缓存策略详解\n\n合理使用缓存可以极大地提升系统吞吐量。\n\n## 缓存穿透\n\n查询一个不存在的数据，导致请求直接打到数据库。\n\n**解决方案**：\n- 布隆过滤器（Bloom Filter）\n- 缓存空对象\n\n## 缓存击穿\n\n热点 Key 失效的瞬间，大量请求同时涌入数据库。\n\n**解决方案**：\n- 设置热点数据永不过期\n- 使用互斥锁（Mutex Key）\n\n## 缓存雪崩\n\n大量 Key 同时失效。\n\n**解决方案**：\n- 随机过期时间', 'published', 'admin', 'database', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'vue3-composition-api', 'Vue 3 Composition API 实战：逻辑复用的新姿势', '对比 Options API，Composition API 如何让代码组织更灵活？setup 语法糖到底怎么用？', '# Vue 3 Composition API\n\nVue 3 引入的 Composition API 是对 Vue 代码组织方式的一次重大革新。\n\n## 为什么需要 Composition API?\n\n在大型组件中，Options API 会导致相关逻辑分散在 data, methods, mounted 等不同选项中，难以维护。Composition API 允许我们将相关功能的代码组织在一起。\n\n## <script setup>\n\n这是 Vue 3 推荐的语法糖，代码更加简洁。\n\n```vue\n<script setup>\nimport { ref, onMounted } from \'vue\'\n\nconst count = ref(0)\nfunction increment() { count.value++ }\n</script>\n```', 'published', 'editor', 'frontend', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'python-data-analysis', 'Python 数据分析：Pandas 与 NumPy 快速入门', '数据科学必备工具库 Pandas 与 NumPy 的基础操作与实战案例。', '# Python 数据分析入门\n\n在数据科学领域，Python 是无可争议的王者。\n\n## NumPy\n\nNumPy 提供了高性能的多维数组对象和用于处理这些数组的工具。\n\n## Pandas\n\nPandas 建立在 NumPy 之上，提供了 DataFrame 数据结构，非常适合处理表格数据。\n\n```python\nimport pandas as pd\ndf = pd.read_csv(\'data.csv\')\nprint(df.describe())\n```', 'published', 'editor', 'ai', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'go-vs-rust', 'Go vs Rust：系统编程语言的选择之道', 'Go 语言简洁高效，Rust 语言安全零抽象。在云原生与系统开发中，我们该如何选择？', '# Go vs Rust\n\nGo 和 Rust 都是现代系统编程的热门选择，但它们的设计哲学截然不同。\n\n## Go: 简单的艺术\n\nGo 语言由 Google 开发，强调简洁性和开发效率。它的 Goroutine 模型使得编写并发程序变得非常简单。\n\n## Rust: 安全与性能\n\nRust 引入了所有权（Ownership）和借用（Borrowing）机制，在编译期保证内存安全，没有 GC 开销。\n\n## 选型建议\n\n- 网络服务、微服务：Go\n- 操作系统、高性能引擎：Rust', 'published', 'admin', 'backend', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'aws-serverless', 'AWS Serverless 架构：Lambda 与 API Gateway 实战', '无服务器架构让开发者专注于代码而非基础设施。本文介绍如何构建一个 Serverless REST API。', '# AWS Serverless 实战\n\nServerless 正在改变我们构建应用的方式。\n\n## 核心组件\n\n- **AWS Lambda**: 运行代码的计算服务。\n- **Amazon API Gateway**: 托管的 API 服务。\n- **DynamoDB**: Serverless NoSQL 数据库。\n\n## 优势\n\n1. 按需付费，成本低。\n2. 自动扩缩容。\n3. 零运维负担。', 'published', 'admin', 'cloud', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'microservices-patterns', '微服务设计模式：Saga 分布式事务详解', '在微服务架构中，如何保证数据一致性？Saga 模式通过一系列本地事务来实现最终一致性。', '# Saga 分布式事务模式\n\n微服务架构下，跨服务的事务处理是一个难题。\n\n## 什么是 Saga?\n\nSaga 是一系列本地事务的序列。如果某个本地事务失败，Saga 会执行一系列补偿事务（Compensating Transactions）来撤销之前的操作。\n\n## 两种协调方式\n\n1. **编排式 (Orchestration)**: 有一个中心协调器告诉每个参与者该做什么。\n2. **协同式 (Choreography)**: 参与者通过订阅事件来决定行动。', 'published', 'admin', 'backend', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'linux-cli-tricks', 'Linux 命令行高效技巧：提升运维生产力', 'grep, awk, sed 三剑客的高级用法，以及 zsh, tmux 等效率工具的配置推荐。', '# Linux 命令行高效指南\n\n掌握 Linux 命令行是每个后端工程师的必修课。\n\n## 文本处理三剑客\n\n- **grep**: 文本搜索\n- **awk**: 文本分析与报表生成\n- **sed**: 流编辑器\n\n## 实用技巧\n\n- `Ctrl + R`: 搜索历史命令\n- `!!`: 重复上一条命令\n- `tail -f`: 实时查看日志', 'published', 'admin', 'devops', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'system-design-notification', '系统设计面试题：设计一个高并发通知系统', '从需求分析到架构设计，如何设计一个支持短信、邮件、Push 的百万级通知系统？', '# 设计高并发通知系统\n\n这是一个经典的系统设计面试题。\n\n## 需求分析\n\n- 支持多种通道（Email, SMS, Push）。\n- 高吞吐量，低延迟。\n- 可靠性（不丢失消息）。\n\n## 架构设计\n\n1. **接入层**: 接收请求，鉴权。\n2. **消息队列**: 使用 Kafka 或 RabbitMQ 解耦。\n3. **分发服务**: 消费消息，调用第三方 API。\n4. **重试机制**: 保证消息必达。', 'published', 'admin', 'career', DATE_SUB(NOW(), INTERVAL 13 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'git-workflow-teams', 'Git 团队协作工作流：Git Flow 与 Trunk Based Development', '对比主流的 Git 分支管理策略，找到适合你团队的最佳实践。', '# Git 团队工作流\n\n## Git Flow\n\n传统的开发模式，包含 master, develop, feature, release, hotfix 等分支。适合版本发布周期较长的项目。\n\n## Trunk Based Development (主干开发)\n\n所有开发者都在主干上提交代码，通过 Feature Toggles 控制功能发布。适合 CI/CD 能力强的敏捷团队。\n\n## 最佳实践\n\n- 保持提交原子性。\n- 编写清晰的 Commit Message。', 'published', 'editor', 'devops', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'nginx-config-guide', 'Nginx 反向代理与负载均衡配置详解', '深入理解 Nginx 的 location 匹配规则、upstream 负载均衡策略及 HTTPS 配置。', '# Nginx 配置详解\n\nNginx 是高性能的 HTTP 和反向代理服务器。\n\n## Location 匹配规则\n\n1. `=` 精确匹配\n2. `^~` 前缀匹配\n3. `~` 正则匹配\n\n## 负载均衡\n\n```nginx\nupstream backend {\n    server backend1.example.com;\n    server backend2.example.com;\n}\n```', 'published', 'admin', 'devops', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'angular-signals', 'Angular 新特性：Signals 响应式编程', 'Angular 引入 Signals 机制，带来了更细粒度的变更检测和更高的性能。', '# Angular Signals\n\nSignals 是 Angular 响应式系统的未来。\n\n## 什么是 Signal?\n\nSignal 是一个包装了值的容器，它可以在值发生变化时通知消费者。\n\n```typescript\nconst count = signal(0);\ncount.set(1);\nconsole.log(count());\n```\n\n它解决了 Zone.js 变更检测的一些性能问题。', 'published', 'editor', 'frontend', DATE_SUB(NOW(), INTERVAL 16 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'design-patterns-singleton', '深入设计模式：单例模式的七种写法与线程安全', '从饿汉式到枚举单例，分析各种单例模式实现的优缺点及线程安全问题。', '# 单例模式详解\n\n单例模式保证一个类只有一个实例。\n\n## 实现方式\n\n1. **饿汉式**: 类加载时初始化，线程安全。\n2. **懒汉式**: 用时初始化，需加锁保证线程安全。\n3. **双重检查锁 (DCL)**: 性能较好。\n4. **枚举单例**: 《Effective Java》推荐方式，防止反射攻击。\n\n```java\npublic enum Singleton {\n    INSTANCE;\n    public void doSomething() {}\n}\n```', 'published', 'admin', 'backend', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'cicd-github-actions', '使用 GitHub Actions 构建自动化 CI/CD 流水线', '从零开始配置 GitHub Actions，实现代码自动测试、构建并部署到 Docker Hub。', '# GitHub Actions 实战\n\nGitHub Actions 使得自动化工作流变得异常简单。\n\n## 核心概念\n\n- **Workflow**: 工作流，由 `.github/workflows` 下的 YAML 文件定义。\n- **Job**: 任务，包含多个 Step。\n- **Action**: 可复用的原子操作。\n\n## 示例\n\n```yaml\nname: Java CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v3\n    - name: Set up JDK 17\n      uses: actions/setup-java@v3\n```', 'published', 'admin', 'devops', DATE_SUB(NOW(), INTERVAL 18 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'rest-vs-graphql', 'RESTful API vs GraphQL：接口架构的较量', 'REST 简单成熟，GraphQL 灵活高效。在前后端分离开发中，谁是更好的选择？', '# REST vs GraphQL\n\n## REST\n\n- **资源导向**: 每个 URL 代表一个资源。\n- **优点**: 简单，利用 HTTP 缓存，工具链成熟。\n- **缺点**: 可能会有 Over-fetching 或 Under-fetching 问题。\n\n## GraphQL\n\n- **查询语言**: 客户端按需查询。\n- **优点**: 精确获取数据，强类型 Schema。\n- **缺点**: 复杂度高，缓存难以处理。\n\n## 结论\n\n对于复杂的关联查询，GraphQL 优势明显；对于简单的 CRUD，REST 依然是首选。', 'published', 'admin', 'backend', DATE_SUB(NOW(), INTERVAL 19 DAY)),
(UNHEX(REPLACE(UUID(),'-','')), 'career-interview-tips', '技术面试通关指南：如何展示你的技术深度', '面试不仅仅是刷题。本文分享如何通过 STAR 法则回答行为面试题，以及如何优雅地展示项目经验。', '# 技术面试指南\n\n## STAR 法则\n\n- **Situation**: 情境\n- **Task**: 任务\n- **Action**: 行动\n- **Result**: 结果\n\n## 技术深度\n\n不要只停留在 API 调用层面。尝试深入源码，理解底层原理。例如，不要只说“我会用 HashMap”，而要解释 HashMap 的扩容机制和哈希冲突解决策略。', 'published', 'editor', 'career', DATE_SUB(NOW(), INTERVAL 20 DAY));

-- Article Tags
INSERT INTO `article_tags` (`article_id`, `tag_id`) VALUES
('welcome', 'java'),
('welcome', 'springboot'),
('java-21-features', 'java'),
('java-21-features', 'backend'),
('springboot-3-migration', 'springboot'),
('springboot-3-migration', 'java'),
('springboot-3-migration', 'backend'),
('react-hooks-best-practices', 'react'),
('react-hooks-best-practices', 'frontend'),
('docker-k8s-guide', 'docker'),
('docker-k8s-guide', 'k8s'),
('docker-k8s-guide', 'devops'),
('mysql-performance-tuning', 'mysql'),
('mysql-performance-tuning', 'database'),
('mysql-performance-tuning', 'backend'),
('redis-caching-strategies', 'redis'),
('redis-caching-strategies', 'database'),
('redis-caching-strategies', 'backend'),
('vue3-composition-api', 'vue'),
('vue3-composition-api', 'frontend'),
('python-data-analysis', 'python'),
('python-data-analysis', 'ai'),
('go-vs-rust', 'golang'),
('go-vs-rust', 'rust'),
('go-vs-rust', 'backend'),
('aws-serverless', 'aws'),
('aws-serverless', 'cloud'),
('aws-serverless', 'backend'),
('microservices-patterns', 'microservices'),
('microservices-patterns', 'backend'),
('microservices-patterns', 'design-system'),
('linux-cli-tricks', 'linux'),
('linux-cli-tricks', 'devops'),
('system-design-notification', 'design-system'),
('system-design-notification', 'backend'),
('git-workflow-teams', 'git'),
('git-workflow-teams', 'devops'),
('nginx-config-guide', 'nginx'),
('nginx-config-guide', 'devops'),
('angular-signals', 'angular'),
('angular-signals', 'frontend'),
('design-patterns-singleton', 'java'),
('design-patterns-singleton', 'backend'),
('design-patterns-singleton', 'design-system'),
('cicd-github-actions', 'cicd'),
('cicd-github-actions', 'devops'),
('cicd-github-actions', 'git'),
('rest-vs-graphql', 'restapi'),
('rest-vs-graphql', 'graphql'),
('rest-vs-graphql', 'backend'),
('career-interview-tips', 'algorithm');

-- ----------------------------
-- 11. Table structure for site_stats (访问统计)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `site_stats` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `date` DATE NOT NULL UNIQUE COMMENT '统计日期',
  `page_views` BIGINT NOT NULL DEFAULT 0 COMMENT '页面浏览量 (PV)',
  `unique_visitors` BIGINT NOT NULL DEFAULT 0 COMMENT '独立访客数 (UV)',
  INDEX `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='网站访问统计';

-- ----------------------------
-- 12. Table structure for pages (页面内容管理)
-- ----------------------------
CREATE TABLE IF NOT EXISTS `pages` (
  `id` BINARY(16) NOT NULL,
  `page_id` VARCHAR(50) NOT NULL UNIQUE COMMENT '页面标识，如 about, contact',
  `title` VARCHAR(255) NOT NULL COMMENT '页面标题',
  `title_en` VARCHAR(255) DEFAULT NULL COMMENT '英文标题',
  `subtitle` VARCHAR(255) DEFAULT NULL COMMENT '副标题',
  `subtitle_en` VARCHAR(255) DEFAULT NULL COMMENT '英文副标题',
  `content` LONGTEXT COMMENT '页面内容（Markdown）',
  `content_en` LONGTEXT COMMENT '英文内容',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '联系邮箱',
  `github` VARCHAR(255) DEFAULT NULL COMMENT 'GitHub 链接',
  `website` VARCHAR(255) DEFAULT NULL COMMENT '网站链接',
  `status` TINYINT DEFAULT 1 COMMENT '状态：1=发布，0=草稿',
  `create_time` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
  `update_time` DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_page_id` (`page_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='页面内容管理';

-- ----------------------------
-- Initial data for pages
-- ----------------------------
INSERT INTO `pages` (`id`, `page_id`, `title`, `title_en`, `subtitle`, `subtitle_en`, `content`, `content_en`, `email`, `github`, `website`, `status`) VALUES
(UNHEX(REPLACE(UUID(),'-','')), 'about', '关于 DeepVeir', 'About DeepVeir', '探索、构建与思考', 'Explore, Build & Think', 
'## 👋 你好！

欢迎来到 **DeepVeir Blog**，这是一个专注于技术分享与深度思考的个人博客。

### 🎯 博客定位

这里主要分享以下内容：

- **技术架构**：系统设计、微服务、云原生等
- **AI 应用**：大模型、机器学习、智能应用开发
- **前端开发**：React、Next.js、TypeScript 等现代前端技术
- **产品设计**：用户体验、产品思维、设计系统

### 💡 为什么叫 DeepVeir？

**Deep** 代表深度思考，**Veir** 是一个自造词，寓意探索与发现。我们相信，真正的技术成长来自于深入理解原理，而非浅尝辄止。

### 🛠️ 技术栈

本博客使用以下技术构建：

- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **后端**：Spring Boot 3 + MySQL + JWT
- **部署**：Docker + Nginx

### 📬 联系我

如果你有任何问题或建议，欢迎通过以下方式联系我。',
'## 👋 Hello!

Welcome to **DeepVeir Blog**, a personal blog focused on technology sharing and deep thinking.

### 🎯 Blog Focus

Here we mainly share:

- **System Architecture**: System design, microservices, cloud native, etc.
- **AI Applications**: Large models, machine learning, intelligent application development
- **Frontend Development**: React, Next.js, TypeScript and other modern frontend technologies
- **Product Design**: User experience, product thinking, design systems

### 💡 Why DeepVeir?

**Deep** represents deep thinking, **Veir** is a coined word meaning exploration and discovery. We believe that true technical growth comes from deeply understanding principles, not just scratching the surface.

### 🛠️ Tech Stack

This blog is built with:

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Spring Boot 3 + MySQL + JWT
- **Deployment**: Docker + Nginx

### 📬 Contact Me

If you have any questions or suggestions, feel free to contact me.',
'contact@deepveir.com', 'https://github.com/DeepVeir', 'https://www.deepveir.com', 1);

SET FOREIGN_KEY_CHECKS = 1;
