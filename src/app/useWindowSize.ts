//
// @file useWindowSize.ts
// @author David Hammond
// @date 25 Nov 2020
//

import * as React from "react";

// React window size hook
const useWindowSize = () => {
  const [windowSize, setWindowSize] = React.useState<{width: number, height: number}>({
    width: window.innerWidth,
    height: window.innerHeight
  });

  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;