import { useState } from "react";
import { observer } from "mobx-react";
import { FilterHeader, FilterOption } from "@/components/issues";
import { NETWORK_CHOICES } from "@/constants/project";

type Props = {
  appliedFilters: string[] | null;
  handleUpdate: (val: string) => void;
  searchQuery: string;
};

export const FilterAccess: React.FC<Props> = observer((props) => {
  const { appliedFilters, handleUpdate, searchQuery } = props;
  // states
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const appliedFiltersCount = appliedFilters?.length ?? 0;
  const filteredOptions = NETWORK_CHOICES.filter((a) => a.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <FilterHeader
        isPreviewEnabled={previewEnabled}
        handleIsPreviewEnabled={() => setPreviewEnabled(!previewEnabled)}
        title={`Access${appliedFiltersCount > 0 ? `(${appliedFiltersCount})` : ""}`}
      />
      {previewEnabled && (
        <div>
          {filteredOptions.length ? (
            filteredOptions.map((access) => (
              <FilterOption
                key={access.key}
                isChecked={appliedFilters?.includes(`${access.key}`) ? true : false}
                onClick={() => handleUpdate(`${access.key}`)}
                icon={<access.icon className="size-3" />}
                title={access.label}
              />
            ))
          ) : (
            <p className="text-xs italic text-custom-text-400">No matches found</p>
          )}
        </div>
      )}
    </>
  );
});
