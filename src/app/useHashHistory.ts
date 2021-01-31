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
const useHashHistory = (...values: string[]):
  [string[], (...values: string[]) => void] => {

  const hashToState = (hash: string): string[] => {
    if (location.hash) {
      const state = decodeURIComponent(location.hash.substr(1)).split('&&');
      for (let i = state.length; i < values.length; ++i) {
        state.push(values[i]);
      }
      return state;
    } else {
      return values;
    }
  }

  const [hash, setHash] = React.useState<string[]>(hashToState(history.location.hash));

  React.useEffect(() => {
    const unlisten = history.listen(({ location, action }) => {
      if (action == Action.Pop) {
        setHash(hashToState(history.location.hash));
      }
    });
    return () => unlisten();
  }, []);

  return [ hash, (...values: string[]) => {
    const newHash = values.join('&&');
    if (newHash != hash.join('&&')) {
      history.push(`/#${newHash}`);
      setHash(values);
    }
  }];
};

export default useHashHistory;