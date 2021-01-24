//
// @file App.tsx
// @author David Hammond
// @date 25 Nov 2020
//

import * as _ from 'lodash';
import $ from 'jquery';
import * as React from "react";

import DataSource from '../data/DataSource';
import Graph from '../graph/Graph';

import GraphContainers from './GraphContainers';
import Loading from './Loading';
import Select  from './Select';

import useHashHistory from './useHashHistory';
import useWindowSize from './useWindowSize';
import useDataSource from './useDataSource';

interface Props {
  dataSource: DataSource,
  graphs: Graph[],
  graphDisplayNames: string[],
  defaultCountry: string
}

const App: React.FC<Props> = (props: Props) => {
  const windowSize = useWindowSize();
  const [hashHistory, push] = useHashHistory();
  const [loaded, countryList] = useDataSource(props.dataSource, 500);
  const [countrySelected, setCountrySelected] =
    React.useState<string>(hashHistory || props.defaultCountry);
  const [graphIndex, setGraphIndex] = React.useState<number>(0);

  React.useEffect(() => {
    if (loaded) {
      const data = props.dataSource.getCountryData(countrySelected);
      if (data) {
        _.each(props.graphs, (graph, i) => {
          graph.setRawData(data);
          graph.calcStats();
          graph.render(`graph-${i}`);
        });
      }
    }
  }, [loaded, /*windowSize,*/ countrySelected]);

  React.useEffect(() => {
    // This is used to toggle between the graphs because React does not know
    // that Plotly is updating the DOM.
    if (graphIndex != null) {
      for (const i in props.graphs) {
        $(`#graph-${i}`).addClass('d-none');
      }
      $(`#graph-${graphIndex}`).removeClass('d-none');
    }
  }, [loaded, graphIndex]);

  // Handle the history and country encoded hash
  React.useEffect(() => push(countrySelected), [countrySelected]);
  React.useEffect(() => {
    if (countryList.indexOf(hashHistory) != -1) {
      setCountrySelected(hashHistory)
     }
   }, [hashHistory]);

  return (
    <div>{!loaded ?
      <Loading height={windowSize.height}/> :
      <div className='row no-gutters'>
        <GraphContainers size={props.graphs.length} />
        <div className="col-lg-2 pt-5 pr-1 pl-1">
          <table>
            <tbody>
              <Select title="Country"
                      options={countryList}
                      onChange={setCountrySelected}
                      value={countrySelected}
                      useStringValue={true}/>
              <Select title="Graph"
                      options={props.graphDisplayNames}
                      onChange={e => setGraphIndex(Number(e))}
                      value={String(graphIndex)}/>
            </tbody>
          </table>
        </div>
      </div>}
    </div>
  );
}

export default App;