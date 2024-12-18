// constants
import { MAX_STATIC_FILE_SIZE } from "@/constants/common";
import { useInstance } from "@/hooks/store/use-instance";
// hooks

type TReturnProps = {
  maxFileSize: number;
};

export const useFileSize = (): TReturnProps => {
  // store hooks
  const { config } = useInstance();

  return {
    maxFileSize: config?.file_size_limit ?? MAX_STATIC_FILE_SIZE,
  };
};
