# Docker 部署指南

## 快速开始

### 1. 环境准备

确保服务器已安装：
- Docker 20.10+
- Docker Compose 2.0+

```bash
# 检查版本
docker --version
docker-compose --version
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置
vim .env
```

**重要配置项：**

| 变量 | 说明 | 示例 |
|------|------|------|
| `MYSQL_ROOT_PASSWORD` | MySQL root 密码 | `your_strong_password` |
| `MYSQL_USER` | 应用数据库用户 | `blog_user` |
| `MYSQL_PASSWORD` | 应用数据库密码 | `your_password` |
| `NEXT_PUBLIC_API_URL` | API 地址 | `http://your-domain.com/api` |
| `SQL_INIT_MODE` | 首次启动设为 `always` | `never` |

### 3. 启动服务

#### 开发环境（直接暴露端口）

```bash
# 首次启动（初始化数据库）
SQL_INIT_MODE=always docker-compose up -d

# 查看日志确认初始化完成
docker-compose logs -f blog-server

# 后续启动
docker-compose up -d
```

#### 生产环境（带 Nginx）

```bash
# 修改 Nginx 配置中的域名
vim nginx/conf.d/default.conf

# 启动
docker-compose -f docker-compose.prod.yml up -d
```

### 4. 访问服务

| 服务 | 开发环境 | 生产环境 |
|------|----------|----------|
| 博客前端 | http://localhost:3000 | http://blog.example.com |
| 后台管理 | http://localhost:3001 | http://admin.example.com |
| API | http://localhost:8080 | http://api.example.com |

---

## 常用命令

```bash
# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]

# 重启服务
docker-compose restart [service_name]

# 停止所有服务
docker-compose down

# 停止并删除数据卷（慎用！会删除数据库）
docker-compose down -v

# 重新构建镜像
docker-compose build --no-cache

# 更新单个服务
docker-compose up -d --build blog-server
```

---

## 数据库管理

### 备份数据库

```bash
docker exec blog-mysql mysqldump -u root -p${MYSQL_ROOT_PASSWORD} blog > backup_$(date +%Y%m%d).sql
```

### 恢复数据库

```bash
docker exec -i blog-mysql mysql -u root -p${MYSQL_ROOT_PASSWORD} blog < backup.sql
```

### 进入数据库

```bash
docker exec -it blog-mysql mysql -u root -p
```

---

## HTTPS 配置

### 使用 Let's Encrypt

1. 安装 certbot：
```bash
apt install certbot
```

2. 获取证书：
```bash
certbot certonly --standalone -d blog.example.com -d admin.example.com
```

3. 复制证书到 nginx/ssl 目录：
```bash
cp /etc/letsencrypt/live/blog.example.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/blog.example.com/privkey.pem nginx/ssl/
```

4. 修改 Nginx 配置启用 HTTPS（参考 nginx/conf.d/ssl.conf.example）

---

## 故障排查

### 服务无法启动

```bash
# 查看详细日志
docker-compose logs blog-server

# 检查容器状态
docker inspect blog-server
```

### 数据库连接失败

```bash
# 确认 MySQL 已启动
docker-compose ps mysql

# 测试连接
docker exec blog-server ping mysql
```

### 前端无法访问 API

1. 检查 `NEXT_PUBLIC_API_URL` 配置
2. 确认后端服务正常运行
3. 检查 CORS 配置

---

## 性能优化

### JVM 参数调整

修改 `docker-compose.yml` 中的 `JAVA_OPTS`：

```yaml
JAVA_OPTS: "-Xms512m -Xmx1024m -XX:+UseG1GC"
```

### MySQL 优化

创建 `mysql/my.cnf` 并挂载：

```ini
[mysqld]
innodb_buffer_pool_size = 256M
max_connections = 200
```

---

## 目录结构

```
blog/
├── docker-compose.yml          # 开发环境编排
├── docker-compose.prod.yml     # 生产环境编排
├── .env.example                # 环境变量模板
├── nginx/
│   ├── nginx.conf              # Nginx 主配置
│   ├── conf.d/
│   │   └── default.conf        # 站点配置
│   ├── ssl/                    # SSL 证书目录
│   └── logs/                   # 日志目录
├── blog-server/
│   ├── Dockerfile
│   └── .dockerignore
├── blog-ui/
│   ├── Dockerfile
│   └── .dockerignore
└── blog-manager-ui/
    ├── Dockerfile
    └── .dockerignore
```
