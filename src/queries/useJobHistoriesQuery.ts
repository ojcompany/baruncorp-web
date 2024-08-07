import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindIntegratedOrderModificationHistoryPaginatedHttpControllerGetParams,
  IntegratedOrderModificationHistoryPaginatedResponseDto,
} from "@/api/api-spec";

export const getJobHistoriesQueryKey = (
  params: FindIntegratedOrderModificationHistoryPaginatedHttpControllerGetParams
) => ["job-histories", "list", params];

const useJobHistoriesQuery = (
  params: FindIntegratedOrderModificationHistoryPaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    IntegratedOrderModificationHistoryPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getJobHistoriesQueryKey(params),
    queryFn: () =>
      api.integratedOrderModificationHistory
        .findIntegratedOrderModificationHistoryPaginatedHttpControllerGet(
          params
        )
        .then(({ data }) => data),
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useJobHistoriesQuery;
