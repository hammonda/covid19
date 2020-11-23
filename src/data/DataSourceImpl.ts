//
// @file DataSourceImpl.ts
// @author David Hammond
// @date 21 Nov 2020
//

import { CountryData } from './DataSource';

export default class DataSourceImpl {
  readonly source: string;
  protected store: Map<string, CountryData>;

  constructor(source: string) {
    this.source = source;
    this.store = new Map<string, CountryData>();
  }

  public getStoreEntries(): IterableIterator<[string, CountryData]> {
    return this.store.entries();
  }

  public getCountryKeys(): IterableIterator<string> {
    return this.store.keys();
  }

  public getCountryData(countryKey: string): (CountryData | undefined) {
    return this.store.get(countryKey);
  }
}
