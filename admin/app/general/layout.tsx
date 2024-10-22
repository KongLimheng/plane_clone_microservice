import React, { PropsWithChildren } from "react";
import { Metadata } from "next";
import { AdminLayout } from "@/layouts/admin-layout";

export const metadata: Metadata = {
  title: "General Settings - Plane Web",
};

const GeneralLayout = ({ children }: PropsWithChildren) => <AdminLayout>{children}</AdminLayout>;

export default GeneralLayout;
