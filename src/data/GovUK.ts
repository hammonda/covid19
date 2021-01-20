//
// @file GovUK.ts
// @author David Hammond
// @date 21 Nov 2020
//

import axios from 'axios';
import * as _ from 'lodash';
import moment from 'moment';

import DataSource from './DataSource';
import DataSourceImpl from './DataSourceImpl';

type options_t = {[key: string]: string};

export default class GovUK extends DataSourceImpl implements DataSource {
  private options: options_t;
  static readonly endpoint = 'https://api.coronavirus.data.gov.uk/v1/data';
  static readonly endpointExp = 'https://api.coronavirus.data.gov.uk/v2/data';

  constructor(options?: options_t) {
    super('GOV.UK');
    this.options = options || {areaType: 'overview'};
  }

  public async load(): Promise<void> {
    const data = (await axios.get(GovUK.endpoint, {
      params: {
        filters: _.map(this.options, (val, key) => `${key}=${val}`).join(';'),
        structure: {
          dates: 'date',
          cases: 'newCasesByPublishDate',
          deaths: 'newDeaths28DaysByPublishDate',
          cumDeaths: 'cumDeaths28DaysByPublishDate'
        }
      }
    })).data.data;
    const rData = (await axios.get(GovUK.endpointExp +
      '?areaType=overview&metric=transmissionRateMin&metric=transmissionRateMax&format=json')).data.body;

    _.remove(data as [{cases: number}], i => i.cases == 0);
    this.store.clear();
    this.store.set('United Kingdom', {
      displayName: 'United Kingdom',
      dates: _.map(data, i => moment(i.dates, 'YYYY-MM-DD')),
      cases: _.map(data, 'cases'),
      deaths: _.map(data, 'deaths'),
      cumDeaths: _.map(data, 'cumDeaths'),
      rData: {
        dates: _.map(rData, i => moment(i.date, 'YYYY-MM-DD')),
        rMin: _.map(rData, 'transmissionRateMin'),
        rMax: _.map(rData, 'transmissionRateMax')
      }
    });
  }
}
