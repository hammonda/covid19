//
// @file useDataSource.ts
// @author David Hammond
// @date 25 Nov 2020
//

import * as _ from 'lodash';
import * as React from "react";

import DataSource from '../data/DataSource';

// React data source hook
const useDataSource = (dataSource: DataSource, deathMin: number): [boolean, string[]] => {
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [countryList, setCountryList] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!loaded) {
      dataSource.load().then(() => {
        setCountryList(_.reduce([...dataSource.getStoreEntries()], (result, value) => {
          if (value[1].cumDeaths[0] > deathMin) {
            result.push(value[0]);
          }
          return result;
        }, new Array<string>()));
        setLoaded(true);
      });
    }
  }, [loaded]);

  return [loaded, countryList];
};

export default useDataSource;