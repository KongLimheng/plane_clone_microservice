import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { X } from "lucide-react";
import { CustomEmojiIconPicker, EmojiIconPickerTypes, Logo } from "@plane/ui";
import { ImagePickerPopover } from "@/components/core";
import { ETabIndices } from "@/constants/tab-indices";
import { convertHexEmojiToDecimal } from "@/helpers/emoji.helper";
import { getFileURL } from "@/helpers/file.helper";
import { getTabIndex } from "@/helpers/tab-indices.helper";
import { TProject } from "@/plane-web/types/projects";

type Props = {
  handleClose: () => void;
  isMobile?: boolean;
};
const ProjectCreateHeader = ({ handleClose, isMobile }: Props) => {
  const { watch, control } = useFormContext<TProject>();
  // derived values
  const coverImage = watch("cover_image_url");

  const [isOpen, setIsOpen] = useState(false);
  const { getIndex } = getTabIndex(ETabIndices.PROJECT_CREATE, isMobile);

  return (
    <div className="relative group h-44 w-full rounded-lg bg-custom-background-80">
      {coverImage && (
        <img
          src={getFileURL(coverImage)}
          alt="Project cover image"
          className="absolute left-0 top-0 size-full rounded-lg object-cover"
        />
      )}

      <div className="absolute right-2 top-2 p-2">
        <button type="button" onClick={handleClose}>
          <X className="size-5 text-white" />
        </button>
      </div>

      <div className="absolute bottom-2 right-2">
        <Controller
          control={control}
          name="cover_image_url"
          render={({ field: { value, onChange } }) => (
            <ImagePickerPopover
              label="Change Cover"
              onChange={onChange}
              control={control}
              value={value}
              tabIndex={getIndex("cover_image")}
            />
          )}
        />
      </div>
      <div className="absolute -bottom-[22px] left-3">
        <Controller
          control={control}
          name="logo_props"
          render={({ field: { value, onChange } }) => (
            <CustomEmojiIconPicker
              label={
                <span className="grid size-11 place-items-center rounded-md bg-custom-background-80">
                  <Logo logo={value} size={20} />
                </span>
              }
              isOpen={isOpen}
              handleToggle={(val) => setIsOpen(val)}
              className="flex items-center justify-center"
              buttonClassName="flex items-center justify-center"
              onChange={(val) => {
                let logoValue = {};
                if (val.type === EmojiIconPickerTypes.EMOJI) {
                  logoValue = { value: convertHexEmojiToDecimal(val.value.unified), url: val.value.imageUrl };
                } else if (val.type === EmojiIconPickerTypes.ICON) logoValue = val.value;

                onChange({ in_use: val.type, [val.type]: logoValue });
                setIsOpen(false);
              }}
              defaultIconColor={value.in_use && value.in_use === "icon" ? value.icon?.color : undefined}
              defaultOpen={
                value.in_use && value.in_use === "emoji" ? EmojiIconPickerTypes.EMOJI : EmojiIconPickerTypes.ICON
              }
            />
          )}
        />
      </div>
    </div>
  );
};

export default ProjectCreateHeader;
