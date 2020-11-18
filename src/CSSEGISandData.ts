//
// @file CSSEGISandData.ts
// @author David Hammond
// @date 18 Nov 2020
//

import axios from 'axios';
import * as _ from 'lodash';
import { parse } from 'papaparse'
import moment from 'moment';

const endpoint = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/';

type country_data_t = {
  [ key: string]: {
    displayName: string,
    cases: Array<number>,
    deaths: Array<number>
    cumCases: Array<number>,
    cumDeaths: Array<number>,
  }
};

export type data_t = {
  date: Array<moment.Moment>,
  country: country_data_t
}

export async function loadData(): Promise<data_t> {
  const cases = await loadFile('time_series_covid19_confirmed_global.csv');
  const deaths = await loadFile('time_series_covid19_deaths_global.csv');
  const data = {
    date: _.reverse(_.map(_.drop(cases.shift(), 4), d => moment(d, 'M/D/YY'))),
    country: {}
  };
  _.each(cases, column => {
    const key = makeKey(column);
    data.country[key] = {
      displayName: key,
      cumCases: _.reverse(_.map(_.drop(column, 4), v => Number(v)))
    }
  });
  deaths.shift();
  _.each(deaths, column => {
    const key = makeKey(column);
    data.country[key].cumDeaths = _.reverse(_.map(_.drop(column, 4), v => Number(v)))
  });
  _.each(data.country as country_data_t, country => {
    country.cases = difference(country.cumCases);
    country.deaths = difference(country.cumDeaths);
  });
  return data;
}

async function loadFile(fileName: string): Promise<Array<Array<string>>> {
  return parse((await axios.get(endpoint + fileName)).data).data as Array<Array<string>>;
}

function makeKey(column: Array<string>): string {
  return column[1] + (column[0] ? ': ' + column[0] : '');
}

function difference(data: Array<number>): Array<number> {
  const diff = new Array<number>();
  for (let i = 0; i < data.length - 1; ++i) {
    diff.push(data[i] - data[i + 1]);
  }
  return diff;
}
