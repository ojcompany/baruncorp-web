"use client";

import { useProfileContext } from "../../ProfileProvider";
import JobsTableForMember from "../../JobsTableForMember";
import JobsTableForClient from "../../JobsTableForClient";
import PageHeader from "@/components/PageHeader";
import GlobalSearch from "@/components/table/GlobalSearch";

export default function Page() {
  const { isBarunCorpMember } = useProfileContext();

  // 멤버인 경우
  if (isBarunCorpMember) {
    const TABLE_NAME = "JobsForMember";
    const jobNameSearchParamName = `${TABLE_NAME}JobName`;
    const projectNumberSearchParamName = `${TABLE_NAME}ProjectNumber`;
    const propertyOwnerSearchParamName = `${TABLE_NAME}PropertyOwner`;
    const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
    return (
      <div className="space-y-4">
        <PageHeader items={[{ href: "../in-progress", name: "In Progress" }]} />
        <GlobalSearch
          searchParamOptions={{
            jobNameSearchParamName: jobNameSearchParamName,
            projectNumberSearchParamName: projectNumberSearchParamName,
            propertyOwnerSearchParamName: propertyOwnerSearchParamName,
          }}
          pageIndexSearchParamName={pageIndexSearchParamName}
        />
        <div className="space-y-6">
          <JobsTableForMember type="In Progress" />
        </div>
      </div>
    );
  }

  // 클라이언트인 경우
  const TABLE_NAME = "JobsForClient";
  const jobNameSearchParamName = `${TABLE_NAME}JobName`;
  const projectNumberSearchParamName = `${TABLE_NAME}ProjectNumber`;
  const propertyOwnerSearchParamName = `${TABLE_NAME}PropertyOwner`;
  const pageIndexSearchParamName = `${TABLE_NAME}PageIndex`;
  return (
    <div className="space-y-4">
      <PageHeader items={[{ href: "../in-progress", name: "In Progress" }]} />
      <GlobalSearch
        searchParamOptions={{
          jobNameSearchParamName: jobNameSearchParamName,
          projectNumberSearchParamName: projectNumberSearchParamName,
          propertyOwnerSearchParamName: propertyOwnerSearchParamName,
        }}
        pageIndexSearchParamName={pageIndexSearchParamName}
      />
      <div className="space-y-6">
        <JobsTableForClient type="In Progress" />
      </div>
    </div>
  );
}
