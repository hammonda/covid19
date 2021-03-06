//
// @file stats.ts
// @author David Hammond
// @date 13 Nov 2020
//

import * as _ from 'lodash';

import { CountryData } from '../data/DataSource';
import defaultViews, { DefaultView } from './defaultViews';

export type stats_t = {
  readonly rawData: CountryData,
  readonly cases: readonly number[],
  readonly active: readonly number[],
  readonly rollingDeaths: readonly number[],
  readonly r: readonly number[],
  readonly activeMin: number,
  readonly activeMax: number,
  readonly rollingDeathsMin: number,
  readonly rollingDeathsMax: number,
  readonly defaultView: DefaultView | undefined;
}

function getRolling(data: readonly number[], interval: number,
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

export function getStats(raw: CountryData, casesAveraging: number,
  deathsAveraging: number, activeWindow: number): stats_t {
  const cases = getRolling(raw.cases, casesAveraging, casesAveraging);
  const active = _.map(getRolling(cases, activeWindow, 1.0), i => i < 1 ? 0 : i);
  const rollingDeaths = getRolling(raw.deaths, deathsAveraging, deathsAveraging);
  const r = [];
  for (let i = 0; i < cases.length - activeWindow - 1; ++i) {
    r.push(activeWindow * cases[i] / active[i + 1]);
  }
  return {
    rawData: raw,
    cases: cases,
    active: active,
    rollingDeaths: rollingDeaths,
    r: r,
    activeMin: Math.min(...active),
    activeMax: Math.max(...active),
    rollingDeathsMin: Math.min(...rollingDeaths),
    rollingDeathsMax: Math.max(...rollingDeaths),
    defaultView: defaultViews.get(raw.displayName)
  }
}

export function projectLinear(data: readonly number[], steps: number): Array<number> {
  const delta = data[0] - data[1];
  const projection = [data[0] + delta];
  while (--steps > 0) {
    projection.push(_.last(projection) as number + delta);
  }
  return projection;
}