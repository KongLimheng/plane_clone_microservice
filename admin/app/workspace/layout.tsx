import React, { PropsWithChildren } from "react";
import { Metadata } from "next";
import { AdminLayout } from "@/layouts/admin-layout";

export const metadata: Metadata = {
  title: "Workspace Management - Plane Web",
};
const WorkspaceManagementLayout = ({ children }: PropsWithChildren) => <AdminLayout>{children}</AdminLayout>;

export default WorkspaceManagementLayout;
