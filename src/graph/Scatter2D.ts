//
// @file Scatter2D.ts
// @author David Hammond
// @date 13 Nov 2020
//

import * as _ from 'lodash';

import Graph, {GraphBase } from './Graph';

const Plotly = require('plotly.js-dist');

export default class Scatter2D extends GraphBase implements Graph {
  private hoverTemplate: string;

  constructor(casesAveraging: number, deathsAveraging: number,
    activeWindow: number) {
    super('R₀ vs Active Cases', casesAveraging, deathsAveraging, activeWindow);
    this.hoverTemplate = [
      '<b>%{customdata[0]}</b>',
      'New deaths: %{customdata[1]}',
      'New cases: %{customdata[2]}',
      'Rolling average deaths: %{customdata[3]:.1f}',
      'Active cases: %{customdata[4]}',
      '<b>R: %{y:.3f}</b><extra></extra>'].join('<br>');
  }

  public render(divId: string): void {
    if (!this.stats)
      return;

    const casesRange = this.getLogAxisRange(this.stats.activeMin, this.stats.activeMax, 2);
    const data = [
      {
        y: this.stats.r,
        x: this.stats.active,
        name: 'R₀ vs Active cases',
        customdata: this.customData,
        type: 'scatter',
        mode: 'lines+markers+text',
        line: {
          color: 'grey',
          width: 1
        },
        marker: {
          color: this.colors,
          size: this.markerSize,
          opacity: 0.3
        },
        text: this.dateLabels,
        textposition: 'right',
        hovertemplate: this.hoverTemplate,
        hoverlabel: {
          font: {
            size: 11
          }
        }
      },
      {
        x: [0, Math.pow(10, casesRange[1])],
        y: [1.0, 1.0],
        name: 'R₀ = 1',
        mode: 'lines',
        line: {
          width: 1,
          color: 'green',
          opacity: 0.25,
          dash: 'dot'
        }
      }
    ];
//    this.addRDataPlot(data);
    Plotly.newPlot(divId, data, {
      width: 0.8 * window.innerWidth,
      height: 0.9 * window.innerHeight,
      autosize: true,
      title: this.title,
      margin: {
        r: 0,
        t: 100
      },
      legend: {
        y: 0.95,
        x: 0.8
      },
      showlegend: true,
      xaxis: {
        title: `Active cases (${this.activeWindow} day rolling sum of new cases)`,
        showline: true,
        type: 'log',
        range: casesRange,
      },
      yaxis: {
        showline: true,
        dtick: 0.25,
        title: 'R₀',
        range: this.rRange(casesRange, 0.25),
      },
      clickmode: 'event+select'
    },
    {
      displayModeBar: true
    });
  }

  private addRDataPlot(data: any[]) {
    if (!this.stats || !this.stats.rawData.rData)
      return;

    const active: number[] = [this.stats.active[0]];
    let i = 0;
    for (const d of this.stats.rawData.rData.dates) {
      while (!this.stats.rawData.dates[i].isSame(d) &&
             i < this.stats.rawData.dates.length) {
        ++i;
      }
      active.push(...[this.stats.active[i],this.stats.active[i]]);
    }

    const rMin = this.stats.rawData.rData.rMin;
    const rMax = this.stats.rawData.rData.rMax;
    const r = _.map(rMax, (v, i) => 0.5 * (v + rMin[i]));

    data.push({
      x: active,
      y: _.reduce(r, (prev: number[], curr) => prev.concat([curr, curr]), []),
      name: 'GOV.UK R value',
      type: 'scatter',
      mode: 'lines+markers',
      line: {
        color: 'rgb(91,192,222)',
        width: 1
      },
      marker: {
        opacity: 0.3,
        size: 10
      }
    });
  }
}
