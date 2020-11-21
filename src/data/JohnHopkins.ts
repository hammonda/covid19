//
// @file JohnHopkins.ts
// @author David Hammond
// @date 21 Nov 2020
//

import axios from 'axios';
import * as _ from 'lodash';
import {parse} from 'papaparse'
import moment from 'moment';

import { DataSource } from './DataSource';
import { DataSourceImpl } from './DataSourceImpl';

export class JohnHopkins extends DataSourceImpl implements DataSource {
  private dates: Array<moment.Moment>;
  static readonly endpoint = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/';

  constructor() {
    super('John Hopkins');
    this.dates = new Array<moment.Moment>();
  }

  public async load(): Promise<void> {
    // Not at all robust method for loading the data. Makes the assumption that
    // both files have the same format, same country order and same date range.
    // TODO improve this
    const cases = await this.loadFile('time_series_covid19_confirmed_global.csv');
    const deaths = await this.loadFile('time_series_covid19_deaths_global.csv');
    this.dates = _.reverse(_.map(_.drop(cases.shift(), 4), d => moment(d, 'M/D/YY')));
    this.dates.pop();
    deaths.shift();
    this.store.clear();
    _.each(cases, (column, i) => {
      const key = this.makeKey(column);
      const cumCases = _.reverse(_.map(_.drop(column, 4), v => Number(v)));
      const cumDeaths = _.reverse(_.map(_.drop(deaths[i], 4), v => Number(v)));
      this.store.set(key, {
        displayName: key,
        dates: this.dates,
        cases: this.difference(cumCases),
        deaths: this.difference(cumDeaths),
        cumCases: cumCases,
        cumDeaths: cumDeaths
      });
    });
  }

  private async loadFile(fileName: string): Promise<Array<Array<string>>> {
    return parse((await axios.get(JohnHopkins.endpoint + fileName)).data).data as Array<Array<string>>;
  }

  private makeKey(column: readonly string[]): string {
    return column[1] + (column[0] ? ': ' + column[0] : '');
  }

  private difference(data: readonly number[]): Array<number> {
    const diff = new Array<number>();
    for (let i = 0; i < data.length - 1; ++i) {
      diff.push(data[i] - data[i + 1]);
    }
    return diff;
  }
}
