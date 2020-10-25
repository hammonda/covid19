import axios from 'axios';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Plot from 'react-plotly.js';
import * as _ from "lodash";

type data_t = {date: string, cases: number, deaths: number, sum: number};
type graph_t = {x: Array<number>, y: Array<number>, z: Array<number>};

// Load data from UK government web API
async function loadData(): Promise<Array<data_t>> {
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
  return response.data.data;
}

// Add rolling sum of cases for the previous specified number of days
function addSum(data: Array<{cases: number, sum: number}>, days: number): void {
  if (days > data.length) {
    days = data.length;
  }
  data[0].sum = _.reduce(_.take(data, days), (r, v) => r + v.cases, 0);
  for (let t = 1, b = days; b < data.length; ++t, ++b) {
    data[t].sum = data[t - 1].sum - data[t - 1].cases + data[b].cases;
  }
  _.remove(data, i => i.sum == undefined);
}

const App: React.FC<{days: number}> = ({days = 0}) => {
  const [data, setData] = React.useState<graph_t>();

  React.useEffect(() => {
    // Load the data
    loadData().then(data => {
      addSum(data, days);
      // Update graph
      setData({
        x: _.map(data, i => i.cases),
        y: _.map(data, i => i.sum),
        z: _.map(data, i => i.deaths)
      });
    });
  }, [days] /* only update when days changes */);

  return (
    <div>
    { data && data.x &&
      <Plot
        data={[
          {
            x: data.x,
            y: data.y,
            z: data.z,
            type: 'scatter3d',
            mode: 'lines',
            line: {
              color: 'black',
              width: 1
            },
          },
        ]}
        layout={{
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
              type: 'log'
            }
          },
          margin: {
            b: 100,
            l: 0,
            r: 0,
            t: 0
          },
        }}
      />
    }
    </div>
  );
}

ReactDOM.render(<App days={14}/>, document.getElementById('root'))
