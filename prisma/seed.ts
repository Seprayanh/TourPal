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
    title: "Beijing Hutong Cultural Deep Dive",
    description: "Explore Beijing's ancient alleyways with a local guide. Visit hidden courtyard homes, sample authentic street food like Jianbing and sugar-coated hawthorn, and hear stories passed down through generations. Small groups of 6 or fewer. Fully guided in English.",
    category: "City Walk",
    locationValue: "CN",
    price: 299,
    imageSrc: "https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800",
    guestCount: 6,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "Shanghai Bund Night Tour & Local Cuisine",
    description: "From the colonial grandeur of the Bund to the neon-lit lanes of the Former French Concession, your local guide reveals the Shanghai that tourists miss. End the night with hand-picked street eats and craft cocktails.",
    category: "Food Tour",
    locationValue: "CN",
    price: 349,
    imageSrc: "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=800",
    guestCount: 4,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "Xi'an City Wall Cycling & Muslim Quarter Feast",
    description: "Rent a bike and circle the fully intact Ming Dynasty city wall as the sun rises over Xi'an. Afterwards, dive into the Muslim Quarter for lamb skewers, Biangbiang noodles, and pomegranate juice straight from the press.",
    category: "Heritage Tour",
    locationValue: "CN",
    price: 259,
    imageSrc: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
    guestCount: 8,
    roomCount: 2,
    bathroomCount: 0,
  },
  {
    title: "Chengdu Giant Panda Base & Tea House Culture",
    description: "Beat the crowds with an early-morning visit to the Giant Panda Breeding Research Base. Watch pandas at their most playful before heading to a century-old tea house in People's Park for a genuine Chengdu slow-life experience.",
    category: "Nature & Culture",
    locationValue: "CN",
    price: 389,
    imageSrc: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800",
    guestCount: 5,
    roomCount: 2,
    bathroomCount: 0,
  },
  {
    title: "Guangzhou Dim Sum Morning & Cantonese Kitchen Secrets",
    description: "Your Guangzhou local takes you behind the scenes of a family-run yum cha restaurant before it opens. Learn the art of folding har gow and cheung fun, then feast on your own creations alongside regulars who have been coming here for decades.",
    category: "Food Tour",
    locationValue: "CN",
    price: 228,
    imageSrc: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
    guestCount: 6,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "Hangzhou West Lake Tea Picking & Boat Ride",
    description: "Head to a real Longjing tea farm in Longjing Village, pick leaves by hand, and learn the traditional pan-firing technique from a fourth-generation tea farmer. Finish with a sunset boat glide across West Lake.",
    category: "Nature & Culture",
    locationValue: "CN",
    price: 318,
    imageSrc: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    guestCount: 4,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "Chongqing Hot Pot Masterclass & Hillside Stroll",
    description: "Chongqing invented hot pot — let a local prove it. Visit the spice market to select your own peppers and aromatics, then cook a full meal under the guidance of a hotpot chef. Walk off the heat on the illuminated hillside stairways of Hongyadong at night.",
    category: "Food Tour",
    locationValue: "CN",
    price: 278,
    imageSrc: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800",
    guestCount: 6,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "Suzhou Classical Garden & Silk Weaving Workshop",
    description: "Wander through UNESCO-listed classical gardens with a knowledgeable local art historian. Then visit a working silk factory where craftswomen still operate century-old hand looms, and try weaving a small souvenir to take home.",
    category: "Heritage Tour",
    locationValue: "CN",
    price: 338,
    imageSrc: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    guestCount: 5,
    roomCount: 2,
    bathroomCount: 0,
  },
  {
    title: "Guilin Li River Kayak & Karst Village Lunch",
    description: "Paddle a kayak through the otherworldly karst peaks of the Li River at your own pace, guided by a local outdoor enthusiast. Pull ashore at a Zhuang minority village for a home-cooked lunch of bamboo rice and river fish.",
    category: "Nature & Culture",
    locationValue: "CN",
    price: 420,
    imageSrc: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800",
    guestCount: 4,
    roomCount: 2,
    bathroomCount: 0,
  },
  {
    title: "Chengdu Sichuan Opera & Backstage Makeup Tour",
    description: "Go backstage at a Sichuan Opera house before the evening show and watch the performers apply their elaborate face paint. Your guide explains the symbolism behind each color and character. Ringside seats included for the face-changing performance.",
    category: "City Walk",
    locationValue: "CN",
    price: 310,
    imageSrc: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800",
    guestCount: 8,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "Yunnan Naxi Village Homestay & Dongba Culture",
    description: "Spend a half-day with a Naxi family in a traditional village outside Lijiang. Learn a few characters of Dongba script — the world's only living pictographic writing system — and join the family for lunch cooked on a wood-fired stove.",
    category: "Heritage Tour",
    locationValue: "CN",
    price: 365,
    imageSrc: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800",
    guestCount: 4,
    roomCount: 1,
    bathroomCount: 0,
  },
  {
    title: "Xiamen Gulangyu Island Music Walk & Coffee Tour",
    description: "Gulangyu is home to more pianos per capita than anywhere else on earth. Stroll the car-free lanes with a local musician who shares the island's colonial history and introduces you to hidden cafés, indie galleries, and live jazz sessions.",
    category: "City Walk",
    locationValue: "CN",
    price: 245,
    imageSrc: "https://images.unsplash.com/photo-1534008757030-27299c4371b6?w=800",
    guestCount: 6,
    roomCount: 1,
    bathroomCount: 0,
  },
];

async function main() {
  console.log("🌏 Seeding TourPal demo data...\n");

  console.log("🗑️  Clearing old data...");
  await prisma.reservation.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();
  console.log("   Done\n");

  console.log("🧑‍🤝‍🧑 Creating guide accounts...");
  const guideUsers = await Promise.all([
    prisma.user.create({ data: { name: "Leo Wang", email: "leo.wang@tourpal.guide", image: "https://i.pravatar.cc/150?img=11", createdAt: randDateInPastMonths(6) } }),
    prisma.user.create({ data: { name: "Xiaoyu Chen", email: "xiaoyu.chen@tourpal.guide", image: "https://i.pravatar.cc/150?img=47", createdAt: randDateInPastMonths(5) } }),
    prisma.user.create({ data: { name: "Ming Zhang", email: "ming.zhang@tourpal.guide", image: "https://i.pravatar.cc/150?img=12", createdAt: randDateInPastMonths(5) } }),
    prisma.user.create({ data: { name: "Fang Liu", email: "fang.liu@tourpal.guide", image: "https://i.pravatar.cc/150?img=45", createdAt: randDateInPastMonths(4) } }),
    prisma.user.create({ data: { name: "Wei Zhao", email: "wei.zhao@tourpal.guide", image: "https://i.pravatar.cc/150?img=14", createdAt: randDateInPastMonths(3) } }),
    prisma.user.create({ data: { name: "Jing Sun", email: "jing.sun@tourpal.guide", image: "https://i.pravatar.cc/150?img=49", createdAt: randDateInPastMonths(2) } }),
    prisma.user.create({ data: { name: "Hao Li", email: "hao.li@tourpal.guide", image: "https://i.pravatar.cc/150?img=15", createdAt: randDateInPastMonths(4) } }),
    prisma.user.create({ data: { name: "Mei Wu", email: "mei.wu@tourpal.guide", image: "https://i.pravatar.cc/150?img=48", createdAt: randDateInPastMonths(3) } }),
  ]);
  console.log(`   ✅ Created ${guideUsers.length} guides\n`);

  console.log("🌍 Creating tourist accounts...");
  const tourists = await Promise.all([
    prisma.user.create({ data: { name: "Alex Johnson", email: "alex.johnson.demo@tourpal.com", image: "https://i.pravatar.cc/150?img=32", createdAt: randDateInPastMonths(6) } }),
    prisma.user.create({ data: { name: "Emma Wilson", email: "emma.wilson.demo@tourpal.com", image: "https://i.pravatar.cc/150?img=44", createdAt: randDateInPastMonths(5) } }),
    prisma.user.create({ data: { name: "James Miller", email: "james.miller.demo@tourpal.com", image: "https://i.pravatar.cc/150?img=33", createdAt: randDateInPastMonths(5) } }),
    prisma.user.create({ data: { name: "Sophie Martin", email: "sophie.martin.demo@tourpal.com", image: "https://i.pravatar.cc/150?img=46", createdAt: randDateInPastMonths(4) } }),
    prisma.user.create({ data: { name: "Lucas Brown", email: "lucas.brown.demo@tourpal.com", image: "https://i.pravatar.cc/150?img=35", createdAt: randDateInPastMonths(3) } }),
    prisma.user.create({ data: { name: "Yuki Tanaka", email: "yuki.tanaka.demo@tourpal.com", image: "https://i.pravatar.cc/150?img=50", createdAt: randDateInPastMonths(2) } }),
  ]);
  console.log(`   ✅ Created ${tourists.length} tourists\n`);

  console.log("🗺️  Creating experience listings...");
  const listings = await Promise.all(
    GUIDE_LISTINGS.map((data, i) =>
      prisma.listing.create({ data: { ...data, userId: guideUsers[i % guideUsers.length].id } })
    )
  );
  console.log(`   ✅ Created ${listings.length} listings\n`);

  console.log("📅 Generating reservation history (45 records, 6-month growth trend)...");
  const reservationConfigs = [
    { monthsAgo: 6, count: 4 },
    { monthsAgo: 5, count: 5 },
    { monthsAgo: 4, count: 7 },
    { monthsAgo: 3, count: 8 },
    { monthsAgo: 2, count: 10 },
    { monthsAgo: 1, count: 11 },
  ];

  let total = 0;
  for (const { monthsAgo, count } of reservationConfigs) {
    for (let i = 0; i < count; i++) {
      const listing = listings[randInt(0, listings.length - 1)];
      const tourist = tourists[randInt(0, tourists.length - 1)];
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
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  console.log(`   ✅ Created ${total} reservations\n`);

  console.log("✅ Seed complete!");
  console.log(`   Guides: ${guideUsers.length} | Tourists: ${tourists.length} | Listings: ${listings.length} | Reservations: ${total}`);
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });