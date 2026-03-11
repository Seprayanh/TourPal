"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function Container({ children }) {
  return (
    <div className="max-w-[2520px] mx-auto xl:px-20 md:px-10 sm:px-2 px-4">
      {children}
    </div>
  );
}

function StatCard({ label, labelEn, value, color, delta, deltaLabel }) {
  const colorMap = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    amber: "text-amber-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5 mb-3">{labelEn}</p>
      <p className={`text-4xl font-light ${colorMap[color] ?? "text-gray-800"}`}>
        {value ?? "—"}
      </p>
      {delta !== undefined && (
        <p className="text-xs text-gray-400 mt-2">
          本月新增 <span className="font-medium text-gray-600">{delta}</span> {deltaLabel}
        </p>
      )}
    </div>
  );
}

function ActivityRow({ item, index }) {
  const date = new Date(item.createdAt).toLocaleDateString("zh-CN", {
    month: "short", day: "numeric",
  });
  return (
    <div className={`flex items-center justify-between py-3 ${index !== 0 ? "border-t border-gray-100" : ""}`}>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{item.listingTitle}</p>
        <p className="text-xs text-gray-400">{item.userName}</p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-700">¥{item.totalPrice?.toLocaleString()}</p>
        <p className="text-xs text-gray-400">{date}</p>
      </div>
    </div>
  );
}

function ListingRow({ item, index }) {
  return (
    <div className={`flex items-center justify-between py-3 ${index !== 0 ? "border-t border-gray-100" : ""}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs flex items-center justify-center font-medium flex-shrink-0">
          {index + 1}
        </span>
        <p className="text-sm text-gray-800 truncate">{item.title}</p>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className="text-sm font-semibold text-gray-700">{item.reservationCount} 单</p>
        <p className="text-xs text-gray-400">¥{item.price}/次</p>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.dataKey}：</span>
          <span className="font-medium text-gray-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/stats")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error(err);
        setError("无法加载数据，请检查数据库连接或稍后重试。");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">正在加载运营数据…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm">
          <p className="text-rose-500 font-medium mb-2">数据加载失败</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const { stats, chartData, recentActivity, topListings } = data;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      <Container>
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            运营分析后台
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Operations Dashboard · 数据来源：生产数据库实时查询
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard
            label="累计注册用户" labelEn="Total Registered Users"
            value={stats.totalUsers.toLocaleString()} color="indigo"
            delta={stats.newUsersThisMonth} deltaLabel="位用户"
          />
          <StatCard
            label="在售体验产品" labelEn="Active Listings"
            value={stats.totalListings.toLocaleString()} color="emerald"
          />
          <StatCard
            label="累计预订订单" labelEn="Total Reservations"
            value={stats.totalReservations.toLocaleString()} color="rose"
            delta={stats.newReservationsThisMonth} deltaLabel="笔订单"
          />
          <StatCard
            label="订单转化率" labelEn="Booking Conversion Rate"
            value={
              stats.totalUsers > 0
                ? `${((stats.totalReservations / stats.totalUsers) * 100).toFixed(1)}%`
                : "—"
            }
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">近 6 个月增长趋势</h2>
            <p className="text-xs text-gray-400 mb-6">新增用户 vs 新增预订订单 · Growth Trend (6 months)</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 4, right: 12, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                  </linearGradient>
                  <linearGradient id="gradReserv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }} />
                <Area type="monotone" dataKey="新增用户" stroke="#6366f1" strokeWidth={2.5}
                  fill="url(#gradUsers)" dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Area type="monotone" dataKey="新增预订" stroke="#10b981" strokeWidth={2.5}
                  strokeDasharray="6 3" fill="url(#gradReserv)"
                  dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-1">热门体验 Top 5</h2>
            <p className="text-xs text-gray-400 mb-4">按预订量排序 · By Reservation Count</p>
            {topListings.length === 0 ? (
              <p className="text-sm text-gray-400">暂无数据</p>
            ) : (
              topListings.map((item, i) => <ListingRow key={item.id} item={item} index={i} />)
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-1">最近预订记录</h2>
          <p className="text-xs text-gray-400 mb-4">Recent Reservations · 最新 5 笔订单</p>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400">暂无预订记录</p>
          ) : (
            recentActivity.map((item, i) => <ActivityRow key={item.id} item={item} index={i} />)
          )}
        </div>
      </Container>
    </div>
  );
}
