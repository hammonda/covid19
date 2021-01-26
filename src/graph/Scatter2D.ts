//
// @file Scatter2D.ts
// @author David Hammond
// @date 13 Nov 2020
//

import * as _ from 'lodash';

import Graph, {GraphBase } from './Graph';
import ViewPort from '../app/ViewPort';

const Plotly = require('plotly.js-dist');

export default class Scatter2D extends GraphBase implements Graph {
  private hoverTemplate: string;
  private rHoverTemplate: string;

  private height: number;
  private margin: {r: number, t: number, l?: number};
  private legend: {x: number, y: number};

  constructor(casesAveraging: number, deathsAveraging: number,
    activeWindow: number, viewPort: ViewPort) {
    super('R₀ vs Active Cases', casesAveraging, deathsAveraging, activeWindow, viewPort);
    this.hoverTemplate = [
      '<b>%{customdata[0]}</b>',
      'New deaths: %{customdata[1]}',
      'New cases: %{customdata[2]}',
      'Rolling average deaths: %{customdata[3]:.1f}',
      'Active cases: %{customdata[4]}',
      '<b>R: %{y:.3f}</b><extra></extra>'].join('<br>');
    this.rHoverTemplate = [
      '<b>%{customdata[0]}</b>',
      'Min transmission Rate: %{customdata[1]:.2f}',
      'Max transmission Rate: %{customdata[2]:.2f}',
      '<b>Average: %{y:.2f}</b><extra></extra>'].join('<br>');
    if (viewPort == ViewPort.xSmall) {
      this.height = 0.75;
      this.margin = {l: 35, r: 20, t: 120};
      this.legend = {x: 0.6, y: 1.05};
    } else {
      this.height = 0.9;
      this.margin = {r: 0, t: 100};
      this.legend = {x: 0.8, y: 0.95};
    }
  }

  public render(divId: string): void {
    if (!this.stats)
      return;

    const height = this.height * window.innerHeight;

    const casesRange = this.getLogAxisRange(this.stats.activeMin, this.stats.activeMax, 1.5);
    const rRange = this.rRange(casesRange, 0.25);
    if (this.stats.defaultView) {
      casesRange[0] = this.stats.defaultView?.casesMin || casesRange[0];
      casesRange[1] = this.stats.defaultView?.casesMax || casesRange[1];
      if (rRange) {
        rRange[0] = this.stats.defaultView?.RMin || rRange[0];
        rRange[1] = this.stats.defaultView?.RMax || rRange[1];
      }
    }

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
          size: this.markerSizes,
          opacity: 0.3
        },
        text: this.dateLabels,
        textposition: 'left',
        textfont: {
          size: this.fontSize.text
        },
        hovertemplate: this.hoverTemplate,
        hoverlabel: {
          font: {
            size: this.fontSize.hover
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
      width: document.getElementById('graph-root')?.offsetWidth,
      height: height,
      autosize: true,
      title: this.title,
      titlefont: {
        size: this.fontSize.title
      },
      margin: this.margin,
      legend: this.legend,
      font: {
        size: this.fontSize.base
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
        range: rRange,
      },
      clickmode: 'event+select'
    },
    {
      displayModeBar: true,
      modeBarButtonsToRemove: [
        'lasso2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian',
        'hoverCompareCartesian'
      ]
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
        size: this.markerSize.small
      },
      textposition: 'right',
      hovertemplate: this.rHoverTemplate,
      hoverlabel: {
        font: {
          size: this.fontSize.hover
        }
      },
      legendgroup: 'r data',
      showlegend: false
    })
  }
}
