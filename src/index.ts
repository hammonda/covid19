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
  Plotly.newPlot('root', [
    {
      x: data.cases,
      y: getRolling(data.cases, 14, 1), // rolling sum of last 14 days
      z: getRolling(data.deaths, 7, 7), // rolling average of last 7 days
      type: 'scatter3d',
      mode: 'lines',
      line: {
        color: 'black',
        width: 1,
        shape: 'spline'
      },
      hovertemplate: 'New deaths: %{z}<br>New cases: %{x}<br>Active cases: %{y}'
    },
  ], {
    width: window.innerWidth,
    height: window.innerHeight,
    title: 'Covid-19 Trace',
    scene: {
      xaxis: {
        title: 'New cases each day',
        type: 'log',
        range: [ 2, 5 ],
      },
      yaxis: {
        title: 'Active cases',
        type: 'log',
        range: [ 3, 5.69897 ]
      },
      zaxis: {
        title: 'New deaths each day',
        type: 'log',
        range: [ 0, 3 ],
      },
      camera: {
        eye: {x: 1.99827922632198, y: -0.4889930973010233, z: 0.5429281572031415},
        up: { x: 0, y: 0, z: 1},
        center: { x: 0, y: 0, z: 0}
      }
    },
    margin: {
      b: 100,
      l: 0,
      r: 0,
      t: 0
    }
  });
});
