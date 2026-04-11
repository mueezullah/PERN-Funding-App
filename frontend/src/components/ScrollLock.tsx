import { useEffect, type FC } from "react";

const ScrollLock: FC = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return null;
};

export default ScrollLock;