//
// @file Scatter3D.ts
// @author David Hammond
// @date 13 Nov 2020
//

import $ from 'jquery';

import { projectLinear } from './stats';
import Graph, { GraphBase } from './Graph';

const Plotly = require('plotly.js-dist');

export default class Scatter3D extends GraphBase implements Graph {
  private hoverTemplate: string;
  private projectTemplate: string;

  constructor(casesAveraging: number, deathsAveraging: number,
    activeWindow: number) {
    super('Deaths vs R₀ and Active Cases', casesAveraging, deathsAveraging, activeWindow);
    this.hoverTemplate = [
      '<b>%{customdata[0]}</b>',
      'New deaths: %{customdata[1]}',
      'New cases: %{customdata[2]}',
      'Rolling average deaths: %{customdata[3]:.1f}',
      'Active cases: %{customdata[4]}',
      '<b>R: %{x:.3f}</b><extra></extra>'].join('<br>');
    this.projectTemplate = [
      'Rolling average deaths: %{z:.1f}',
      'Active cases: %{y}',
      '<b>R: %{x:.3f}</b><extra></extra>'
    ].join('<br>');
  }

  public render(divId: string): void {
    if (!this.stats)
      return;

    const casesRange = this.getLogAxisRange(this.stats.activeMin, this.stats.activeMax, 2);
    Plotly.newPlot(divId, [
      {
        x: this.stats.r,
        y: this.stats.active,
        z: this.stats.rollingDeaths,
        name: `${this.deathsAveraging} day rolling average of new deaths`,
        customdata: this.customData,
        type: 'scatter3d',
        mode: 'lines+markers+text',
        line: {
          color: this.colors,
          width: 2,
          shape: 'spline'
        },
        marker: {
          size: this.markerSize,
          opacity: 0.25
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
        x: [this.stats.r[0]],
        y: [this.stats.active[0]],
        z: [this.stats.rawData.deaths[0]],
        name: 'daily deaths',
        customdata: this.customData,
        type: 'scatter3d',
        mode: 'markers+text',
        marker: {
          color: 'blue',
          size: [10],
          opacity: 0.5
        },
        text: this.dateLabels,
        textposition: 'left',
        hovertemplate: this.hoverTemplate,
        hoverlabel: {
          font: {
            size: 11
          }
        },
        visible: 'legendonly',
      },
      {
        x: projectLinear(this.stats.r, 5),
        y: projectLinear(this.stats.active, 5),
        z: projectLinear(this.stats.rollingDeaths, 5),
        type: 'scatter3d',
        mode: 'markers',
        name: 'linear projection',
        marker: {
          color: 'orange',
          size: [10],
          opacity: 0.25
        },
        visible: 'legendonly',
        hovertemplate: this.projectTemplate,
        hoverlabel: {
          font: {
            size: 11
          }
        }
      }
    ], {
      width: document.getElementById("graph-root")?.offsetWidth,
      height: 0.9 * window.innerHeight,
      title: this.title,
      scene: {
        xaxis: {
          title: 'R₀',
          range: [0, 3.5],
        },
        yaxis: {
          title: `Active cases (${this.activeWindow} day rolling sum of new cases)`,
          type: 'log',
          range: casesRange
        },
        zaxis: {
          title: 'Deaths (daily)',
          type: 'log',
          range: this.deathsRange(casesRange)
        },
        camera: {
          eye: {x: -1.9257754289657114, y: -0.8855855700861778, z: 0.18474927520586074},
          up: {x: 0, y: 0, z: 1},
          center: {x: 0, y: 0, z: 0}
        },
        aspectmode: 'manual',
        aspectratio: {x: 1, y: 1, z: 1}
      },
      margin: {
        r: 0,
        t: 100
      },
      legend: {
        y: 0.9,
        x: 0.55
      },
      showlegend: true
    },
    {
      displayModeBar: true,
      modeBarButtonsToRemove: ['lasso2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian', 'hoverCompareCartesian']
    });
    // Plotly js hack to fix bug in legend display
    $(`#${divId} g .legendlines`).addClass('d-none');
  }
}