//
// @file DataSource.ts
// @author David Hammond
// @date 21 Nov 2020
//

import moment from 'moment';

export type CountryData = {
  readonly displayName: string,
  readonly dates: readonly moment.Moment[],
  readonly cases: readonly number[],
  readonly deaths: readonly number[],
  readonly cumCases?: readonly number[],
  readonly cumDeaths: readonly number[],
  readonly rData?: RData
};

export type RData = {
  readonly dates: readonly moment.Moment[],
  readonly rMin: readonly number[],
  readonly rMax: readonly number[]
}

export default interface DataSource {
  readonly source: string;
  getStoreEntries(): IterableIterator<[string, CountryData]>;
  getCountryKeys(): IterableIterator<string>;
  getCountryData(countryKey: string): (CountryData | undefined);
  load(): Promise<void>;
}
