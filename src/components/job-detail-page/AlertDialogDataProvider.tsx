"use client";
import { Dispatch, createContext, useContext, useReducer } from "react";
import { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { JobStatusEnum, OrderedServiceStatusEnum } from "@/lib/constants";
import usePatchJobStatusMutation from "@/mutations/usePatchJobStatusMutation";
import { useToast } from "@/components/ui/use-toast";
import { getJobQueryKey } from "@/queries/useJobQuery";
import { getProjectQueryKey } from "@/queries/useProjectQuery";
import usePatchOrderedServiceStatusMutation from "@/mutations/usePatchOrderedServiceStatusMutation";
import usePatchAssignMutation from "@/mutations/usePatchAssignMutation";
import usePatchAssignedTaskCompleteMutation from "@/mutations/usePatchAssignedTaskCompleteMutation";
import usePatchAssignedTaskUnassignMutation from "@/mutations/usePatchAssignedTaskUnassignMutation";
import usePatchJobSendMutation from "@/mutations/usePatchJobSendMutation";
import LoadingButton from "@/components/LoadingButton";
import useDeleteTrackingNumberMutation from "@/mutations/useDeleteTrackingNumberMutation";
import { getTrackingNumbersQueryKey } from "@/queries/useTrackingNumbersQuery";
import { getJobHistoriesQueryKey } from "@/queries/useJobHistoriesQuery";

type AlertDialogData =
  | {
      open: false;
    }
  | {
      open: true;
      type: "UPDATE_JOB_STATUS";
      status: JobStatusEnum;
      jobId: string;
      projectId: string;
    }
  | {
      open: true;
      type: "UPDATE_ORDERED_SERVICE_STATUS";
      status: OrderedServiceStatusEnum;
      jobId: string;
      projectId: string;
      orderedServiceId: string;
    }
  | {
      open: true;
      type: "ASSIGN";
      userId: string;
      assignedTaskId: string;
      jobId: string;
      projectId: string;
    }
  | {
      open: true;
      type: "UPDATE_TASK_TO_COMPLETE";
      assignedTaskId: string;
      jobId: string;
      projectId: string;
    }
  | {
      open: true;
      type: "UNASSIGN";
      assignedTaskId: string;
      jobId: string;
      projectId: string;
    }
  | {
      open: true;
      type: "DELETE_TRACKING_NUMBER";
      trackingNumberId: string;
      jobId: string;
    };

type Action =
  | {
      type: "UPDATE_JOB_STATUS";
      status: JobStatusEnum;
      jobId: string;
      projectId: string;
    }
  | {
      type: "UPDATE_ORDERED_SERVICE_STATUS";
      status: OrderedServiceStatusEnum;
      jobId: string;
      projectId: string;
      orderedServiceId: string;
    }
  | {
      type: "ASSIGN";
      userId: string;
      assignedTaskId: string;
      jobId: string;
      projectId: string;
    }
  | {
      type: "UPDATE_TASK_TO_COMPLETE";
      assignedTaskId: string;
      jobId: string;
      projectId: string;
    }
  | {
      type: "UNASSIGN";
      assignedTaskId: string;
      jobId: string;
      projectId: string;
    }
  | {
      type: "DELETE_TRACKING_NUMBER";
      trackingNumberId: string;
      jobId: string;
    }
  | {
      type: "CLOSE";
    };

function alertDialogDataReducer(
  alertDialogData: AlertDialogData,
  action: Action
): AlertDialogData {
  switch (action.type) {
    case "UPDATE_JOB_STATUS": {
      return {
        open: true,
        ...action,
      };
    }
    case "UPDATE_ORDERED_SERVICE_STATUS": {
      return {
        open: true,
        ...action,
      };
    }
    case "ASSIGN": {
      return {
        open: true,
        ...action,
      };
    }
    case "UPDATE_TASK_TO_COMPLETE": {
      return {
        open: true,
        ...action,
      };
    }
    case "UNASSIGN": {
      return {
        open: true,
        ...action,
      };
    }
    case "DELETE_TRACKING_NUMBER": {
      return {
        open: true,
        ...action,
      };
    }
    case "CLOSE": {
      return {
        open: false,
      };
    }
  }
}

const initialAlertDialogData = {
  open: false,
} as const;

const AlertDialogDataDispatchContext = createContext<Dispatch<Action>>(
  () => {}
);

interface Props {
  children: React.ReactNode;
}

export default function AlertDialogDataProvider({ children }: Props) {
  const [alertDialogData, dispatch] = useReducer(
    alertDialogDataReducer,
    initialAlertDialogData
  );

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const {
    mutateAsync: patchJobStatusMutateAsync,
    isPending: isPatchJobStatusMutationPending,
  } = usePatchJobStatusMutation();
  const {
    mutateAsync: patchJobSendMutateAsync,
    isPending: isPatchJobSendMutationPending,
  } = usePatchJobSendMutation();
  const {
    mutateAsync: patchOrderedServiceStatusMutateAsync,
    isPending: isPatchOrderedServiceStatusMutationPending,
  } = usePatchOrderedServiceStatusMutation();
  const {
    mutateAsync: patchAssignMutateAsync,
    isPending: isPatchAssignMutationPending,
  } = usePatchAssignMutation();
  const {
    mutateAsync: patchAssignedTaskCompleteMutateAsync,
    isPending: isPatchAssignedTaskCompleteMutationPending,
  } = usePatchAssignedTaskCompleteMutation();
  const {
    mutateAsync: patchAssignedTaskUnassignMutateAsync,
    isPending: isPatchAssignedTaskUnassignMutationPending,
  } = usePatchAssignedTaskUnassignMutation();
  const {
    mutateAsync: deleteTrackingNumberMutateAsync,
    isPending: isDeleteTrackingNumberMutationPending,
  } = useDeleteTrackingNumberMutation();

  const isPending =
    isPatchJobStatusMutationPending ||
    isPatchJobSendMutationPending ||
    isPatchOrderedServiceStatusMutationPending ||
    isPatchAssignMutationPending ||
    isPatchAssignedTaskCompleteMutationPending ||
    isPatchAssignedTaskUnassignMutationPending ||
    isDeleteTrackingNumberMutationPending;

  return (
    <>
      <AlertDialogDataDispatchContext.Provider value={dispatch}>
        {children}
      </AlertDialogDataDispatchContext.Provider>
      <AlertDialog
        open={alertDialogData.open}
        onOpenChange={(newOpen) => {
          if (newOpen) {
            return;
          }

          dispatch({ type: "CLOSE" });
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <LoadingButton
              isLoading={isPending}
              onClick={() => {
                if (!alertDialogData.open) {
                  return;
                }

                if (alertDialogData.type === "UPDATE_JOB_STATUS") {
                  const { jobId, projectId, status } = alertDialogData;

                  if (status === JobStatusEnum.Values["Sent To Client"]) {
                    patchJobSendMutateAsync({ jobId })
                      .then(() => {
                        toast({ title: "Success" });
                        queryClient.invalidateQueries({
                          queryKey: getJobQueryKey(jobId),
                        });
                        queryClient.invalidateQueries({
                          queryKey: getProjectQueryKey(projectId),
                        });
                        queryClient.invalidateQueries({
                          queryKey: getJobHistoriesQueryKey({ jobId }),
                        });
                        dispatch({ type: "CLOSE" });
                      })
                      .catch((error: AxiosError<ErrorResponseData>) => {
                        if (
                          error.response &&
                          error.response.data.errorCode.filter(
                            (value) => value != null
                          ).length !== 0
                        ) {
                          toast({
                            title: error.response.data.message,
                            variant: "destructive",
                          });
                          return;
                        }
                      });
                    return;
                  }

                  patchJobStatusMutateAsync({
                    jobId,
                    status,
                  })
                    .then(() => {
                      toast({ title: "Success" });
                      queryClient.invalidateQueries({
                        queryKey: getJobQueryKey(jobId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getProjectQueryKey(projectId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getJobHistoriesQueryKey({ jobId }),
                      });
                      dispatch({ type: "CLOSE" });
                    })
                    .catch((error: AxiosError<ErrorResponseData>) => {
                      switch (error.response?.status) {
                        case 422:
                          if (
                            error.response?.data.errorCode.includes("40011")
                          ) {
                            toast({
                              title: "Cannot change to Not Started",
                              variant: "destructive",
                            });
                            return;
                          }
                      }

                      if (
                        error.response &&
                        error.response.data.errorCode.filter(
                          (value) => value != null
                        ).length !== 0
                      ) {
                        toast({
                          title: error.response.data.message,
                          variant: "destructive",
                        });
                        return;
                      }
                    });
                }

                if (alertDialogData.type === "UPDATE_ORDERED_SERVICE_STATUS") {
                  const { jobId, projectId, orderedServiceId, status } =
                    alertDialogData;
                  if (status === "On Hold") {
                    return;
                  }

                  patchOrderedServiceStatusMutateAsync({
                    orderedServiceId,
                    status,
                  })
                    .then(() => {
                      toast({ title: "Success" });
                      queryClient.invalidateQueries({
                        queryKey: getJobQueryKey(jobId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getProjectQueryKey(projectId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getJobHistoriesQueryKey({ jobId }),
                      });
                      dispatch({ type: "CLOSE" });
                    })
                    .catch((error: AxiosError<ErrorResponseData>) => {
                      switch (error.response?.status) {
                        case 422:
                          if (
                            error.response?.data.errorCode.includes("40309")
                          ) {
                            toast({
                              title:
                                "Cannot change to Complete because all tasks are not completed",
                              variant: "destructive",
                            });
                            return;
                          }
                      }

                      if (
                        error.response &&
                        error.response.data.errorCode.filter(
                          (value) => value != null
                        ).length !== 0
                      ) {
                        toast({
                          title: error.response.data.message,
                          variant: "destructive",
                        });
                        return;
                      }
                    });
                }

                if (alertDialogData.type === "ASSIGN") {
                  const { jobId, projectId, assignedTaskId, userId } =
                    alertDialogData;

                  patchAssignMutateAsync({
                    assignedTaskId,
                    assigneeId: userId,
                  })
                    .then(() => {
                      toast({ title: "Success" });
                      queryClient.invalidateQueries({
                        queryKey: getJobQueryKey(jobId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getProjectQueryKey(projectId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getJobHistoriesQueryKey({ jobId }),
                      });
                      dispatch({ type: "CLOSE" });
                    })
                    .catch((error: AxiosError<ErrorResponseData>) => {
                      if (
                        error.response &&
                        error.response.data.errorCode.filter(
                          (value) => value != null
                        ).length !== 0
                      ) {
                        toast({
                          title: error.response.data.message,
                          variant: "destructive",
                        });
                        return;
                      }
                    });
                }

                if (alertDialogData.type === "UPDATE_TASK_TO_COMPLETE") {
                  const { jobId, projectId, assignedTaskId } = alertDialogData;

                  patchAssignedTaskCompleteMutateAsync({ assignedTaskId })
                    .then(() => {
                      toast({ title: "Success" });
                      queryClient.invalidateQueries({
                        queryKey: getJobQueryKey(jobId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getProjectQueryKey(projectId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getJobHistoriesQueryKey({ jobId }),
                      });
                      dispatch({ type: "CLOSE" });
                    })
                    .catch((error: AxiosError<ErrorResponseData>) => {
                      if (
                        error.response &&
                        error.response.data.errorCode.filter(
                          (value) => value != null
                        ).length !== 0
                      ) {
                        toast({
                          title: error.response.data.message,
                          variant: "destructive",
                        });
                        return;
                      }
                    });
                }

                if (alertDialogData.type === "UNASSIGN") {
                  const { jobId, projectId, assignedTaskId } = alertDialogData;

                  patchAssignedTaskUnassignMutateAsync({ assignedTaskId })
                    .then(() => {
                      toast({ title: "Success" });
                      queryClient.invalidateQueries({
                        queryKey: getJobQueryKey(jobId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getProjectQueryKey(projectId),
                      });
                      queryClient.invalidateQueries({
                        queryKey: getJobHistoriesQueryKey({ jobId }),
                      });
                      dispatch({ type: "CLOSE" });
                    })
                    .catch((error: AxiosError<ErrorResponseData>) => {
                      if (
                        error.response &&
                        error.response.data.errorCode.filter(
                          (value) => value != null
                        ).length !== 0
                      ) {
                        toast({
                          title: error.response.data.message,
                          variant: "destructive",
                        });
                        return;
                      }
                    });
                }

                if (alertDialogData.type === "DELETE_TRACKING_NUMBER") {
                  const { jobId, trackingNumberId } = alertDialogData;

                  deleteTrackingNumberMutateAsync({
                    trackingNumberId,
                  })
                    .then(() => {
                      toast({ title: "Success" });
                      queryClient.invalidateQueries({
                        queryKey: getTrackingNumbersQueryKey({ jobId }),
                      });
                      dispatch({ type: "CLOSE" });
                    })
                    .catch((error: AxiosError<ErrorResponseData>) => {
                      if (
                        error.response &&
                        error.response.data.errorCode.filter(
                          (value) => value != null
                        ).length !== 0
                      ) {
                        toast({
                          title: error.response.data.message,
                          variant: "destructive",
                        });
                        return;
                      }
                    });
                }
              }}
            >
              Continue
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function useAlertDialogDataDispatch() {
  return useContext(AlertDialogDataDispatchContext);
}