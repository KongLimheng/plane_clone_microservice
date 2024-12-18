import React, { useEffect, useState } from "react";
import { adjustColorForContrast, DEFAULT_COLORS, TIconsListProps } from "./emoji-icon-helper";
import { InfoIcon, Search } from "lucide-react";
import { Input } from "../form-fields";
import { cn } from "../../helpers";
import { MATERIAL_ICONS_LIST } from "./icons";
import useFontFaceObserver from "use-font-face-observer";

export const IconsList: React.FC<TIconsListProps> = (props) => {
  const { defaultColor, onChange } = props;
  // states
  const [activeColor, setActiveColor] = useState(defaultColor);
  const [showHexInput, setShowHexInput] = useState(false);
  const [hexValue, setHexValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (DEFAULT_COLORS.includes(defaultColor.toLowerCase())) setShowHexInput(false);
    setHexValue(defaultColor.slice(1, 7));
    setShowHexInput(true);
  }, [defaultColor]);

  const filteredArray = MATERIAL_ICONS_LIST.filter((icon) => icon.name.toLowerCase().includes(query.toLowerCase()));
  const isMaterialSymbolsFontLoaded = useFontFaceObserver([
    {
      family: `Material Symbols Rounded`,
      style: `normal`,
      weight: `normal`,
      stretch: `condensed`,
    },
  ]);

  return (
    <>
      <div className="flex flex-col sticky top-0 bg-custom-background-100">
        <div className="flex items-center px-2 py-[15px] w-full">
          <div
            className={cn(
              "relative flex items-center gap-2 bg-custom-background-90  h-10 rounded-lg w-full px-[30px] border",
              isInputFocused ? "border-custom-primary-100" : "border-transparent"
            )}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          >
            <Search className="absolute size-3.5 text-custom-text-400 left-2.5" />
            <Input
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="text-[1rem] border-none p-0 size-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-9 gap-2 items-center justify-items-center px-2.5 py-1 h-9">
          {showHexInput ? (
            <div className="col-span-8 flex items-center gap-1 justify-self-stretch ml-2">
              <span
                className={cn("size-4 flex-shrink-0 rounded-full mr-1")}
                style={{
                  backgroundColor: `#${hexValue}`,
                }}
              />

              <span className="text-xs text-custom-text-300 flex-shrink-0">HEX</span>
              <span className="text-xs text-custom-text-200 flex-shrink-0 -mr-1">#</span>

              <Input
                type="text"
                value={hexValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setHexValue(value);
                  if (/^[0-9A-Fa-f]{6}$/.test(value)) setActiveColor(adjustColorForContrast(`#${value}`));
                }}
                autoFocus
                mode="true-transparent"
                className="flex-grow pl-0 text-xs text-custom-text-200"
              />
            </div>
          ) : (
            DEFAULT_COLORS.map((curCol) => (
              <button
                type="button"
                key={curCol}
                className="grid place-items-center size-5"
                onClick={() => {
                  setActiveColor(curCol);
                  setHexValue(curCol.slice(1, 7));
                }}
              >
                <span className="h-4 w-4 cursor-pointer rounded-full" style={{ backgroundColor: curCol }} />
              </button>
            ))
          )}

          <button
            type="button"
            className={cn("grid place-items-center size-4 rounded-full border border-transparent", {
              "border-custom-border-400": !showHexInput,
            })}
            onClick={() => {
              setShowHexInput((prev) => !prev);
              setHexValue(activeColor.slice(1, 7));
            }}
          >
            {showHexInput ? (
              <span className="conical-gradient h-4 w-4 rounded-full" />
            ) : (
              <span className="text-custom-text-300 text-[0.6rem] grid place-items-center">#</span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2 w-full pl-4 pr-3 py-1 h-6">
          <InfoIcon className="h-3 w-3" />
          <p className="text-xs"> Colors will be adjusted to ensure sufficient contrast.</p>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-1 px-2.5 justify-items-center mt-2">
        {filteredArray.map((icon) => (
          <button
            key={icon.name}
            type="button"
            className="h-9 w-9 select-none text-lg grid place-items-center rounded hover:bg-custom-background-80"
            onClick={() => {
              onChange({
                name: icon.name,
                color: activeColor,
              });
            }}
          >
            {isMaterialSymbolsFontLoaded ? (
              <span
                style={{ color: activeColor }}
                className="material-symbols-rounded !text-[1.25rem] !leading-[1.25rem]"
              >
                {icon.name}
              </span>
            ) : (
              <span className="size-5 rounded animate-pulse bg-custom-background-80" />
            )}
          </button>
        ))}
      </div>
    </>
  );
};
