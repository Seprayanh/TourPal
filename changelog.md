# Changelog - TourPal

## [v2.0.0] - 2026-04-15

### ✨ Features & Enhancements (新特性与体验优化)
- **核心业务模块:** 完整实现向导履约模块、评价系统以及 DRE 质量指标。
- **角色与权限体验:** 优化 Tourist/Guide 双端角色体验，新增全英文 UI，并重构了多维度搜索过滤器。
- **多账号管理:** 新增原地的多账号切换功能（Multi-account switching）及侧边抽屉导航栏（Side drawer menu）。
- **后台与管理:** 增加独立运营后台的入口，并全面升级为受保护的服务端管理布局（Server-side admin layout），优化管理员徽章状态。
- **业务领域适配:** 彻底完成从传统房源属性到旅游业务的转型，使用团队规模、游览时长、支持语言（group size, duration, language）替代原有的房间/卫浴数量。
- **全局状态与 UI:** 统一全局货币单位为 USD，新增状态标签（Status tabs）、向导通知、页面导航链接、自动滚动反馈页面。

### 🐛 Bug Fixes (问题修复)
- **部署与环境:** 修复 Railway 生产环境构建问题，将 Prisma 移至 dependencies 并启用 postinstall hook；增加 Railway MongoDB 代理启动脚本。
- **路由与安全:** 修复账号切换后无限重定向的问题，加强 Admin 页面路由守卫（取代失效的 useSession guard）；修复搜索栏点击无法跳转正确步骤的问题。
- **数据与类型:** 补全 `SafeReservation` 的 checkInTime/checkOutTime 解决核心类型冲突；将 `CountrySelectValue` 中的 flag 字段设为可选。
- **UI 组件异常:** 修复 `individual-listing.tsx` 中多余 `</div>` 导致的 JSX 崩溃；修复各类小体验问题（图片本地上传、国家地区标签、各类标题展示）。
- **内容清洗:** 替换并修复了所有失效、错位的图片链接，并在 Seed Data 中更新了精准的英文描述及扩充了用户测试数据。

### 📝 Documentation & Chores (文档与工程化)
- **文档更新:** 彻底重写 README，准确涵盖 TourPal 当前的核心特性、向导履约模块与运营后台操作说明。
- **CI/CD:** 引入 GitHub Actions workflow，实现云端自动化工作流。
- **初始化:** 完成 TourPal 品牌更名与仓库的基础结构搭建。
