# ZenFlow (快算盘) - SaaS 旗舰版

ZenFlow 是一套轻量级的企业 SaaS 管理系统，集成了工作台、单据中心（合同/收据）、金价实时行情查询等功能。

## 🛠 技术栈

- **后端**: Node.js, NestJS, TypeScript
- **数据库**: SQLite (Better-SQLite3)
- **前端**: HTML5, TailwindCSS (CDN), Vanilla JS
- **部署**: PM2 进程管理

## ✨ 主要功能

1.  **工作台**: 集成常用工具快捷入口、账户管理。
2.  **黄金行情**: 对接交易所 API，自动计算行业回收差价（Au -7, Pt -10）。
3.  **单据中心**: 
    - 销售合同生成（支持 Word 导出、自动排版）。
    - 三联单收据生成（自动计算总额）。
4.  **配置中心**: 企业/个人账户信息管理、快捷链接配置。

## 📂 目录结构

```text
zenflow/
├── client/             # 前端静态资源
│   └── src/            # HTML/CSS/JS 源码
├── server/             # 后端源码
│   ├── src/            # TypeScript 源码
│   ├── dist/           # 编译后的运行代码 (自动生成)
│   ├── zenflow.db      # SQLite 数据库文件
│   └── upload/         # 文件上传存储目录
├── package.json        # 项目依赖配置
└── tsconfig.json       # TypeScript 配置
