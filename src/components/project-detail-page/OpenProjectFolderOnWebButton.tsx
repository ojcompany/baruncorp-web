import React from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ProjectResponseDto } from "@/api/api-spec";

interface Props {
  project: ProjectResponseDto;
}

export default function OpenProjectFolderOnWebButton({ project }: Props) {
  if (project.shareLink == null) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger>
          <Button
            variant={"outline"}
            disabled
            className={`border-none w-full justify-start`}
          >
            <span>Web</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Some error occurred and the link is missing
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <a href={project.shareLink} target="_blank" rel="noopener noreferrer">
      <Button
        variant={"outline"}
        className={`border-none w-full justify-start`}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <span>Web</span>
      </Button>
    </a>
  );
}
