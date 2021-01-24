//
// @file Graph.ts
// @author David Hammond
// @date 7 Nov 2020
//

import * as _ from 'lodash';

import { CountryData } from '../data/DataSource';
import { stats_t, getStats } from './stats';


export default interface Graph {
  readonly displayName: string;
  setRawData(rawData: CountryData): void;
  calcStats(): void;
  render(divId: string): void;
}

export class GraphBase {
  readonly displayName: string;
  // raw data
  protected rawData: (CountryData | null) = null;

  // statistical data
  protected casesAveraging: number;
  protected deathsAveraging: number;
  protected activeWindow: number;
  protected stats: (stats_t | null) = null;

  // graph data
  protected colors: Array<string> = [];
  protected dateLabels: Array<string> = [];
  protected markerSize: Array<number> = [];
  protected customData: Array<[
    string, // date
    number, // deaths
    string, // cases
    number, // rolling deaths
    string  // active
  ]> = [];
  protected title: string = '';

  constructor(displayName: string, casesAveraging: number, deathsAveraging: number,
    activeWindow: number) {
    this.displayName = displayName;
    this.casesAveraging = casesAveraging;
    this.deathsAveraging = deathsAveraging;
    this.activeWindow = activeWindow;
  }

  public setRawData(rawData: CountryData): void {
    this.rawData = rawData;
  }

  public calcStats(): void {
    if (this.rawData) {
      this.stats = getStats(this.rawData, this.casesAveraging, this.deathsAveraging,
        this.activeWindow);
      this.calcGraphData(this.stats);
    }
  }

  protected calcGraphData(stats: stats_t): void {
    this.setColors(stats);
    this.setDateLabels(stats);
    this.setMarkerSize(stats);
    this.setCustomData(stats);
    this.setTitle();
  }

  protected setColors(stats: stats_t): void {
    this.colors = _.map(stats.r, v => (v > 1) ? 'red' : 'green');
  }

  protected setDateLabels(stats: stats_t): void {
    this.dateLabels = _.map(stats.rawData.dates, (v, i) =>
      i % this.activeWindow == 0 ? v.format('D/M') : '');
  }

  protected setMarkerSize(stats: stats_t): void {
    this.markerSize = _.map(stats.active, (v, i) => i == 0 ? 10 : 5);
  }

  protected setCustomData(stats: stats_t): void {
    this.customData = _.map(stats.rawData.dates, (v, i) => [
      v.format('Do MMMM YYYY'),
      stats.rawData.deaths[i],
      stats.rawData.cases[i].toLocaleString(),
      stats.rollingDeaths[i],
      stats.active[i] ? Math.round(stats.active[i]).toLocaleString(): '']);
  }

  protected setTitle(): void {
    if (this.rawData) {
      this.title = [
        `<b>${this.rawData.displayName} COVID-19 visualization</b>`,
        `${this.customData[0][0]}`,
        `${this.rawData.deaths[0].toLocaleString()} new deaths, ${this.rawData.cases[0].toLocaleString()} new cases, ${this.rawData.cumDeaths[0].toLocaleString()} total deaths`
      ].join('<br>');
    }
  }

  protected getLogAxisRange(minValue: number, maxValue: number,
    decadeLimit: number): [number, number] {
    const range: [number, number] = [this.minLogAxis(minValue), this.maxLogAxis(maxValue)];
    if (range[1] - range[0] > decadeLimit) {
      range[0] = Math.trunc(range[1] - decadeLimit);
    }
    return range;
  }

  protected minLogAxis(minValue: number): number {
    if (minValue > 0) {
      const base = Math.pow(10, Math.trunc(Math.log10(minValue)));
      return Math.log10(base * Math.floor(minValue / base));
    } else {
      return 1.0;
    }
  }

  protected maxLogAxis(maxValue: number): number {
    const base = Math.pow(10, Math.trunc(Math.log10(maxValue)));
    return Math.log10(base * ((maxValue / base) + 0.5));
  }

  protected minMaxInActiveCasesRange(logCasesRange: [number, number],
      prop: ('rollingDeaths' | 'r')): ([number, number] | null) {
    if (!this.stats) {
      return null;
    } else {
      const minCases = Math.pow(10, logCasesRange[0]);
      const maxCases = Math.pow(10, logCasesRange[1]);
      return _.reduce(this.stats.active, (result, val, i) => {
        if (val >= minCases && val <= maxCases) {
          const r = this.stats![prop][i];
          return [Math.min(result[0], r), Math.max(result[1], r)];
        } else {
          return result;
        }
      }, [Number.MAX_VALUE, Number.MIN_VALUE]);
    }
  }

  protected rRange(logCasesRange: [number, number], dtick: number):
    ([number, number] | null) {
    const range = this.minMaxInActiveCasesRange(logCasesRange, 'r');
    if (range) {
      range[0] = Math.trunc(range[0]/dtick)*dtick;
      range[1] = (1 + Math.trunc(range[1]/dtick))*dtick;
      range[1] = Math.min(range[1], 5);
      return range;
    } else {
      return null;
    }
  }

  protected deathsRange(logCasesRange: [number, number]): ([number, number] | null) {
    const range = this.minMaxInActiveCasesRange(logCasesRange, 'rollingDeaths');
    if (range) {
      return [Math.log10(range[0]), this.maxLogAxis(range[1])];
    } else {
      return null;
    }
  }
}
