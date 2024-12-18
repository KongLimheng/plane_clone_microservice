"use client";

import { PropsWithChildren } from "react";
import { ProjectAuthWrapper } from "@/layouts/auth-layout";

const ProjectDetailLayout = ({ children }: PropsWithChildren) => <ProjectAuthWrapper>{children}</ProjectAuthWrapper>;

export default ProjectDetailLayout;
