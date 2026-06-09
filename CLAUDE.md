# Claude / Codex 项目上下文

本文档只保留新会话入口，避免旧项目结构误导开发。

请按以下顺序阅读：

1. `AGENTS.md`：项目规则、命令和编码约束。
2. `DATA_SOURCES.md`：当前数据源、接口边界、生产环境信息。
3. `docs/SESSION-HANDOFF.md`：新会话接手说明。

当前事实：

- 项目目录：`C:\work\yichang\yc-new\yc`
- 当前生产分支：`new`
- 生产服务器：`root@192.168.9.235:/root/work/yc`
- 公网地址：`http://58.220.229.11:50006/`
- 主接口来源：研究院 TG `/tg-api`，后端地址 `119.36.242.222:19020`
- 少量旧模块仍使用 WF `/wf-api`，后端地址 `119.36.242.222:8902`

开发要求：

- React 19 + TypeScript
- 2 空格缩进
- 手动编辑使用 `apply_patch`
- 改完运行 `npm run lint` 和 `npm run build`

不要再参考旧的 `demo-api / WF 兜底 / main 分支生产` 口径。
