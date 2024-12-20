"use client";

import { useState } from "react";
import Image from "next/image";
import { ClipboardList } from "lucide-react";
import { Button } from "@plane/ui";
import { useUserPermissions } from "@/hooks/store";
import { useProject } from "@/hooks/store/use-project";
import JoinProjectImg from "@/public/auth/project-not-authorized.svg";

export const JoinProject = () => {
  // states
  const [isJoiningProject, setIsJoiningProject] = useState(false);
  // store hooks
  // const { joinProject } = useUserPermissions();
  const { fetchProjects } = useProject();

  return (
    <div className="size-full flex flex-col items-center justify-center gap-y-5 bg-custom-background-100 text-center">
      <div className="h-44 w-72">
        <Image src={JoinProjectImg} height="176" width="288" alt="JoinProject" />
      </div>

      <div className="w-full max-w-md text-base text-custom-text-200">
        <p className="mx-auto w-full text-sm md:w-3/4">
          You are not a member of this project, but you can join this project by clicking the button below.
        </p>
      </div>

      <div>
        <Button
          variant="primary"
          prependIcon={<ClipboardList color="white" />}
          loading={isJoiningProject}
          // onClick={handleJoin}
        >
          {isJoiningProject ? "Joining..." : "Click to join"}
        </Button>
      </div>
    </div>
  );
};
