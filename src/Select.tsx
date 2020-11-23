//
// @file Select.tsx
// @author David Hammond
// @date 22 Nov 2020
//

import * as _ from 'lodash';
import * as React from "react";


interface Props {
  dataLoaded: boolean,
  title: string,
  values: string[],
  initialValue: number,
  onChange: (event: any) => void
}

const Select: React.FC<Props> = (props: Props) => {
  const [value, setValue] = React.useState<number>(props.initialValue);
  const ref = React.createRef<HTMLSelectElement>();
  const onChange = (event: any) => {
    setValue(event.target.value);
    ref.current!.blur();
    props.onChange(event);
  };
  return (
    <tr>
      <td className="align-middle">{props.title}</td>
      <td className="pl-3">
        <div className="input-group input-group-sm">
          <select ref={ref}
                  className="custom-select"
                  disabled={!props.dataLoaded}
                  onChange={onChange}
                  value={value}>
          {_.map(props.values, (val, index) =>
            <option key={index} value={index}>{val}</option>
          )}
          </select>
        </div>
      </td>
    </tr>
  )
}

export default Select;
