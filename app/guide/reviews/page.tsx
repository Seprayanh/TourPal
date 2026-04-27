import * as React from "react";
import { redirect } from "next/navigation";

import getCurrentUser from "@/app/actions/get-current-user";
import getGuideReviews from "@/app/actions/get-guide-reviews";
import EmptyState from "@/components/empty-state";
import GuideReviews from "./guide-reviews";

export default async function GuideReviewsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "GUIDE") {
    redirect("/");
  }

  const data = await getGuideReviews(currentUser.id);

  if (data.reviews.length === 0) {
    return (
      <EmptyState
        title="暂无评价"
        subtitle="游客完成行程后可对您的导览进行评价，评价内容将在此处汇总。"
      />
    );
  }

  return <GuideReviews data={data} />;
}
