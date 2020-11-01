import axios from 'axios';
import * as Plotly from 'plotly.js-dist';
import * as _ from "lodash";

type raw_data_t = {date: Array<string>, cases: Array<number>, deaths: Array<number>};

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
    date: _.map(data, i => i.date),
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
  const colors = _.map(r, v => (v > 1) ? 'red' : 'green');

  Plotly.newPlot('root', [
    {
      x: r,
      y: active, // rolling sum of last 14 days
      z: getRolling(data.deaths, 7, 7), // rolling average of last 7 days
      type: 'scatter3d',
      mode: 'lines',
      line: {
        color: colors,
        width: 1,
        shape: 'spline'
      },
      hovertemplate: 'New deaths: %{z}<br>R: %{x}<br>Active cases: %{y}'
    },
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
    title: 'Covid-19 Trace',
    scene: {
      xaxis: {
        title: 'R',
        type: 'linear',
        range: [ 0, 3 ],
      },
      yaxis: {
        title: 'Active cases',
        type: 'log',
        range: [ 3, 5.69897 ]
      },
      zaxis: {
        title: 'New deaths each day',
        //type: 'log',
        range: [ 0, 1000 ],
      },
      camera: {
        eye: {x: -1.9257754289657114, y: -0.8855855700861778, z: 0.18474927520586074},
        up: {x: 0, y: 0, z: 1},
        center: {x: 0, y: 0, z: 0}
      }
    },
    margin: {
      b: 100,
      l: 0,
      r: 0,
      t: 0
    }
  });
/*
  document.getElementById('root').on('plotly_relayout', event => {
    console.log(event);
  });
*/
});
