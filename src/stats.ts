//
// @file stats.ts
// @author David Hammond
// @date 13 Nov 2020
//

import * as _ from 'lodash';

import { raw_data_t } from './data';

export type stats_t  = {
  rawData: raw_data_t,
  cases: Array<number>,
  active: Array<number>,
  rollingDeaths: Array<number>,
  r: Array<number>
}

function getRolling(data: Array<number>, interval: number,
  scale: number): Array<number> {
  const rolling = Array<number>();
  if (interval <= data.length) {
    let sum = _.reduce(_.take(data, interval), (r, v) => r + v, 0);
    rolling.push(sum/scale);
    for (let t = 1, b = interval; b < data.length; ++t, ++b) {
      sum = sum - data[t - 1] + data[b];
      rolling.push(sum/scale);
    }
  }
  return rolling;
}

export function getStats(raw: raw_data_t, casesAveraging: number,
  deathsAveraging: number, activeWindow: number): stats_t {
  const cases = getRolling(raw.cases, casesAveraging, casesAveraging);
  const active = getRolling(cases, activeWindow, 1.0);
  return {
    rawData: raw,
    cases: cases,
    active: active,
    rollingDeaths: getRolling(raw.deaths, deathsAveraging, deathsAveraging),
    r: _.map(active, (v, i) => activeWindow * cases[i] / v)
  }
}

export function projectLinear(data: Array<number>, steps: number): Array<number> {
  const delta = data[0] - data[1];
  const projection = [ data[0] + delta];
  while (--steps > 0) {
    projection.push(_.last(projection) + delta);
  }
  return projection;
}