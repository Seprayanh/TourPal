# TourPal — 入境游在地体验与向导履约管理系统

TourPal 是一套面向入境游市场的**履约管理系统**，连接全球游客与优质本地向导，通过数字化手段保障服务履约的每一个环节。

Tech Stack: [Next.js 13](https://nextjs.org) · [Tailwind CSS](https://tailwindcss.com) · [NextAuth](https://next-auth.js.org) · [Prisma](https://www.prisma.io) · [MongoDB](https://www.mongodb.com/atlas/database)

---

## 核心功能模块

### 向导履约模块
完整的工单状态机，覆盖从接单到完成的全流程：

```
PENDING（待接单）→ ACCEPTED（已接单）→ IN_PROGRESS（进行中）→ COMPLETED（已完成）
                                     ↘
               PENDING / ACCEPTED    → CANCELLED（已取消）
```

向导可在 `/guide` 页面管理工单，依次执行**接单 → 开始行程打卡 → 确认完成**，系统自动记录 `checkInTime` 与 `checkOutTime`。工单按状态分为三个 Tab：**进行中 / 已完成 / 已取消**。

### 体验管理模块
对在地旅游产品进行 SKU 化管理，每个体验包含：
- 行程时长（`duration`）、时段（`timeSlot`：早/午/晚）
- 支持语言（`languages`）、集合地点（`meetingPoint`）
- 团队规模、价格、分类等

封面图通过浏览器 Canvas API 在客户端完成压缩（≤800px / JPEG 0.8），以 base64 Data URL 直接存入 MongoDB，无服务端文件系统依赖。

### 游客行程模块
游客在 `/trips` 页面查看所有预订，按状态分为三个 Tab：**Active（进行中）/ Completed（已完成）/ Cancelled（已取消）**。Active Tab 保留取消操作入口。

### 通知系统
- 实时（15 秒轮询）铃铛通知，支持游客与向导双端
- 向导收到新订单时推送通知；游客在每次状态变更（接单/开始/完成/取消）时收到通知
- 每条通知携带角色感知跳转链接：
  - 向导 → **查看工单 →**（`/guide`）
  - 游客 TOUR_COMPLETED → **Leave feedback →**（`/listings/{id}?review=1`，自动滚动至评价表单）
  - 游客其他 → **View my trips →**（`/trips`）
- 未读红点角标，点击面板后自动标记全部已读

### 评价与反馈
- 游客在 `/feedback` 页面查看个人所有历史评价（星级、评语、导览项目）
- 向导在 `/guide/reviews` 页面查看旗下所有项目收到的评价，按项目分组，显示平均分
- 导览完成后游客收到含反馈链接的通知（非强制）；点击后跳转至对应 listing 并自动滚动到评价区
- 系统自动标记差评（rating ≤ 2）为 `isDefect`，用于 DRE 计算

### 质量指标（DRE）
- DRE = 已处理差评 / 总差评 × 100%
- 管理后台展示：平均评分、差评率、DRE

### 多账号切换
用户可在侧边菜单切换已保存账号，无需退出登录。系统自动识别账号角色（Tourist / Guide / Admin）并调整菜单项和界面语言。

### 运营分析后台（`/admin`）
- 用户、体验、预订数量统计
- 近 6 个月增长趋势图
- 热门体验 Top 5
- 履约状态分布（各阶段工单数）
- 质量指标看板

---

## 环境变量

在项目根目录创建 `.env` 文件：

```env
DATABASE_URL=

GITHUB_ID=
GITHUB_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXTAUTH_SECRET=
```

---

## 本地启动

```bash
# 1. 安装依赖（postinstall 会自动执行 prisma generate）
npm install

# 2. 同步数据库 Schema
npx prisma db push

# 3. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 项目结构（关键目录）

```
app/
├── actions/              # 服务端数据获取函数
│   ├── get-my-reviews.ts         # 游客历史评价
│   └── get-guide-reviews.ts      # 向导收到的评价（按 listing 分组）
├── api/
│   ├── reservations/     # 预订 CRUD + 履约状态流转（含通知注入）
│   ├── reviews/          # 评价提交与查询
│   ├── notifications/    # 通知列表 GET + 标记已读 PATCH
│   └── admin/            # 运营统计数据
├── feedback/             # 游客"My Feedback"页
├── guide/
│   ├── work-orders.tsx   # 向导工单管理（三 Tab）
│   └── reviews/          # 向导"我的评价"页
├── listings/             # 体验详情页（含评价 + ?review=1 自动滚动）
├── trips/                # 游客行程页（三 Tab）
└── admin/                # 管理后台
components/
├── notification-bell.tsx         # 铃铛组件（角色感知链接）
├── listings/
│   ├── listing-card.tsx          # 列表卡片
│   ├── listing-head.tsx          # 详情页头图（支持 base64）
│   └── listing-reviews.tsx       # 评价展示 + 提交组件
├── inputs/
│   └── image-upload.tsx          # Canvas 压缩 → base64 上传
└── navbar/
    └── user-menu.tsx             # 角色菜单 + 多账号切换
hooks/
├── use-notifications.ts          # 15s 轮询通知 hook
└── use-saved-accounts.ts         # 多账号本地存储管理
prisma/
└── schema.prisma         # 数据模型（User / Listing / Reservation / Review / Notification）
```

---

## 角色与权限

| 角色 | 主要页面 | 主要操作 |
|------|----------|----------|
| Tourist | `/trips`、`/feedback`、`/listings/*` | 预订、评价、查看通知 |
| Guide | `/guide`、`/guide/reviews`、`/properties` | 接单、履约打卡、查看评价 |
| Admin | `/admin` | 运营数据总览 |

---

## 项目边界（Non-goals）

- 不含全球机票/酒店预订（专注在地体验）
- 不含深度社交功能
- 支付环节接入第三方接口，不自建支付网关
