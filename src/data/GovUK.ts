//
// @file GovUK.ts
// @author David Hammond
// @date 21 Nov 2020
//

import axios from 'axios';
import * as _ from 'lodash';
import moment from 'moment';

import DataSource, { CountryData } from './DataSource';
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
    const dataSet: any = {};
    const hdataSet: any = {};
    try {
      const data = (await axios.get(GovUK.endpoint, {
        params: {
          filters: _.map(this.options, (val, key) => `${key}=${val}`).join(';'),
          structure: {
            dates: 'date',
            cases: 'newCasesByPublishDate',
            deaths: 'newDeaths28DaysByPublishDate',
            cumDeaths: 'cumDeaths28DaysByPublishDate',
            newAdmissions: 'newAdmissions'
          }
        }
      })).data.data;
      while (data[0].cumDeaths == null)
        data.shift();
      dataSet.displayName = 'United Kingdom';
      dataSet.dates = _.map(data, i => moment(i.dates, 'YYYY-MM-DD'));
      dataSet.cases = _.map(data, 'cases');
      dataSet.deaths = _.map(data, 'deaths');
      dataSet.cumDeaths = _.map(data, 'cumDeaths');
      if (dataSet.cumDeaths[0] == null) {
        dataSet.cumDeaths[0] = dataSet.cumDeaths[1];
      }
      const rData = (await axios.get(GovUK.endpointExp +
        '?areaType=nation&areaCode=E92000001&metric=transmissionRateMin&metric=transmissionRateMax&format=json',
        { timeout: 2000})).data.body;
      dataSet.rData = {
        displayName: 'GOV.UK R value',
        dates: _.map(rData, i => moment(i.date, 'YYYY-MM-DD')),
        rMin: _.map(rData, 'transmissionRateMin'),
        rMax: _.map(rData, 'transmissionRateMax')
      };
      const hdata = _.filter(data, i => i.newAdmissions != null);
      hdataSet.displayName = 'United Kingdom (H)';
      hdataSet.dates = _.map(hdata, i => moment(i.dates, 'YYYY-MM-DD'));
      hdataSet.cases = _.map(hdata, 'newAdmissions');
      hdataSet.deaths = _.map(hdata, 'deaths');
      hdataSet.cumDeaths = _.map(hdata, 'cumDeaths');
      hdataSet.xName = 'admissions';
      hdataSet.xSumName = 'Sum of admissions';
    } catch (err) {
      console.error(err);
    } finally {
      if (!_.isEmpty(dataSet)) {
        this.store.set('United Kingdom', dataSet as CountryData);
      }
      if (!_.isEmpty(hdataSet)) {
        this.store.set('United Kingdom (H)', hdataSet as CountryData);
      }
    }
  }
}
