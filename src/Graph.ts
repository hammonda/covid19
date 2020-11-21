//
// @file Graph.ts
// @author David Hammond
// @date 7 Nov 2020
//

import * as _ from 'lodash';

import { CountryData } from './data/DataSource';
import { stats_t, getStats } from './stats';


export interface Graph {
  setRawData(rawData: CountryData): void;
  calcStats(): void;
  render(divId: string): void;
}

export class GraphBase {
  // raw data
  protected rawData: (CountryData | null) = null;

  // statistical data
  protected casesAveraging: number;
  protected deathsAveraging: number;
  protected activeWindow: number;
  protected stats: (stats_t | null) = null;

  // graph data
  protected colors: Array<string>= [];
  protected dateLabels: Array<string> =[];
  protected markerSize: Array<number> = [];
  protected customData: Array<[
    string, // date
    number, // deaths
    string, // cases
    number, // rolling deaths
    string  // active
  ]> = [];
  protected title: string = '';

  constructor(casesAveraging: number, deathsAveraging: number,
    activeWindow: number) {
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
    this.markerSize = _.map(stats.active, (v, i) => i == 0 ? 20 : 10);
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
        '<b>UK COVID-19 graphical visualization</b>',
        `${this.customData[0][0]}`,
        `${this.rawData.deaths[0]} new deaths, ${this.rawData.cases[0].toLocaleString()} new cases, ${this.rawData.cumDeaths[0].toLocaleString()} total deaths`
      ].join('<br>');
    }
  }
}
