//
// @file population.ts
// @author David Hammond
// @date 30 Jan 2020
//

import * as _ from 'lodash';
import data from './population.json';

const population = new Map<string, number>();
_.each(data, (value, key) => {
  population.set(key, value);
});

export default population as ReadonlyMap<string, number>;