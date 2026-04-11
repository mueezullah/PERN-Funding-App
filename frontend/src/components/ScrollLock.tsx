import { useEffect } from "react";

const ScrollLock = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return null;
};

export default ScrollLock;