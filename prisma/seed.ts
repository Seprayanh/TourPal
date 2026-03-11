/**
 * TourPal 数据库种子脚本
 *
 * 放置路径: prisma/seed.ts
 *
 * 运行方法:
 *   npx ts-node prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDateInPastMonths(monthsAgo: number): Date {
  const now = new Date();
  const past = new Date();
  past.setMonth(now.getMonth() - monthsAgo);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

const GUIDE_LISTINGS = [
  {
    title: "北京胡同文化深度漫游",
    description: "跟随北京本地向导，穿越南锣鼓巷、烟袋斜街等历史胡同，探访四合院民居，品尝正宗北京小吃。全程英语讲解，小班制不超过6人。",
    category: "City Walk",
    locationValue: "CN",
    price: 299,
    imageSrc: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800",
    guestCount: 6,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "上海外滩夜游与美食探索",
    description: "从外滩的万国建筑博览到新天地的摩登夜生活，再到弄堂里的本帮菜馆。本地向导带你走遍游客不知道的上海角落。",
    category: "Food Tour",
    locationValue: "CN",
    price: 349,
    imageSrc: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800",
    guestCount: 4,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "西安城墙骑行与回民街美食",
    description: "骑上共享单车环绕西安古城墙一圈，俯瞰千年古都全貌。随后走进回民街，品尝羊肉泡馍、Biangbiang面等特色陕西美食。",
    category: "Heritage Tour",
    locationValue: "CN",
    price: 259,
    imageSrc: "https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800",
    guestCount: 8,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "成都大熊猫基地与茶馆文化半日游",
    description: "早晨前往熊猫繁育基地，趁大熊猫最活跃时拍照留念。下午移步人民公园鹤鸣茶社，体验真实的成都慢生活。",
    category: "Nature & Culture",
    locationValue: "CN",
    price: 389,
    imageSrc: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800",
    guestCount: 5,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "广州早茶文化深度体验",
    description: "广州本地向导带你走进不对外营业的老字号后厨，了解虾饺、肠粉的制作工艺。随后在传统茶楼体验正宗饮茶礼仪。",
    category: "Food Tour",
    locationValue: "CN",
    price: 228,
    imageSrc: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
    guestCount: 6,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "杭州西湖茶园采茶体验",
    description: "前往龙井村真正的茶农家，亲手参与龙井茶的采摘与手工炒制。随后乘船游览西湖，在湖光山色中品茗论茶。",
    category: "Nature & Culture",
    locationValue: "CN",
    price: 318,
    imageSrc: "https://images.unsplash.com/photo-1513415277900-a62401e19be4?w=800",
    guestCount: 4,
    roomCount: 1,
    bathroomCount: 0,
  },
];

async function main() {
  console.log("🌱 开始写入 TourPal 演示数据...\n");

  console.log("🗑️  清空旧数据...");
  await prisma.reservation.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  console.log("   完成\n");

  console.log("👥 创建本地向导账户...");
  const guideUsers = await Promise.all([
    prisma.user.create({ data: { name: "王磊 (Leo Wang)", email: "leo.wang@tourpal.guide", image: "https://i.pravatar.cc/150?img=11", createdAt: randDateInPastMonths(6) } }),
    prisma.user.create({ data: { name: "陈晓雨 (Xiaoyu Chen)", email: "xiaoyu.chen@tourpal.guide", image: "https://i.pravatar.cc/150?img=47", createdAt: randDateInPastMonths(5) } }),
    prisma.user.create({ data: { name: "张明 (Ming Zhang)", email: "ming.zhang@tourpal.guide", image: "https://i.pravatar.cc/150?img=12", createdAt: randDateInPastMonths(5) } }),
    prisma.user.create({ data: { name: "刘芳 (Fang Liu)", email: "fang.liu@tourpal.guide", image: "https://i.pravatar.cc/150?img=45", createdAt: randDateInPastMonths(4) } }),
    prisma.user.create({ data: { name: "赵伟 (Wei Zhao)", email: "wei.zhao@tourpal.guide", image: "https://i.pravatar.cc/150?img=14", createdAt: randDateInPastMonths(3) } }),
    prisma.user.create({ data: { name: "孙静 (Jing Sun)", email: "jing.sun@tourpal.guide", image: "https://i.pravatar.cc/150?img=49", createdAt: randDateInPastMonths(2) } }),
  ]);
  console.log(`   ✅ 创建了 ${guideUsers.length} 位向导\n`);

  console.log("🌍 创建游客账户...");
  const tourist = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex.johnson.demo@tourpal.com",
      image: "https://i.pravatar.cc/150?img=32",
      createdAt: randDateInPastMonths(3),
    },
  });
  console.log(`   ✅ 创建游客: ${tourist.name}\n`);

  console.log("📍 创建在地体验产品...");
  const listings = await Promise.all(
    GUIDE_LISTINGS.map((data, i) =>
      prisma.listing.create({ data: { ...data, userId: guideUsers[i].id } })
    )
  );
  console.log(`   ✅ 创建了 ${listings.length} 个体验产品\n`);

  console.log("📅 生成历史预订记录（20条，过去6个月递增分布）...");

  const reservationConfigs = [
    { monthsAgo: 6, count: 2 },
    { monthsAgo: 5, count: 2 },
    { monthsAgo: 4, count: 3 },
    { monthsAgo: 3, count: 3 },
    { monthsAgo: 2, count: 4 },
    { monthsAgo: 1, count: 6 },
  ];

  let total = 0;
  for (const { monthsAgo, count } of reservationConfigs) {
    for (let i = 0; i < count; i++) {
      const listing = listings[randInt(0, listings.length - 1)];
      const createdAt = randDateInPastMonths(monthsAgo);
      const startDate = new Date(createdAt);
      startDate.setDate(startDate.getDate() + randInt(1, 7));
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + randInt(1, 3));

      await prisma.reservation.create({
        data: {
          userId: tourist.id,
          listingId: listing.id,
          startDate,
          endDate,
          totalPrice: listing.price * randInt(1, 3),
          createdAt,
        },
      });
      total++;
    }
  }
  console.log(`   ✅ 创建了 ${total} 条预订记录\n`);

  console.log("═══════════════════════════════════");
  console.log("✅ 种子数据写入完成！");
  console.log(`   向导: ${guideUsers.length} 位  |  体验产品: ${listings.length} 个  |  预订: ${total} 条`);
  console.log("🚀 运行 npm run dev，访问 localhost:3000 查看效果");
}

main()
  .catch((e) => { console.error("❌ 出错:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
