import { PropsWithChildren } from "react";
import { AdminLayout } from "@/layouts/admin-layout";

export default function AuthenticationLayout({ children }: PropsWithChildren) {
  return <AdminLayout>{children}</AdminLayout>;
}
