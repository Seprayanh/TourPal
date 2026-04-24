import { redirect } from "next/navigation";
import getCurrentUser from "@/app/actions/get-current-user";

const ADMIN_EMAIL = "suruihan07@gmail.com";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  return <>{children}</>;
}
