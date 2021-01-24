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
  private rHoverTemplate: string;

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
    this.rHoverTemplate = [
      '<b>%{customdata[0]}</b>',
      'Min transmssion Rate: %{customdata[1]:.2f}',
      'Max transmssion Rate: %{customdata[2]:.2f}',
      '<b>Average: %{y:.2f}</b><extra></extra>'].join('<br>');
  }

  public render(divId: string): void {
    if (!this.stats)
      return;

    const casesRange = this.getLogAxisRange(this.stats.activeMin, this.stats.activeMax, 1.5);
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
    this.addRDataPlot(data);
    Plotly.newPlot(divId, data, {
      width: document.getElementById("graph-root")?.offsetWidth,
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
        title: 'R',
        range: this.rRange(casesRange, 0.25),
      },
      clickmode: 'event+select'
    },
    {
      displayModeBar: true,
      modeBarButtonsToRemove: ['lasso2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian']
    });
  }

  private addRDataPlot(data: any[]) {
    if (!this.stats || !this.stats.rawData.rData)
      return;

    const active: number[] = [this.stats.active[0]];
    const activePoints: number[] = [];
    let i = 0;
    for (const d of this.stats.rawData.rData.dates) {
      while (!this.stats.rawData.dates[i].isSame(d) &&
             i < this.stats.rawData.dates.length) {
        ++i;
      }
      active.push(...[this.stats.active[i],this.stats.active[i]]);
      activePoints.push(this.stats.active[i]);
    }

    const rMin = this.stats.rawData.rData.rMin;
    const rMax = this.stats.rawData.rData.rMax;
    const rAverage = _.map(rMax, (v, i) => 0.5 * (v + rMin[i]));

    data.push({
      x: active,
      y: _.reduce(rAverage, (prev: number[], curr) => prev.concat([curr, curr]), []),
      name: this.stats.rawData.rData.displayName,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: 'royalblue',
        width: 1
      },
      legendgroup: 'r data',
      hoverinfo:'skip'
    });
    data.push({
      x: activePoints,
      y: rAverage,
      customdata: _.map(rMin, (v, i) => 
        [this.stats?.rawData.rData?.dates[i].format('Do MMMM YYYY'), rMin[i], rMax[i]]),
      type: 'scatter',
      name: this.stats.rawData.rData.displayName,
      mode: 'markers',
      marker: {
        color: 'royalblue',
        opacity: 0.3,
        size: 10
      },
      textposition: 'right',
      hovertemplate: this.rHoverTemplate,
      hoverlabel: {
        font: {
          size: 11
        }
      },
      legendgroup: 'r data',
      showlegend: false
    })
  }
}