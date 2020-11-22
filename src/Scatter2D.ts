//
// @file Scatter2D.ts
// @author David Hammond
// @date 13 Nov 2020
//

import { Graph, GraphBase } from './Graph';

const Plotly = require('plotly.js-dist');

export class Scatter2D extends GraphBase implements Graph {
  private hoverTemplate: string;

  constructor(casesAveraging: number, deathsAveraging: number,
    activeWindow: number) {
    super(casesAveraging, deathsAveraging, activeWindow);
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
    Plotly.newPlot(divId, [
      {
        y: this.stats.r,
        x: this.stats.active,
        name: 'R vs Active cases',
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
        name: 'R = 1',
        mode: 'lines',
        line: {
          width: 1,
          color: 'green',
          opacity: 0.25,
          dash: 'dot'
        }
      }
    ], {
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
        title: 'R',
        range: [0, 3.5],
      },
      clickmode: 'event+select'
    },
    {
      displayModeBar: true
    });
  }
}