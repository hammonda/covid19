//
// @file Select.tsx
// @author David Hammond
// @date 22 Nov 2020
//

import * as _ from 'lodash';
import * as React from "react";

interface Props {
  title: string,
  options: string[],
  value: string,
  useStringValue?: boolean,
  onChange: (value: string) => void
}

const Select: React.FC<Props> = (props: Props) => {
  const selectEl = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    // drop focus after an item is selected
    if (selectEl.current)
      selectEl.current.blur();
  });

  return (
    <tr>
      <td className="align-middle">{props.title}</td>
      <td className="pl-3">
        <div className="input-group input-group-sm">
          <select className="custom-select"
                  onChange={e => props.onChange(e.target.value)}
                  ref={selectEl}
                  value={props.value}>
          {_.map(props.options, (val, index) =>
            <option key={index} value={props.useStringValue ? val : index}>{val}</option>
          )}
          </select>
        </div>
      </td>
    </tr>
  );
};

export default Select;