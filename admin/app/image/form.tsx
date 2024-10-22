import { useForm } from "react-hook-form";
import { IFormattedInstanceConfiguration, TInstanceImageConfigurationKeys } from "@plane/types";
import { Button, Spinner } from "@plane/ui";
import { ControllerInput } from "@/components/common";
import { useInstance } from "@/hooks/store";

type IInstanceImageConfigForm = {
  config: IFormattedInstanceConfiguration;
};

type ImageConfigFormValues = Record<TInstanceImageConfigurationKeys, string>;

export const InstanceImageConfigForm = ({ config }: IInstanceImageConfigForm) => {
  const { updateInstanceConfigurations } = useInstance();

  // form data
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ImageConfigFormValues>({
    defaultValues: {
      UNSPLASH_ACCESS_KEY: config["UNSPLASH_ACCESS_KEY"],
    },
  });

  const onSubmit = async () => {};

  return (
    <div className="space-y-8">
      <div className="grid-cols-1 grid items-center justify-between gap-x-16 gap-y-8 lg:grid-cols-2">
        <ControllerInput
          control={control}
          type="password"
          name="UNSPLASH_ACCESS_KEY"
          label="Access key from your Unsplash account"
          description={
            <>
              {" "}
              You will find your access key in your Unsplash developer console.&nbsp;
              <a
                href="https://unsplash.com/documentation#creating-a-developer-account"
                target="_blank"
                className="text-custom-primary-100 hover:underline"
                rel="noreferrer"
              >
                Learn more.
              </a>
            </>
          }
          placeholder="oXgq-sdfadsaeweqasdfasdf3234234rassd"
          error={Boolean(errors.UNSPLASH_ACCESS_KEY)}
          required
        />
      </div>

      <div>
        <Button variant="primary" onClick={handleSubmit(onSubmit)} loading={isSubmitting}>
          {isSubmitting ? (
            <div className="flex justify-center items-center">
              <Spinner className="w-4 h-4" />
              Saving...
            </div>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
};