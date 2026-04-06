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

向导可在 `/guide` 页面管理工单，依次执行**接单 → 开始行程打卡 → 确认完成**，系统自动记录 `checkInTime` 与 `checkOutTime`。

### 体验管理模块
对在地旅游产品进行 SKU 化管理，每个体验包含：
- 行程时长（`duration`）
- 支持语言（`languages`）
- 集合地点（`meetingPoint`）
- 团队规模、价格、分类等

### 评价与质量指标（DRE）
- 游客完成行程后可提交星级评价（1-5 星）与文字评论
- 系统自动标记差评（rating ≤ 2）为 `isDefect`
- 管理后台实时展示：**平均评分、差评率、DRE（缺陷消除效率）**
- DRE = 已处理差评 / 总差评 × 100%

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
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

---

## 本地启动

```bash
# 1. 安装依赖
npm install

# 2. 生成 Prisma Client（必须先于 db push）
npx prisma generate

# 3. 同步数据库 Schema
npx prisma db push

# 4. （可选）填充种子数据
npx prisma db seed

# 5. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

---

## 项目结构（关键目录）

```
app/
├── actions/          # 服务端数据获取函数
├── api/
│   ├── reservations/ # 预订 CRUD + 履约状态流转
│   ├── reviews/      # 评价提交与查询
│   └── admin/        # 运营统计数据
├── guide/            # 向导工单管理页
├── listings/         # 体验详情页（含评价展示）
├── trips/            # 游客行程页
└── admin/            # 管理后台
components/
├── listings/
│   ├── listing-reviews.tsx   # 评价展示 + 提交组件
│   └── ...
prisma/
└── schema.prisma     # 数据模型（User / Listing / Reservation / Review）
```

---

## 项目边界（Non-goals）

- 不含全球机票/酒店预订（专注在地体验）
- 不含深度社交功能
- 支付环节接入第三方接口，不自建支付网关
