import { useEffect, useState } from "react";

const useSize = () => {
  const [windowSize, setWindowSize] = useState({ windowWidth: window.innerWidth, windowHeight: window.innerHeight });

  useEffect(() => {
    const windowSizeHandler = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      setWindowSize({ windowWidth, windowHeight });
    };
    window.addEventListener("resize", windowSizeHandler);
    return () => {
      window.removeEventListener("resize", windowSizeHandler);
    };
  }, []);

  return windowSize;
};

export default useSize;
