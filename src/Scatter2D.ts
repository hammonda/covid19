//
// @file Scatter2D.ts
// @author David Hammond
// @date 13 Nov 2020
//

import { Graph, GraphBase } from './Graph';

import * as Plotly from 'plotly.js-dist';

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
    Plotly.newPlot(divId, [
      {
        y: this.stats.r,
        x: this.stats.active,
        name: `${this.deathsAveraging} day rolling average deaths`,
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
        title: 'Active cases',
        showline: true,
        type: 'log',
        range: [3.30102999566, 5.69897],
      },
      yaxis: {
        showline: true,
        dtick: 0.25,
        title: 'R',
        range: [0, 3.25],
      },
      clickmode: 'event+select'
    },
    {
      displayModeBar: true
    });
  }
}