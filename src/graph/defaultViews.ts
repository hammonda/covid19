//
// @file defaultView.ts
// @author David Hammond
// @date 30 Jan 2020
//

import * as _ from 'lodash';
import data from './defaultViews.json'

export type DefaultView = {
  casesMin?: number,
  casesMax?: number,
  RMin?: number,
  RMax?: number
};

const defaultViews = new Map<string, DefaultView>();
_.each(data, (value: DefaultView, key) => {
  if (value.casesMin) {
    value.casesMin = Math.log10(value.casesMin);
  }
  if (value.casesMax) {
    value.casesMax = Math.log10(value.casesMax);
  }
  defaultViews.set(key, value);
});

export default defaultViews as ReadonlyMap<string, DefaultView>;