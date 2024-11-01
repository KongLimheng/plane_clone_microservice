"use client";

import DefaultLayout from "@/layouts/default-layout";

export default function CustomErrorComponent() {
  const handleRefresh = () => {
    location.reload();
  };

  return <DefaultLayout>Error</DefaultLayout>;
}
