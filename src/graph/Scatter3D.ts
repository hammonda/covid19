//
// @file Scatter3D.ts
// @author David Hammond
// @date 13 Nov 2020
//

import $ from 'jquery';

import { projectLinear } from './stats';
import Graph, { GraphBase } from './Graph';
import ViewPort from '../app/ViewPort';

const Plotly = require('plotly.js-dist');

export default class Scatter3D extends GraphBase implements Graph {
  private hoverTemplate: string;
  private projectTemplate: string;

  private height: number;
  private margin: {r: number, t: number, l?: number, b?: number};
  private legend: {x: number, y: number};
  private aspectRatio: {x: number, y: number, z: number};

  constructor(casesAveraging: number, deathsAveraging: number,
    activeWindow: number, viewPort: ViewPort) {
    super('Deaths vs R₀ and Active Cases', casesAveraging, deathsAveraging, activeWindow, viewPort);
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
    if (viewPort == ViewPort.xSmall) {
      this.height = 0.75;
      this.margin = {l: 0, r: 0, t: 120, b: 0};
      this.legend = {x: 0.25, y: 1.05};
      this.aspectRatio = {x: 0.7, y: 0.7, z: 1.25};
    } else {
      this.height = 0.9;
      this.margin = {r: 0, t: 100};
      this.legend = {x: 0.55, y: 0.9};
      this.aspectRatio = {x: 1.0, y: 1.0, z: 1.0};
    }
  }

  public render(divId: string): void {
    if (!this.stats)
      return;

    const height = this.height * window.innerHeight;

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
          width: 1,
          shape: 'spline'
        },
        marker: {
          size: this.markerSizes,
          opacity: 0.25
        },
        text: this.dateLabels,
        textposition: 'right',
        hovertemplate: this.hoverTemplate,
        hoverlabel: {
          font: {
            size: this.fontSize.hover
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
          size: [this.markerSize.small],
          opacity: 0.5
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
          size: [this.markerSize.small],
          opacity: 0.25
        },
        visible: 'legendonly',
        hovertemplate: this.projectTemplate,
        hoverlabel: {
          font: {
            size: this.fontSize.hover
          }
        }
      }
    ], {
      width: document.getElementById("graph-root")?.offsetWidth,
      height: this.height * window.innerHeight,
      title: this.title,
      titlefont: {
        size: this.fontSize.title
      },
      scene: {
        xaxis: {
          title: {
            text: 'R₀',
            font: {
              size: this.fontSize.axisTitle
            }
          },
          range: [0, 3.5],
        },
        yaxis: {
          title: {
            text: 'Active cases',
            font: {
              size: this.fontSize.axisTitle
            }
          },
          type: 'log',
          range: casesRange
        },
        zaxis: {
          title: {
            text: 'Deaths (daily)',
            font: {
              size: this.fontSize.axisTitle
            }
          },
          type: 'log',
          range: this.deathsRange(casesRange)
        },
        camera: {
          eye: {x: -1.9257754289657114, y: -0.8855855700861778, z: 0.18474927520586074},
          up: {x: 0, y: 0, z: 1},
          center: {x: 0, y: 0, z: 0}
        },
        aspectmode: 'manual',
        aspectratio: this.aspectRatio
      },
      margin: this.margin,
      legend: this.legend,
      font: {
        size: this.fontSize.base
      },
      showlegend: true
    },
    {
      displayModeBar: true,
      modeBarButtonsToRemove: [
        'lasso2d', 'select2d', 'toggleSpikelines', 'hoverClosestCartesian',
        'hoverCompareCartesian'
      ]
    });
    // Plotly js hack to fix bug in legend display
    $(`#${divId} g .legendlines`).addClass('d-none');
  }
}