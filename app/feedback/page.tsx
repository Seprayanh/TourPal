import * as React from "react";
import { redirect } from "next/navigation";

import getCurrentUser from "@/app/actions/get-current-user";
import getMyReviews from "@/app/actions/get-my-reviews";
import EmptyState from "@/components/empty-state";
import MyFeedback from "./my-feedback";

export default async function FeedbackPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  const reviews = await getMyReviews(currentUser.id);

  if (reviews.length === 0) {
    return (
      <EmptyState
        title="No feedback yet"
        subtitle="Your reviews will appear here after you complete a tour and leave feedback."
      />
    );
  }

  return <MyFeedback reviews={reviews} />;
}
