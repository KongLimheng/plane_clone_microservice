import React, { PropsWithChildren } from "react";
import { Metadata } from "next";
import { AdminLayout } from "@/layouts/admin-layout";

export const metadata: Metadata = {
  title: "Images Settings - Plane Web",
};

const ImageLayout = ({ children }: PropsWithChildren) => <AdminLayout>{children}</AdminLayout>;

export default ImageLayout;
