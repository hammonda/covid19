//
// @file useHashHistory.ts
// @author David Hammond
// @date 25 Nov 2020
//

import * as _ from 'lodash';
import * as React from "react";

import { createBrowserHistory, Action } from 'history';

const history = createBrowserHistory();

// React hash history hook
const useHashHistory = (): [string, (country: string) => void] => {
  const [hash, setHash] = React.useState<string>(
    decodeURIComponent(history.location.hash.substr(1)));

  React.useEffect(() => {
    const unlisten = history.listen(({ location, action }) => {
      if (action == Action.Pop) {
        setHash(decodeURIComponent(location.hash.substr(1)));
      }
    });
    return () => unlisten();
  }, []);

  return [ hash, (country: string) => {
    if (country != hash) {
      history.push(`/#${country}`);
    }
  }];
};

export default useHashHistory;