# ZenFlow (快算盘) 部署操作手册

本文档用于指导如何在全新的 Linux 服务器（Ubuntu/CentOS）上部署 ZenFlow 系统。

## 1. 环境准备

服务器必须安装 Node.js (推荐 v16+) 和 PM2 进程管理器。

### Ubuntu 系统安装命令：
\`\`\`bash
# 1. 安装 Node.js v16
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 git 和 编译工具
sudo apt-get install -y git build-essential

# 3. 安装 PM2 (用于后台保活)
npm install pm2 -g
\`\`\`

### CentOS 系统安装命令：
\`\`\`bash
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs git make gcc-c++
npm install pm2 -g
\`\`\`

---

## 2. 获取代码

从 GitHub 仓库拉取最新代码到服务器目录（例如 /www/wwwroot）。

\`\`\`bash
cd /www/wwwroot
git clone https://github.com/jonywei/zenflow.git
cd zenflow
\`\`\`

---

## 3. 安装与编译 (关键步骤)

本项目后端采用 TypeScript 编写，**必须编译**后才能运行。

\`\`\`bash
# 1. 进入后端目录
cd server

# 2. 安装依赖包 (耗时较长，请等待)
npm install

# 3. 编译代码 (生成 dist 目录)
npm run build
\`\`\`
*注：如果编译成功，终端不会报错，且目录下会出现 dist 文件夹。*

---

## 4. 数据库恢复 (重要⚠️)

由于安全原因，数据库文件未上传至代码仓库。**必须手动从旧服务器迁移数据库**，否则系统无法登录。

1.  找到旧服务器上的数据库文件：/server/zenflow.db
2.  将其上传到新服务器的同样位置：zenflow/server/zenflow.db

---

## 5. 启动服务

使用 PM2 启动并设置开机自启。

\`\`\`bash
# 1. 启动服务
pm2 start dist/main.js --name "zenflow"

# 2. 保存当前进程列表 (开机自启)
pm2 save
pm2 startup
\`\`\`

**默认端口**: 3000
**检查日志**: pm2 logs zenflow

---

## 6. 前端部署

前端是静态文件，无需编译。
确保 Nginx 指向目录为：/www/wwwroot/zenflow/client/src
EOF
git add DEPLOY.md && git commit -m "Update deployment manual" && git push -u origin main --force