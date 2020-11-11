//
// @file index.ts
// @author David Hammond
// @date 7 Nov 2020
//

import axios from 'axios';
import * as _ from 'lodash';
import moment from 'moment';
import * as Plotly from 'plotly.js-dist';

type raw_data_t = {date: Array<moment.Moment>, cases: Array<number>, deaths: Array<number>, cumDeaths: Array<number>};
type string_pod_t = {[key: string]: string};


function toFilterString(filters: string_pod_t): string {
  return _.map(filters, (val, key) => `${key}=${val}`).join(';');
}

// Load data from UK government web API
// @see https://coronavirus.data.gov.uk/details/developers-guide
async function loadData(filters: string_pod_t): Promise<raw_data_t> {
  const endpoint = 'https://api.coronavirus.data.gov.uk/v1/data';
  const { data, status, statusText } = await axios.get(endpoint, {
    params: {
      filters: toFilterString(filters),
      structure: {
        date: 'date',
        cases: 'newCasesByPublishDate',
        deaths: 'newDeaths28DaysByPublishDate',
        cumDeaths: 'cumDeaths28DaysByPublishDate'
      }
    }
  });
  if ( status >= 400 ) {
    throw new Error(statusText);
  }
  return {
    date: _.map(data.data, i => moment(i.date, 'YYYY-MM-DD')),
    cases: _.map(data.data, i => i.cases),
    deaths: _.map(data.data, i => i.deaths),
    cumDeaths: _.map(data.data, i => i.cumDeaths ? i.cumDeaths : 0)
  };
}

// Get rolling scaled sum of the previous specified interval
function getRolling(data: Array<number>, interval: number, scale: number): Array<number> {
  const rolling = Array<number>();
  if (interval <= data.length) {
    let sum = _.reduce(_.take(data, interval), (r, v) => r + v, 0);
    rolling.push(sum/scale);
    for (let t = 1, b = interval; b < data.length; ++t, ++b) {
      sum = sum - data[t - 1] + data[b];
      rolling.push(sum/scale);
    }
  }
  return rolling;
}

function getStats(raw: raw_data_t, casesAveraging: number,
  deathsAveraging: number, activeWindow: number) {
  const cases = getRolling(raw.cases, casesAveraging, casesAveraging);
  const active = getRolling(cases, activeWindow, 1.0);
  return {
    rawData: raw,
    cases: cases,
    active: active,
    rollingDeaths: getRolling(raw.deaths, deathsAveraging, deathsAveraging),
    r: _.map(active, (v, i) => activeWindow * cases[i] / v)
  }
}

loadData({areaType: 'overview'}).then(data => {
  const averaging = 7;
  const windowing = 14;
  const stats = getStats(data, averaging, averaging, windowing);

  const colors = _.map(stats.r, v => (v > 1) ? 'red' : 'green');
  const dateLabels = _.map(data.date, (v, i) => i % windowing == 0 ? v.format('D/M') : '');
  const markerSize = _.map(stats.active, (v, i) => i == 0 ? 16 : 10);
  const customData = _.map(data.date, (v, i) => [
    v.format('Do MMMM YYYY'),
    data.deaths[i],
    data.cases[i].toLocaleString(),
    stats.rollingDeaths[i],
    stats.active[i] ? Math.round(stats.active[i]).toLocaleString(): '']);

  const hoverTemplate = [
    '<b>%{customdata[0]}</b>',
    'New deaths: %{customdata[1]}',
    'New cases: %{customdata[2]}',
    'Rolling average deaths: %{customdata[3]:.1f}',
    'Active cases: %{customdata[4]}',
    '<b>R: %{x:.3f}</b><extra></extra>'].join('<br>');

    const title = [
      '<b>UK COVID-19 3D graphical visualization</b>',
      `${customData[0][0]}`,
      `${data.deaths[0]} new deaths, ${data.cases[0].toLocaleString()} new cases, ${data.cumDeaths[0].toLocaleString()} total deaths`
    ].join('<br>');

  Plotly.newPlot('root', [
    {
      x: stats.r,
      y: stats.active,
      z: stats.rollingDeaths,
      name: `${averaging} day rolling average deaths`,
      customdata: customData,
      type: 'scatter3d',
      mode: 'lines+markers+text',
      line: {
        color: colors,
        width: 3,
        shape: 'spline'
      },
      marker: {
        size: markerSize,
        opacity: 0.25
      },
      text: dateLabels,
      textposition: 'right',
      hovertemplate: hoverTemplate,
      hoverlabel: {
        font: {
          size: 11
        }
      }
    },
    {
      x: [stats.r[0]],
      y: [stats.active[0]],
      z: [data.deaths[0]],
      name: 'daily deaths',
      customdata: customData,
      type: 'scatter3d',
      mode: 'markers+text',
      marker: {
        color: 'blue',
        size: [16],
        opacity: 0.5
      },
      text: dateLabels,
      textposition: 'left',
      hovertemplate: hoverTemplate,
      hoverlabel: {
        font: {
          size: 11
        }
      }
    }
  ], {
    width: window.innerWidth,
    height: window.innerHeight,
    title: title,
    scene: {
      xaxis: {
        title: 'R',
        range: [0, 3.25],
      },
      yaxis: {
        title: 'Active cases',
        type: 'log',
        range: [3, 5.69897]
      },
      zaxis: {
        title: 'Deaths',
        type: 'log',
        range: [0.69897, 3.30103],
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
      b: 150
    },
    legend: {
      y: 0.9,
      x: 0.55
    },
    showlegend: true
  });
});
