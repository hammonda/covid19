import axios from 'axios';
import * as Plotly from 'plotly.js-dist';
import * as _ from 'lodash';
import moment from 'moment';
import { truncateSync } from 'fs';

type raw_data_t = {date: Array<moment.Moment>, cases: Array<number>, deaths: Array<number>};

// Load data from UK government web API
async function loadData(): Promise<raw_data_t> {
  const response = await axios.get('https://api.coronavirus.data.gov.uk/v1/data', {
    params: {
      filters: 'areaType=overview',
      structure: {
        date: 'date',
        cases: 'newCasesByPublishDate',
        deaths: 'newDeaths28DaysByPublishDate'
      }
    }
  });
  const data = response.data.data;
  return {
    date: _.map(data, i => moment(i.date, 'YYYY-MM-DD')),
    cases: _.map(data, i => i.cases),
    deaths: _.map(data, i => i.deaths)
  };
}

// Get rolling sum of the previous specified interval
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

loadData().then(data => {
  const cases = getRolling(data.cases, 7.0, 7.0);
  const active = getRolling(cases, 14.0, 1.0);
  const r = _.map(active, (v, i) => 14.0 * cases[i] / v);
  const deaths = getRolling(data.deaths, 7, 7);
  const colors = _.map(r, v => (v > 1) ? 'red' : 'green');
  const dateLabels = _.map(data.date, (v, i) => i % 14 == 0 ? v.format('D/M') : '');
  const customdata = _.map(data.date, (v, i) => [
    v.format('Do MMMM YYYY'),
    data.deaths[i],
    data.cases[i].toLocaleString(),
    deaths[i],
    active[i] ? Math.round(active[i]).toLocaleString(): '']);

  const hovertemplate = '<b>%{customdata[0]}</b><br>New deaths: %{customdata[1]}<br>New cases: %{customdata[2]}<br>Rolling average deaths: %{customdata[3]:.1f}<br>Active cases: %{customdata[4]}<br><b>R: %{x:.3f}</b><extra></extra>';

  Plotly.newPlot('root', [
    {
      x: r,
      y: active,
      z: deaths,
      customdata: customdata,
      type: 'scatter3d',
      mode: 'lines+markers+text',
      line: {
        color: colors,
        width: 3,
        shape: 'spline'
      },
      marker: {
        size: 5,
        opacity: 0.25
      },
      text: dateLabels,
      textposition: 'right',
      hovertemplate: hovertemplate,
      hoverlabel: {
        font: {
          size: 11
        },
        bgcolor: 'white'
      }
    },
    {
      x: [r[0]],
      y: [active[0]],
      z: [deaths[0]],
      customdata: customdata,
      type: 'scatter3d',
      mode: 'markers',
      marker: {
        color: r[0] > 1.0 ? 'red': 'green',
        opacity: 0.5
      },
      hovertemplate: hovertemplate,
      hoverlabel: {
        font: {
          size: 11
        }
      }
    },
    {
      x: [r[0]],
      y: [active[0]],
      z: [data.deaths[0]],
      customdata: customdata,
      type: 'scatter3d',
      mode: 'markers+text',
      marker: {
        color: 'blue',
        opacity: 0.5
      },
      text: 'Latest',
      textposition: 'top',
      hovertemplate: hovertemplate,
      hoverlabel: {
        font: {
          size: 11
        }
      }
    }
    /*
    {
      type: 'mesh3d',
      opacity: 0.05,
      color: 'red',
      x: [1,1,1,1],
      y: [1000,1000,1000000,11000000],
      z: [0,1000,1000,0],
      i: [0,0],
      j: [1,2],
      k: [2,3]
    }*/
  ], {
    width: window.innerWidth,
    height: window.innerHeight,
    title: `<b>UK COVID-19 Trace</b><br>${customdata[0][0]}, ${data.deaths[0]} new deaths, ${data.cases[0].toLocaleString()} new cases`,
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
        range: [0.69897, 3.301],
      },
      camera: {
        eye: {x: -1.9257754289657114, y: -0.8855855700861778, z: 0.18474927520586074},
        up: {x: 0, y: 0, z: 1},
        center: {x: 0, y: 0, z: 0}
      }
    },
    margin: {
      b: 150
    },
    showlegend: false
  });

/*
  document.getElementById('root').on('plotly_relayout', event => {
    console.log(event);
  });
*/

/*
  let i = 0;
  function update() {
    console.log(i);
    i = (i + 1) % active.length;
    Plotly.animate('root', {
      data: [,{x: [r[i]], y: [active[i]], z: [deaths[i]]}]
    }, {
      transition: {
        duration: 0,
      },
      frame: {
        duration: 0,
        redraw: true,
      }
    });
    window.requestAnimationFrame(update);
  }
  window.requestAnimationFrame(update);
*/
});
