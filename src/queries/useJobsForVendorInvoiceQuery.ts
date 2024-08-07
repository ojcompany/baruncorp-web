import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import useApi from "@/hook/useApi";
import {
  FindVendorToInvoiceLineItemsPaginatedHttpControllerGetParams,
  VendorInvoiceLineItemPaginatedResponseDto,
} from "@/api/api-spec";

export const getJobsForVendorInvoiceQueryKey = (
  params: FindVendorToInvoiceLineItemsPaginatedHttpControllerGetParams
) => ["jobs-for-vendor-invoice", "list", params];

const useJobsForVendorInvoiceQuery = (
  params: FindVendorToInvoiceLineItemsPaginatedHttpControllerGetParams,
  isKeepPreviousData?: boolean
) => {
  const api = useApi();

  return useQuery<
    VendorInvoiceLineItemPaginatedResponseDto,
    AxiosError<ErrorResponseData>
  >({
    queryKey: getJobsForVendorInvoiceQueryKey(params),
    queryFn: () =>
      api.vendorToInvoiceLineItems
        .findVendorToInvoiceLineItemsPaginatedHttpControllerGet(params)
        .then(({ data }) => data),
    enabled: params.clientOrganizationId !== "" && params.serviceMonth !== "",
    placeholderData: isKeepPreviousData ? keepPreviousData : undefined,
  });
};

export default useJobsForVendorInvoiceQuery;
