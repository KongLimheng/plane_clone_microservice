import { Info, X } from "lucide-react";
import { TAuthErrorInfo } from "@/helpers/authentication.helper";

type TAuthBanner = {
  bannerData?: TAuthErrorInfo;
  handleBannerData?: (bannerData?: TAuthErrorInfo) => void;
};

export const AuthBanner = ({ bannerData, handleBannerData }: TAuthBanner) => {
  if (!bannerData) return <></>;
  return (
    <div className="relative flex items-center p-2 rounded-md gap-2 border border-custom-primary-100/50 bg-custom-primary-100/10">
      <div className="w-4 h-4 shrink-0 relative flex justify-center items-center">
        <Info className="text-custom-primary-100" size={16} />
      </div>
      <div className=" w-full text-sm font-medium text-custom-primary-100">{bannerData?.message}</div>
      <div
        onClick={() => handleBannerData && handleBannerData(undefined)}
        className="relative ml-auto w-6 h-6 flex justify-center items-center rounded-sm transition-all cursor-pointer hover:bg-custom-primary-100/20 text-custom-primary-100/80"
      >
        <X className="w-4 h-4 shrink-0" />
      </div>
    </div>
  );
};
