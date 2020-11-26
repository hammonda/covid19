//
// @file Loading.tsx
// @author David Hammond
// @date 25 Nov 2020
//

import * as React from "react";

const Loading: React.FC<{height: number}> = (props) => {
  return (
    <div className='container-fluid' style={{height: `${props.height}px`}}>
      <div className="h-100 d-flex align-items-center justify-content-center">
        <div className='spinner-grow text-primary' role="status" />
      </div>
    </div>
  );
};

export default Loading;