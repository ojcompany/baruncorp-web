"use client";
import ProjectForm from "../common/ProjectForm";
import JobsRelatedToProjectTable from "../common/JobsRelatedToProjectTable";
import PageHeaderAction from "./PageHeaderAction";
import useProjectQuery from "@/queries/useProjectQuery";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import useNotFound from "@/hook/useNotFound";
import CollapsibleSection from "@/components/CollapsibleSection";
import { ProjectResponseDto } from "@/api/api-spec";

function getPageHeader({
  pageType,
  project,
}: {
  pageType: JobDetailPageType;
  project: ProjectResponseDto;
}) {
  switch (pageType) {
    case "HOME":
      return (
        <PageHeader
          items={[
            { href: "/", name: "Home" },
            {
              href: `/projects/${project.projectId}`,
              name: project.propertyAddress.fullAddress,
            },
          ]}
          action={<PageHeaderAction project={project} pageType={pageType} />}
        />
      );
    case "WORKSPACE":
      return (
        <PageHeader
          items={[
            { href: "/workspace", name: "Workspace" },
            {
              href: `/workspace/projects/${project.projectId}`,
              name: project.propertyAddress.fullAddress,
            },
          ]}
          action={<PageHeaderAction project={project} pageType={pageType} />}
        />
      );
    case "SYSTEM_MANAGEMENT":
      return (
        <PageHeader
          items={[
            { href: "/system-management/projects", name: "Projects" },
            {
              href: `/system-management/projects/${project.projectId}`,
              name: project.propertyAddress.fullAddress,
            },
          ]}
          action={<PageHeaderAction project={project} pageType={pageType} />}
        />
      );
  }
}

interface Props {
  projectId: string;
  pageType: JobDetailPageType;
}

export default function ProjectDetailPage({ projectId, pageType }: Props) {
  const {
    data: project,
    isLoading: isProjectQueryLoading,
    error: projectQueryError,
  } = useProjectQuery(projectId);
  useNotFound(projectQueryError);

  if (isProjectQueryLoading || project == null) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col gap-4">
      {getPageHeader({ pageType, project })}
      <div className="space-y-6">
        <section>
          <ProjectForm project={project} pageType={pageType} />
        </section>
        <CollapsibleSection title="Jobs Related to Project">
          <JobsRelatedToProjectTable project={project} pageType={pageType} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
