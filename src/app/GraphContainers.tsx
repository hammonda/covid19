//
// @file GraphContainers.tsx
// @author David Hammond
// @date 25 Nov 2020
//

import * as _ from 'lodash';
import * as React from "react";

const GraphContainers: React.FC<{size: number}> = (props) => {
  return (
    <div id="graph-root" className='col-lg-10'>
    {_.map(_.range(props.size), i =>
      <div key={i} id={`graph-${i}`} className='d-none'/> )}
    </div>
  );
};

export default GraphContainers;