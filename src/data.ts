//
// @file data.ts
// @author David Hammond
// @date 13 Nov 2020
//

import axios from 'axios';
import * as _ from 'lodash';
import moment from 'moment';

export type raw_data_t = {
  date: Array<moment.Moment>,
  cases: Array<number>,
  deaths: Array<number>,
  cumDeaths: Array<number>
};

export type string_pod_t = {[key: string]: string};

function toFilterString(filters: string_pod_t): string {
  return _.map(filters, (val, key) => `${key}=${val}`).join(';');
}

// Load data from UK government web API
// @see https://coronavirus.data.gov.uk/details/developers-guide
export async function loadData(filters: string_pod_t): Promise<raw_data_t> {
  const endpoint = 'https://api.coronavirus.data.gov.uk/v1/data';
  const { data, status, statusText } = await axios.get(endpoint, {
    params: {
      filters: toFilterString(filters),
      structure: {
        date: 'date',
        cases: 'newCasesByPublishDate',
        deaths: 'newDeaths28DaysByPublishDate',
        cumDeaths: 'cumDeaths28DaysByPublishDate'
      }
    }
  });
  if ( status >= 400 ) {
    throw new Error(statusText);
  }
  _.remove(data.data, i => i.cases == 0);
  return {
    date: _.map(data.data, i => moment(i.date, 'YYYY-MM-DD')),
    cases: _.map(data.data, i => i.cases),
    deaths: _.map(data.data, i => i.deaths),
    cumDeaths: _.map(data.data, i => i.cumDeaths ? i.cumDeaths : 0)
  };
}
