import getCurrentUser from "@/app/actions/get-current-user";
import getReservations from "@/app/actions/get-reservations";

import EmptyState from "@/components/empty-state";
import WorkOrders from "./work-orders";

export default async function GuidePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <EmptyState
        title="未登录"
        subtitle="请先登录后访问向导工单管理页面。"
      />
    );
  }

  // 获取当前用户作为向导（listing owner）的所有预订
  const reservations = await getReservations({ authorId: currentUser.id });

  if (reservations.length === 0) {
    return (
      <EmptyState
        title="暂无工单"
        subtitle="还没有游客预订您的体验产品。"
      />
    );
  }

  return <WorkOrders reservations={reservations} currentUser={currentUser} />;
}
