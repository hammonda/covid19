//
// @file GovUK.ts
// @author David Hammond
// @date 21 Nov 2020
//

import axios from 'axios';
import * as _ from 'lodash';
import moment from 'moment';

import DataSource, { RData } from './DataSource';
import DataSourceImpl from './DataSourceImpl';

type options_t = {[key: string]: string};

export default class GovUK extends DataSourceImpl implements DataSource {
  private options: options_t;
  private rData: RData | null;
  static readonly endpoint = 'https://api.coronavirus.data.gov.uk/v1/data';
  static readonly endpointExp = 'https://api.coronavirus.data.gov.uk/v2/data';

  constructor(options?: options_t) {
    super('GOV.UK');
    this.options = options || {areaType: 'overview'};
    this.rData = null;
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
    await this.loadR();
    _.remove(data as [{cases: number}], i => i.cases == 0);
    this.store.clear();
    this.store.set('United Kingdom', {
      displayName: 'United Kingdom',
      dates: _.map(data, i => moment(i.dates, 'YYYY-MM-DD')),
      cases: _.map(data, 'cases'),
      deaths: _.map(data, 'deaths'),
      cumDeaths: _.map(data, 'cumDeaths')
    });
  }

  public getRData(countryKey: string): (RData | undefined) {
    return (countryKey == 'United Kingdom' && this.rData) ? this.rData : undefined;
  }

  // https://coronavirus.data.gov.uk/details/download
  private async loadR(): Promise<void> {
    const data = (await axios.get(GovUK.endpointExp +
      '?areaType=overview&metric=transmissionRateMin&metric=transmissionRateMax&format=json')).data.body;
    this.rData = {
      dates: _.map(data, i => moment(i.dates, 'YYYY-MM-DD')),
      rMin: _.map(data, 'transmissionRateMin'),
      rMax: _.map(data, 'transmissionRateMax')
    }
  }
}
