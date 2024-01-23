"use client";
import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { ExternalLink, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { AxiosError } from "axios";
import { useParams } from "next/navigation";
import Link from "next/link";
import { UserResponseDto } from "@/api";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import RowItemsContainer from "@/components/RowItemsContainer";
import LoadingButton from "@/components/LoadingButton";
import {
  BARUNCORP_ORGANIZATION_ID,
  transformStringIntoNullableString,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import usePatchProfileByUserIdMutation from "@/mutations/usePatchProfileByUserIdMutation";
import { Checkbox } from "@/components/ui/checkbox";
import { getUserQueryKey } from "@/queries/useUserQuery";
import { getProfileQueryKey } from "@/queries/useProfileQuery";
import OrganizationsCombobox from "@/components/combobox/OrganizationsCombobox";
import DateOfJoiningDatePicker from "@/components/DateOfJoiningDatePicker";
import { getISOStringForStartOfDayInUTC } from "@/lib/utils";

const formSchema = z
  .object({
    organizationId: z
      .string()
      .trim()
      .min(1, { message: "Organization is required" }),
    firstName: z.string().trim().min(1, {
      message: "First Name is required",
    }),
    lastName: z.string().trim().min(1, {
      message: "Last Name is required",
    }),
    phoneNumber: z.string().trim(),
    emailAddress: z
      .string()
      .trim()
      .min(1, { message: "Email Address is required" })
      .email({
        message: "Format of Email Address is incorrect",
      }),
    emailAddressesToReceiveDeliverables: z.array(
      z.object({
        email: z
          .string()
          .trim()
          .min(1, { message: "Email Address is required" })
          .email({ message: "Format of Email Address is incorrect" }),
      })
    ),
    isContractor: z.boolean(),
    dateOfJoining: z.date().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.organizationId === BARUNCORP_ORGANIZATION_ID &&
      values.dateOfJoining == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of Joining is required",
        path: ["dateOfJoining"],
      });
      return;
    }
  });

type FieldValues = z.infer<typeof formSchema>;

const getFieldValues = (user: UserResponseDto): FieldValues => {
  return {
    emailAddress: user.email,
    emailAddressesToReceiveDeliverables: user.deliverablesEmails.map(
      (email) => ({
        email,
      })
    ),
    firstName: user.firstName,
    lastName: user.lastName,
    organizationId: user.organizationId,
    phoneNumber: user.phoneNumber ?? "",
    isContractor: user.isVendor,
    dateOfJoining:
      user.dateOfJoining == null ? undefined : new Date(user.dateOfJoining),
  };
};

interface Props {
  user: UserResponseDto;
}

export default function UserForm({ user }: Props) {
  const { data: session, status } = useSession();
  const { userId } = useParams() as { userId: string };

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: getFieldValues(user),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emailAddressesToReceiveDeliverables",
  });

  const { mutateAsync } = usePatchProfileByUserIdMutation(userId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      form.reset(getFieldValues(user));
    }
  }, [form, user]);

  async function onSubmit(values: FieldValues) {
    await mutateAsync({
      deliverablesEmails: values.emailAddressesToReceiveDeliverables.map(
        ({ email }) => email
      ),
      firstName: values.firstName,
      lastName: values.lastName,
      phoneNumber: transformStringIntoNullableString.parse(values.phoneNumber),
      isVendor:
        user.organizationId === BARUNCORP_ORGANIZATION_ID
          ? false
          : values.isContractor,
      dateOfJoining:
        user.organizationId === BARUNCORP_ORGANIZATION_ID
          ? getISOStringForStartOfDayInUTC(values.dateOfJoining ?? new Date())
          : null,
    })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: getUserQueryKey(userId),
        });

        if (
          status === "authenticated" &&
          user &&
          session.email === user.email
        ) {
          queryClient.invalidateQueries({
            queryKey: getProfileQueryKey(),
          });
        }
      })
      .catch((error: AxiosError<ErrorResponseData>) => {
        switch (error.response?.status) {
          case 400:
            if (error.response?.data.errorCode.includes("10111")) {
              form.setError(
                "phoneNumber",
                {
                  message: `Phone Number is invalid`,
                },
                { shouldFocus: true }
              );
            }
            if (error.response?.data.errorCode.includes("20821")) {
              form.setError(
                "dateOfJoining",
                {
                  message: `There is PTO history before the date of joining`,
                },
                { shouldFocus: true }
              );
            }
            break;
        }
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="organizationId"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Organization</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <OrganizationsCombobox
                    organizationId={field.value}
                    onOrganizationIdChange={field.onChange}
                    ref={field.ref}
                    disabled
                  />
                </FormControl>
                <Button
                  size={"icon"}
                  variant={"outline"}
                  className="shrink-0"
                  asChild
                >
                  <Link
                    href={`/system-management/organizations/${user.organizationId}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <RowItemsContainer>
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </RowItemsContainer>
        <FormField
          control={form.control}
          name="emailAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Email Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    form.setValue(
                      `emailAddressesToReceiveDeliverables.0.email`,
                      event.target.value,
                      {
                        shouldValidate: form.formState.isSubmitted,
                      }
                    );
                  }}
                  disabled
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emailAddressesToReceiveDeliverables"
          render={() => {
            return (
              <FormItem>
                <FormLabel required>
                  Email Addresses to Receive Deliverables
                </FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`emailAddressesToReceiveDeliverables.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row gap-2">
                          <FormControl>
                            <Input {...field} disabled={index === 0} />
                          </FormControl>
                          {index !== 0 && (
                            <Button
                              variant={"outline"}
                              size={"icon"}
                              className="flex-shrink-0"
                              onClick={() => {
                                remove(index);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  variant={"outline"}
                  className="w-full"
                  onClick={() => {
                    append({ email: "" });
                  }}
                  type="button"
                >
                  Add Email
                </Button>
              </FormItem>
            );
          }}
        />
        {user.organizationId !== BARUNCORP_ORGANIZATION_ID && (
          <FormField
            control={form.control}
            name="isContractor"
            render={({ field }) => (
              <FormItem className="flex-row-reverse justify-end items-center gap-3">
                <FormLabel>Contractor</FormLabel>
                <FormControl>
                  <Checkbox
                    ref={field.ref}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {user.organizationId === BARUNCORP_ORGANIZATION_ID && (
          <FormField
            control={form.control}
            name="dateOfJoining"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Date of Joining</FormLabel>
                <FormControl>
                  <DateOfJoiningDatePicker {...field} />
                </FormControl>
                <FormDescription>
                  Tenure and PTO are updated based on Date of Joining
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <LoadingButton
          type="submit"
          className="w-full"
          isLoading={form.formState.isSubmitting}
          disabled={!form.formState.isDirty}
        >
          Edit
        </LoadingButton>
      </form>
    </Form>
  );
}
