"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ReactNode, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAhjQuery } from "@/queries/useAhjQuery";
import { Textarea } from "@/components/ui/textarea";
import {
  SelectOptionEnum,
  DigitalSignatureTypeEnum,
  WindExposureEnum,
  ANSIEnum,
  AhjPutReqDto,
} from "@/types/dto/ahjs";
import { usePutAhjMutation } from "@/queries/usePutAhjMutation";

const SelectOptionEnumWithEmptyString = SelectOptionEnum.or(z.literal("")); // "No" | "Yes" | "See Notes" | ""
const DigitalSignatureTypeEnumWithEmptyString = DigitalSignatureTypeEnum.or(
  z.literal("")
); // "Certified" | "Signed" | ""
const WindExposureEnumWithEmptyString = WindExposureEnum.or(z.literal("")); // "See Notes" | "B" | "C" | "D" | ""
const ANSIEnumWithEmptyString = ANSIEnum.or(z.literal("")); // "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""

/**
 * undefined => ""
 * null => ""
 * 3 => "3"
 * "" => ""
 * "  " => ""
 * "  abc  " => "abc"
 * "abc" => "abc"
 */
const schemaToConvertFromNullishStringToString = z.coerce
  .string()
  .trim()
  .nullish()
  .transform((v) => v ?? "");

/**
 * "" => null
 * "  " => null
 * "  abc  " => "abc"
 * "abc" => "abc"
 */
const schemaToConvertFromStringToNullableString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v));

// "No" | "Yes" | "See Notes" | null => "No" | "Yes" | "See Notes" | ""
const schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString =
  SelectOptionEnum.nullish().transform((v) => v ?? "");
// "No" | "Yes" | "See Notes" | "" => "No" | "Yes" | "See Notes" | null
const schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption =
  SelectOptionEnumWithEmptyString.transform((v) => (v === "" ? null : v));

// "Certified" | "Signed" | null => "Certified" | "Signed" | ""
const schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString =
  DigitalSignatureTypeEnum.nullish().transform((v) => v ?? "");
// "Certified" | "Signed" | "" => "Certified" | "Signed" | null
const schemaToConvertFromDigitalSignatureTypeWithEmptyStringToNullableDigitalSignatureType =
  DigitalSignatureTypeEnumWithEmptyString.transform((v) =>
    v === "" ? null : v
  );

// "See Notes" | "B" | "C" | "D" | null => "See Notes" | "B" | "C" | "D" | ""
const schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString =
  WindExposureEnum.nullish().transform((v) => v ?? "");
// "See Notes" | "B" | "C" | "D" | "" => "See Notes" | "B" | "C" | "D" | null
const schemaToConvertFromWindExposureWithEmptyStringToNullableWindExposure =
  WindExposureEnumWithEmptyString.transform((v) => (v === "" ? null : v));

// "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | null
// => "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""
const schemaToConvertFromNullishANSIToANSIWithEmptyString =
  ANSIEnum.nullish().transform((v) => v ?? "");
// "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | ""
// => "See Notes" | "ANSI A (8.5x11 INCH)" | "ANSI B (11x17 INCH)" | "ANSI D (22x34 INCH)" | "ARCH D (24x36 INCH)" | null
const schemaToConvertFromANSIWithEmptyStringToNullableANSI =
  ANSIEnumWithEmptyString.transform((v) => (v === "" ? null : v));

const formSchema = z.object({
  // general
  general: z.object({
    name: z.string(),
    website: z.string(),
    specificFormRequired: SelectOptionEnumWithEmptyString, // select box
    generalNotes: z.string(),
    buildingCodes: z.string(),
    updatedBy: z.string(),
    updatedAt: z.string(),
  }),

  // design
  design: z.object({
    fireSetBack: z.string(),
    utilityNotes: z.string(),
    designNotes: z.string(),
    pvMeterRequired: SelectOptionEnumWithEmptyString, // select box
    acDisconnectRequired: SelectOptionEnumWithEmptyString, // select box
    centerFed120Percent: SelectOptionEnumWithEmptyString, // select box
    deratedAmpacity: z.string(),
  }),

  // structural engineering
  engineering: z.object({
    engineeringNotes: z.string(),
    iebcAccepted: SelectOptionEnumWithEmptyString, // select box
    structuralObservationRequired: SelectOptionEnumWithEmptyString, // select box
    windUpliftCalculationRequired: SelectOptionEnumWithEmptyString, // select box
    wetStampsRequired: SelectOptionEnumWithEmptyString, // select box
    digitalSignatureType: DigitalSignatureTypeEnumWithEmptyString, // select box
    windExposure: WindExposureEnumWithEmptyString, // select box
    wetStampSize: ANSIEnumWithEmptyString, // select box
    windSpeed: z.string(),
    snowLoadGround: z.string(),
    snowLoadFlatRoof: z.string(),
    ofWetStamps: z.string(),
  }),

  // electrical engineering
  electricalEngineering: z.object({
    electricalNotes: z.string(),
  }),
});

type FieldValues = z.infer<typeof formSchema>;

export default function Page() {
  const { geoId } = useParams() as { geoId: string };
  const {
    data: ahj,
    isSuccess: isAhjQuerySuccess,
    isRefetching: isAhjQueryRefetching,
  } = useAhjQuery(geoId);

  const { mutateAsync } = usePutAhjMutation(geoId);

  const form = useForm<FieldValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // general
      general: {
        name: "",
        website: "",
        specificFormRequired: "",
        generalNotes: "",
        buildingCodes: "",
        updatedBy: "",
        updatedAt: "",
      },

      // design
      design: {
        fireSetBack: "",
        utilityNotes: "",
        designNotes: "",
        pvMeterRequired: "",
        acDisconnectRequired: "",
        centerFed120Percent: "",
        deratedAmpacity: "",
      },

      // structural engineering
      engineering: {
        engineeringNotes: "",
        iebcAccepted: "",
        structuralObservationRequired: "",
        windUpliftCalculationRequired: "",
        wetStampsRequired: "",
        digitalSignatureType: "",
        windExposure: "",
        wetStampSize: "",
        windSpeed: "",
        snowLoadGround: "",
        snowLoadFlatRoof: "",
        ofWetStamps: "",
      },

      // electrical engineering
      electricalEngineering: {
        electricalNotes: "",
      },
    },
  });

  const {
    control,
    formState: { isSubmitting, isDirty },
    reset,
  } = form;

  useEffect(() => {
    /**
     * isAhjQueryRefetching 필요한 이유:
     * usePutAhjMutation의 mutateAsync를 할 때 보내는 데이터는 trim해서 보낸다.
     * e.g. "   " => null, "   abc   " => "abc"
     * 그렇기 때문에 field를 띄어쓰기해서 수정을 했다고 할지라도 보내는 데이터는 이전과 같은 데이터를 보내게 될 수 있다.
     * 이전과 같은 데이터를 보내는 것이라도, mutateAsync을 동작시키기 때문에, invalidateQuery가 발생한다.
     * 그래서 useAhjQuery가 다시 동작하게 되는데, 그것으로부터 받은 데이터는 이전과 같은 데이터이기 때문에 이 useEffect 내의 함수는 dependency array로 ahj를 가지고 있어도 다시 동작하지 않는다.
     * 그래서 띄어쓰기와 같은 수정을 했을 때에도 reset 코드가 동작할 수 있도록 isAhjQueryRefetching이 필요하다.
     * isRefetching은 isFetching && !isLoading과 같은 값으로, 첫 로딩은 포함하지 않으면서 refetching이 발생할 때마다 바뀌는 boolean 값이다.
     * onSubmit은 mutateAsync를, mutateAsync는 invalidateQuery를 동작시키기 때문에 isRefetching은 submit의 시점과 일치하기 때문에 isRefetching으로 trim만 되어서 데이터는 같지만, submit된 시점을 확인할 수 있는 것이다.
     */
    if (!isAhjQuerySuccess || isAhjQueryRefetching) {
      return;
    }

    const general: FieldValues["general"] = {
      buildingCodes: schemaToConvertFromNullishStringToString.parse(
        ahj.general.buildingCodes
      ),
      generalNotes: schemaToConvertFromNullishStringToString.parse(
        ahj.general.generalNotes
      ),
      updatedAt: schemaToConvertFromNullishStringToString.parse(
        ahj.general.updatedAt
      ),
      updatedBy: schemaToConvertFromNullishStringToString.parse(
        ahj.general.updatedBy
      ),
      name: schemaToConvertFromNullishStringToString.parse(ahj.general.name),
      specificFormRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahj.general.specificFormRequired
        ),
      website: schemaToConvertFromNullishStringToString.parse(
        ahj.general.website
      ),
    };

    const design: FieldValues["design"] = {
      acDisconnectRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahj.design.acDisconnectRequired
        ),
      centerFed120Percent:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahj.design.centerFed120Percent
        ),
      pvMeterRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahj.design.pvMeterRequired
        ),
      deratedAmpacity: schemaToConvertFromNullishStringToString.parse(
        ahj.design.deratedAmpacity
      ),
      designNotes: schemaToConvertFromNullishStringToString.parse(
        ahj.design.designNotes
      ),
      fireSetBack: schemaToConvertFromNullishStringToString.parse(
        ahj.design.fireSetBack
      ),
      utilityNotes: schemaToConvertFromNullishStringToString.parse(
        ahj.design.utilityNotes
      ),
    };

    const engineering: FieldValues["engineering"] = {
      iebcAccepted:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahj.engineering.iebcAccepted
        ),
      windUpliftCalculationRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahj.engineering.windUpliftCalculationRequired
        ),
      structuralObservationRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahj.engineering.structuralObservationRequired
        ),
      wetStampsRequired:
        schemaToConvertFromNullishSelectOptionToSelectOptionWithEmptyString.parse(
          ahj.engineering.wetStampsRequired
        ),
      windExposure:
        schemaToConvertFromNullishWindExposureToWindExposureWithEmptyString.parse(
          ahj.engineering.windExposure
        ),
      wetStampSize: schemaToConvertFromNullishANSIToANSIWithEmptyString.parse(
        ahj.engineering.wetStampSize
      ),
      digitalSignatureType:
        schemaToConvertFromNullishDigitalSignatureTypeToDigitalSignatureTypeWithEmptyString.parse(
          ahj.engineering.digitalSignatureType
        ),
      engineeringNotes: schemaToConvertFromNullishStringToString.parse(
        ahj.engineering.engineeringNotes
      ),
      ofWetStamps: schemaToConvertFromNullishStringToString.parse(
        ahj.engineering.ofWetStamps
      ),
      snowLoadFlatRoof: schemaToConvertFromNullishStringToString.parse(
        ahj.engineering.snowLoadFlatRoof
      ),
      snowLoadGround: schemaToConvertFromNullishStringToString.parse(
        ahj.engineering.snowLoadGround
      ),
      windSpeed: schemaToConvertFromNullishStringToString.parse(
        ahj.engineering.windSpeed
      ),
    };

    const electricalEngineering: FieldValues["electricalEngineering"] = {
      electricalNotes: schemaToConvertFromNullishStringToString.parse(
        ahj.electricalEngineering.electricalNotes
      ),
    };

    reset({
      general,
      design,
      engineering,
      electricalEngineering,
    });
  }, [isAhjQuerySuccess, reset, ahj, isAhjQueryRefetching]);

  async function onSubmit(values: FieldValues) {
    const general: AhjPutReqDto["general"] = {
      buildingCodes: schemaToConvertFromStringToNullableString.parse(
        values.general.buildingCodes
      ),
      generalNotes: schemaToConvertFromStringToNullableString.parse(
        values.general.generalNotes
      ),
      website: schemaToConvertFromStringToNullableString.parse(
        values.general.website
      ),
      specificFormRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.general.specificFormRequired
        ),
    };

    const design: AhjPutReqDto["design"] = {
      deratedAmpacity: schemaToConvertFromStringToNullableString.parse(
        values.design.deratedAmpacity
      ),
      designNotes: schemaToConvertFromStringToNullableString.parse(
        values.design.designNotes
      ),
      fireSetBack: schemaToConvertFromStringToNullableString.parse(
        values.design.fireSetBack
      ),
      utilityNotes: schemaToConvertFromStringToNullableString.parse(
        values.design.utilityNotes
      ),
      pvMeterRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.design.pvMeterRequired
        ),
      acDisconnectRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.design.acDisconnectRequired
        ),
      centerFed120Percent:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.design.centerFed120Percent
        ),
    };

    const engineering: AhjPutReqDto["engineering"] = {
      iebcAccepted:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.engineering.iebcAccepted
        ),
      structuralObservationRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.engineering.structuralObservationRequired
        ),
      windUpliftCalculationRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.engineering.windUpliftCalculationRequired
        ),
      wetStampsRequired:
        schemaToConvertFromSelectOptionWithEmptyStringToNullableSelectOption.parse(
          values.engineering.wetStampsRequired
        ),
      digitalSignatureType:
        schemaToConvertFromDigitalSignatureTypeWithEmptyStringToNullableDigitalSignatureType.parse(
          values.engineering.digitalSignatureType
        ),
      windExposure:
        schemaToConvertFromWindExposureWithEmptyStringToNullableWindExposure.parse(
          values.engineering.windExposure
        ),
      wetStampSize: schemaToConvertFromANSIWithEmptyStringToNullableANSI.parse(
        values.engineering.wetStampSize
      ),
      engineeringNotes: schemaToConvertFromStringToNullableString.parse(
        values.engineering.engineeringNotes
      ),
      ofWetStamps: schemaToConvertFromStringToNullableString.parse(
        values.engineering.ofWetStamps
      ),
      snowLoadFlatRoof: schemaToConvertFromStringToNullableString.parse(
        values.engineering.snowLoadFlatRoof
      ),
      snowLoadGround: schemaToConvertFromStringToNullableString.parse(
        values.engineering.snowLoadGround
      ),
      windSpeed: schemaToConvertFromStringToNullableString.parse(
        values.engineering.windSpeed
      ),
    };

    const electricalEngineering: AhjPutReqDto["electricalEngineering"] = {
      electricalNotes: schemaToConvertFromStringToNullableString.parse(
        values.electricalEngineering.electricalNotes
      ),
    };

    await mutateAsync({
      general,
      design,
      engineering,
      electricalEngineering,
    });
  }

  return (
    <Form {...form}>
      <h1 className="h3 mb-4">AHJ</h1>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        {/* General */}
        <h1 className="h4 mb-2">General</h1>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="general.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} readOnly />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="general.website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="general.specificFormRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specific Form Required?</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SelectOptionEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>

        <FieldsRowWrapper>
          <FormField
            control={control}
            name="general.buildingCodes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Building Codes</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="general.generalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>General Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} className="resize-none" />
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>

        {/* Design */}
        <h1 className="h4 mb-2">Design</h1>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="design.pvMeterRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PV Meter Required?</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SelectOptionEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="design.acDisconnectRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AC Disconnect Required?</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SelectOptionEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="design.centerFed120Percent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Center Fed 120%</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SelectOptionEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="design.deratedAmpacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Derated Ampacity</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>
        <FormField
          control={control}
          name="design.fireSetBack"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fire Setback</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="design.utilityNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utility Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="design.designNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Design Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Structural Engineering */}
        <h1 className="h4 mb-2">Structural Engineering</h1>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="engineering.iebcAccepted"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IEBC Accepted?</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SelectOptionEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="engineering.structuralObservationRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Structural Observation Required?</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SelectOptionEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="engineering.digitalSignatureType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Digital Signature Type</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an digital signature type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {DigitalSignatureTypeEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="engineering.windUpliftCalculationRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wind Uplift Calculation Required?</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SelectOptionEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="engineering.windSpeed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wind Speed (mph)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="engineering.windExposure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wind Exposure</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an wind exposure" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {WindExposureEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="engineering.snowLoadGround"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Snow Load Ground (psf)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="engineering.snowLoadFlatRoof"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Snow Load Flat Roof (psf)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="engineering.wetStampsRequired"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wet Stamp Required?</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {SelectOptionEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="engineering.ofWetStamps"
            render={({ field }) => (
              <FormItem>
                <FormLabel># of Wet Stamps</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="engineering.wetStampSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wet Stamp Size</FormLabel>
                <FormControl>
                  <Select {...field} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an wet stamp size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ANSIEnum.options.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>
        <FormField
          control={control}
          name="engineering.engineeringNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engineering Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Electrical Engineering */}
        <h1 className="h4 mb-2">Electrical Engineering</h1>
        <FormField
          control={control}
          name="electricalEngineering.electricalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Engineering Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="resize-none" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Last Modified */}
        <h1 className="h4 mb-2">Last Modified</h1>
        <FieldsRowWrapper>
          <FormField
            control={control}
            name="general.updatedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Modified By</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="general.updatedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date Modified</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
              </FormItem>
            )}
          />
        </FieldsRowWrapper>

        <Button
          type="submit"
          fullWidth
          disabled={!isDirty}
          loading={isSubmitting}
        >
          Save
        </Button>
      </form>
    </Form>
  );
}

function FieldsRowWrapper({ children }: { children: ReactNode }) {
  return <div className="flex space-x-4 [&>*]:w-full">{children}</div>;
}