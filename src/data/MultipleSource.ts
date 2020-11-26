//
// @file MultipleSource.ts
// @author David Hammond
// @date 21 Nov 2020
//

import DataSource from './DataSource';
import DataSourceImpl from './DataSourceImpl';

export default class MultipleSource extends DataSourceImpl implements DataSource {
  private sources: Array<DataSource>;

  constructor(...sources: DataSource[]) {
    super('Multiple Sources');
    this.sources = sources;
  }

  public async load() : Promise<void> {
    this.store.clear();
    for (const source of this.sources) {
      await source.load();
      for (const [key, value] of source.getStoreEntries()) {
        if (value.cases.length) {
          this.store.set(key, value);
        }
      };
    }
  }
}
