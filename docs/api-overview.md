# TourPal API 接口总览

> 整理人：肖瑞（商业决策负责人）
> 基于《W5HH 分析与商业决策报告》生成 · 2026-04

---

## 预约管理接口

| 接口路径 | 方法 | 说明 | 调用角色 | W5HH 对应 |
|----------|------|------|----------|-----------|
| `/api/reservations` | POST | 游客发起预约，锁定档期 30 分钟（初始 PENDING）| Tourist | What §2 |
| `/api/reservations` | GET | 查询当前用户预约记录 | Tourist / Guide | What §5 |
| `/api/reservations/[id]/status` | PATCH | 向导更新订单状态 | Guide | What §3 |

---

## 评价系统接口

| 接口路径 | 方法 | 说明 | 调用角色 |
|----------|------|------|----------|
| `/api/reviews` | POST | 提交评价（1-5星 + 文字） | Tourist |
| `/api/reviews` | GET | 查询体验评价列表 | 公开 |

> **DRE 说明**：`rating ≤ 2` 自动标记 `isDefect = true`
> DRE = 已处理差评数 / 总差评数 × 100%

---

## 管理后台接口

| 接口路径 | 方法 | 说明 | 调用角色 |
|----------|------|------|----------|
| `/api/admin/stats` | GET | 运营统计（用户数/预约数/增长趋势/DRE）| Admin |
| `/api/listings` | POST | 向导发布体验产品 | Guide |

---

## 认证接口（NextAuth 托管）

| 接口路径 | 说明 |
|----------|------|
| `/api/auth/[...nextauth]` | 邮箱注册登录 / Google OAuth / 会话管理 |