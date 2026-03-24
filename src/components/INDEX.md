<!-- FORMAT-DOC: Update when files in this folder change -->

# components

全局共享 UI 组件，由 MainLayout 统一渲染或被各页面直接引用。

## Files

| File | Role | Responsibilities |
|---|---|---|
| AIFloatButton.tsx | UI | AI 智能助手浮窗，内置关键词匹配知识库（6 大主题），模拟延迟回复，支持快捷标签与推荐问题 |
| Breadcrumb.tsx | UI | 面包屑导航，基于 useLocation 自动生成路径层级，首页和大屏页不渲染 |
| Footer.tsx | UI | 页脚组件，三栏布局：品牌信息 + 快速链接 + 二维码 |
| MechBorderBox.tsx | UI | 大屏专用机械感蓝色边框容器，四角 L 形装饰 + 扫描线动画 |
