//
// @file Graph.ts
// @author David Hammond
// @date 7 Nov 2020
//

import * as _ from 'lodash';

import { raw_data_t } from './data';
import { stats_t, getStats } from './stats';


export interface Graph {
  setRawData(rawData: raw_data_t): void;
  calcStats(): void;
  render(divId: string): void;
}

export class GraphBase {
  // raw data
  protected rawData: raw_data_t;

  // statistical data
  protected casesAveraging: number;
  protected deathsAveraging: number;
  protected activeWindow: number;
  protected stats: stats_t;

  // graph data
  protected colors: Array<string>;
  protected dateLabels: Array<string>;
  protected markerSize: Array<number>;
  protected customData: Array<[
    string, // date
    number, // deaths
    string, // cases
    number, // rolling deaths
    string  // active
  ]>;
  protected title: string;

  constructor(casesAveraging: number, deathsAveraging: number,
    activeWindow: number) {
    this.casesAveraging = casesAveraging;
    this.deathsAveraging = deathsAveraging;
    this.activeWindow = activeWindow;
  }

  public setRawData(rawData: raw_data_t): void {
    this.rawData = rawData;
  }

  public calcStats(): void {
    this.stats = getStats(this.rawData, this.casesAveraging, this.deathsAveraging,
      this.activeWindow);
    this.calcGraphData();
  }

  protected calcGraphData(): void {
    this.setColors();
    this.setDateLabels();
    this.setMarkerSize();
    this.setCustomData();
    this.setTitle();
  }

  protected setColors(): void {
    this.colors = _.map(this.stats.r, v => (v > 1) ? 'red' : 'green');
  }

  protected setDateLabels(): void {
    this.dateLabels = _.map(this.stats.rawData.date, (v, i) =>
      i % this.activeWindow == 0 ? v.format('D/M') : '');
  }

  protected setMarkerSize(): void {
    this.markerSize = _.map(this.stats.active, (v, i) => i == 0 ? 20 : 10);
  }

  protected setCustomData(): void {
    this.customData = _.map(this.stats.rawData.date, (v, i) => [
      v.format('Do MMMM YYYY'),
      this.stats.rawData.deaths[i],
      this.stats.rawData.cases[i].toLocaleString(),
      this.stats.rollingDeaths[i],
      this.stats.active[i] ? Math.round(this.stats.active[i]).toLocaleString(): '']);
  }

  protected setTitle(): void {
    this.title = [
      '<b>UK COVID-19 graphical visualization</b>',
      `${this.customData[0][0]}`,
      `${this.rawData.deaths[0]} new deaths, ${this.rawData.cases[0].toLocaleString()} new cases, ${this.rawData.cumDeaths[0].toLocaleString()} total deaths`
    ].join('<br>');
  }
}
