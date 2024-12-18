import { ChangeEvent } from "react";
import { Controller, useFormContext, UseFormSetValue } from "react-hook-form";
import { Info } from "lucide-react";
import { Input, TextArea, Tooltip } from "@plane/ui";
import { ETabIndices } from "@/constants/tab-indices";
import { cn } from "@/helpers/common.helper";
import { projectIdentifierSanitizer } from "@/helpers/project.helper";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { TProject } from "@/plane-web/types/projects";

type Props = {
  setValue: UseFormSetValue<TProject>;
  isMobile: boolean;
  isChangeInIdentifierRequired: boolean;
  setIsChangeInIdentifierRequired: (value: boolean) => void;
};

const ProjectCommonAttributes = ({
  setValue,
  isMobile,
  isChangeInIdentifierRequired,
  setIsChangeInIdentifierRequired,
}: Props) => {
  const {
    formState: { errors },
    control,
  } = useFormContext<TProject>();

  const { getIndex } = getTabIndex(ETabIndices.PROJECT_CREATE, isMobile);
  const handleNameChange = (onChange: (...event: any[]) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    if (!isChangeInIdentifierRequired) {
      onChange(e);
      return;
    }
    if (e.target.value === "") setValue("identifier", "");
    else setValue("identifier", projectIdentifierSanitizer(e.target.value).substring(0, 5));
    onChange(e);
  };

  const handleIdentifierChange = (onChange: any) => (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const alphanumericValue = projectIdentifierSanitizer(value);
    setIsChangeInIdentifierRequired(false);
    onChange(alphanumericValue);
  };

  return (
    <div className="grid grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-4">
      <div className="md:col-span-3">
        <Controller
          control={control}
          name="name"
          rules={{
            required: "Name is required",
            maxLength: { value: 255, message: "Title should be less than 255 characters" },
          }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="name"
              name="name"
              type="text"
              value={value}
              onChange={handleNameChange(onChange)}
              hasError={Boolean(errors.name)}
              placeholder="Project name"
              className="w-full focus:border-blue-400"
              tabIndex={getIndex("name")}
            />
          )}
        />
        <span className="text-xs text-red-500">{errors?.name?.message}</span>
      </div>
      <div className="relative">
        <Controller
          control={control}
          name="identifier"
          rules={{
            required: "Project ID is required",
            validate: (v) =>
              /^[ÇŞĞIİÖÜA-Z0-9]+$/.test(v.toUpperCase()) || "Only Alphanumeric & Non-latin characters are allowed.",
            minLength: { value: 1, message: "Project ID must at least be of 1 character" },
            maxLength: { value: 5, message: "Project ID must at most be of 5 characters" },
          }}
          render={({ field: { value, onChange } }) => (
            <Input
              id="identifier"
              name="identifier"
              type="text"
              value={value}
              onChange={handleIdentifierChange(onChange)}
              hasError={Boolean(errors.identifier)}
              placeholder="Project ID"
              className={cn("w-full text-xs focus:border-blue-400 pr-7", {
                uppercase: value,
              })}
              tabIndex={getIndex("identifier")}
            />
          )}
        />
        <Tooltip
          isMobile={isMobile}
          tooltipContent="Helps you identify issues in the project uniquely. Max 5 characters."
          className="text-sm"
          position="right-top"
        >
          <Info className="absolute right-2 top-2.5 h-3 w-3 text-custom-text-400" />
        </Tooltip>
        <span className="text-xs text-red-500">{errors?.identifier?.message}</span>
      </div>

      <div className="md:col-span-4">
        <Controller
          name="description"
          control={control}
          render={({ field: { value, onChange } }) => (
            <TextArea
              id="description"
              name="description"
              value={value}
              placeholder="Description..."
              onChange={onChange}
              className="!h-24 text-sm focus:border-blue-400"
              tabIndex={getIndex("description")}
              hasError={Boolean(errors?.description)}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ProjectCommonAttributes;