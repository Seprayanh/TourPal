"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";

import { SafeReservation, SafeUser } from "@/types";
import Container from "@/components/container";
import Heading from "@/components/heading";

interface WorkOrdersProps {
  reservations: SafeReservation[];
  currentUser: SafeUser;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  PENDING:     { label: "待接单",   color: "bg-yellow-100 text-yellow-700" },
  ACCEPTED:    { label: "已接单",   color: "bg-blue-100 text-blue-700"   },
  IN_PROGRESS: { label: "进行中",   color: "bg-indigo-100 text-indigo-700" },
  COMPLETED:   { label: "已完成",   color: "bg-green-100 text-green-700"  },
  CANCELLED:   { label: "已取消",   color: "bg-gray-100 text-gray-500"   },
};

const ACTION_LABEL: Record<string, string> = {
  PENDING:     "接单",
  ACCEPTED:    "开始行程（打卡）",
  IN_PROGRESS: "确认完成",
};

const ACTION_KEY: Record<string, string> = {
  PENDING:     "accept",
  ACCEPTED:    "start",
  IN_PROGRESS: "complete",
};

const WorkOrders: React.FC<WorkOrdersProps> = ({ reservations, currentUser }) => {
  const router = useRouter();
  const [loadingId, setLoadingId] = React.useState<string>("");

  const handleAction = React.useCallback(
    async (reservationId: string, status: string) => {
      const action = ACTION_KEY[status];
      if (!action) return;

      setLoadingId(reservationId);
      try {
        await axios.patch(`/api/reservations/${reservationId}/status`, { action });
        toast.success("操作成功");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.response?.data?.error ?? "操作失败，请重试");
      } finally {
        setLoadingId("");
      }
    },
    [router]
  );

  const handleCancel = React.useCallback(
    async (reservationId: string) => {
      setLoadingId(reservationId);
      try {
        await axios.patch(`/api/reservations/${reservationId}/status`, { action: "cancel" });
        toast.success("已取消工单");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.response?.data?.error ?? "取消失败");
      } finally {
        setLoadingId("");
      }
    },
    [router]
  );

  return (
    <Container>
      <Heading
        title="向导工单管理"
        subtitle="查看并管理游客预订的行程工单"
      />

      <div className="mt-10 space-y-4">
        {reservations.map((reservation) => {
          const statusInfo = STATUS_LABEL[reservation.status] ?? { label: reservation.status, color: "bg-gray-100 text-gray-500" };
          const actionLabel = ACTION_LABEL[reservation.status];
          const isLoading = loadingId === reservation.id;

          const startDate = new Date(reservation.startDate).toLocaleDateString("zh-CN");
          const endDate   = new Date(reservation.endDate).toLocaleDateString("zh-CN");

          return (
            <div
              key={reservation.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate text-base">
                    {reservation.listing.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    行程日期：{startDate} — {endDate}
                  </p>
                  <p className="text-sm text-gray-500">
                    费用：<span className="font-medium text-gray-700">$ {reservation.totalPrice.toLocaleString()}</span>
                  </p>
                  {reservation.checkInTime && (
                    <p className="text-xs text-gray-400 mt-1">
                      打卡开始：{new Date(reservation.checkInTime).toLocaleString("zh-CN")}
                    </p>
                  )}
                  {reservation.checkOutTime && (
                    <p className="text-xs text-gray-400">
                      完成时间：{new Date(reservation.checkOutTime).toLocaleString("zh-CN")}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>

                  <div className="flex gap-2">
                    {actionLabel && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleAction(reservation.id, reservation.status)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? "处理中…" : actionLabel}
                      </button>
                    )}
                    {(reservation.status === "PENDING" || reservation.status === "ACCEPTED") && (
                      <button
                        disabled={isLoading}
                        onClick={() => handleCancel(reservation.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        取消
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export default WorkOrders;
