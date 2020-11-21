//
// @file MultipleSource.ts
// @author David Hammond
// @date 21 Nov 2020
//

import * as _ from 'lodash';

import {DataSource} from './DataSource';
import {DataSourceImpl} from './DataSourceImpl';

export class MultipleSource extends DataSourceImpl implements DataSource {
  private sources: Array<DataSource>;

  constructor(...sources: DataSource[]) {
    super('Multiple Sources');
    this.sources = sources;
  }

  public async load() : Promise<void> {
    for (const source of this.sources) {
      await source.load();
      for (const [key, value] of source.getStoreEntries()) {
        this.store.set(key, value);
      };
    }
  }
}
