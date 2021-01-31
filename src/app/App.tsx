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
  const [hashHistory, push] = useHashHistory(props.defaultCountry, String(0));
  const [loaded, countryList] = useDataSource(props.dataSource, 500);
  const [countrySelected, setCountrySelected] = React.useState<string>(hashHistory[0]);
  const [graphIndex, setGraphIndex] = React.useState<number>(Number(hashHistory[1]));

  React.useEffect(() => {
    if (loaded) {
      _.each(props.graphs, (graph, i) => {
        graph.setCountry(countrySelected);
        graph.render(`graph-${i}`);
      });
    }
  }, [loaded, /*windowSize,*/ countrySelected]);

  React.useEffect(() => {
    // This is used to toggle between the graphs because React does not know
    // that Plotly is updating the DOM.
    if (graphIndex != null) {
      for (const i in props.graphs) {
        $(`#graph-${i}`).addClass('d-none');
      }
      $(`#graph-${props.graphs.length}`).addClass('d-none');
      $(`#graph-${graphIndex}`).removeClass('d-none');
    }
  }, [loaded, graphIndex]);

  // Handle the history and country encoded hash
  React.useEffect(() => push(countrySelected, String(graphIndex)),
    [countrySelected, graphIndex]);
  React.useEffect(() => {
    const country = hashHistory[0];
    const graph = Number(hashHistory[1]);
    if (countryList.indexOf(country) != -1) {
      setCountrySelected(country);
    }
    if (graph >=0 && graph < props.graphs.length) {
      setGraphIndex(graph);
    }
   }, [hashHistory]);

  return (
    <div>{!loaded ?
      <Loading height={windowSize.height}/> :
      <div className='row no-gutters'>
        <GraphContainers size={props.graphs.length} />
        <div className='col-lg-2 pt-5 pr-1 pl-1'>
          <table>
            <tbody>
              <Select title='Country'
                      options={countryList}
                      onChange={setCountrySelected}
                      value={countrySelected}
                      useStringValue={true}/>
              <Select title='Graph'
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