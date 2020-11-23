//
// @file index.tsx
// @author David Hammond
// @date 22 Nov 2020
//

import "./App.scss";

import * as _ from 'lodash';
import $ from 'jquery';

import * as React from "react";
import * as ReactDOM from "react-dom";

import DataSource from './data/DataSource';
import GovUK from './data/GovUK';
import JohnHopkins from './data/JohnHopkins';
import MultipleSource from './data/MultipleSource';

import Graph from './Graph';
import Scatter2D from './Scatter2D';
import Scatter3D from './Scatter3D';

import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Spinner from 'react-bootstrap/Spinner';
import Select from './Select';


interface State {
  dataLoaded: boolean
}

class App extends React.Component<{}, State> {
  #dataSource: DataSource;
  #graphs: Graph[];
  #graphList: string[];
  #averaging: number = 7;
  #windowing: number = 14;
  #countryList: string[] = [];
  #country: string = 'United Kingdom';

  constructor(props: {}) {
    super(props);
    this.state = {
      dataLoaded: false
    };
    this.#dataSource = new MultipleSource(new JohnHopkins(), new GovUK());
    this.#graphs = new Array<Graph>();
    this.#graphs.push(new Scatter2D(this.#averaging, this.#averaging, this.#windowing));
    this.#graphs.push(new Scatter3D(this.#averaging, this.#averaging, this.#windowing));
    this.#graphList = _.map(this.#graphs, graph => graph.displayName);
  }

  componentDidMount() {
    this.#dataSource.load().then(() => {
      // Select only countries with > 500 cumulative deaths
      this.#countryList = _.reduce([...this.#dataSource.getStoreEntries()], (result, value) => {
        if (value[1].cumDeaths[0] > 500) {
          result.push(value[0]);
        }
        return result;
      }, new Array<string>());
      this.setState({dataLoaded: true});
      this.renderGraphs();
      this.displayGraph(0);
    });
  }

  private renderGraphs() {
    const data = this.#dataSource.getCountryData(this.#country);
    if (data) {
      _.each(this.#graphs, (graph, i) => {
        graph.setRawData(data);
        graph.calcStats();
        graph.render(`graph-${i}`);
      });
    }
    // plotly js hack
    $('#graph-1 g .legendlines').addClass('d-none');
  }

  private displayGraph(index: number) {
    for (const i in this.#graphs) {
      $(`#graph-${i}`).addClass('d-none');
    }
    $(`#graph-${index}`).removeClass('d-none');
  }

  private onGraphChange(event: any) {
    this.displayGraph(event.target.value);
  }

  private onCountryChange(event: any) {
    this.#country = this.#countryList[event.target.value];
    this.renderGraphs();
  }

  render(): JSX.Element {
    return (
      <Container fluid style={{height: `${0.9*window.innerHeight}px`}}>
        <Row noGutters className='h-100'>
          <Col xs={10}>
            {!this.state.dataLoaded && <Loading />}
            {_.map(_.range(this.#graphs.length), i =>
                <div key={i} id={`graph-${i}`} className='d-none'/> )}
          </Col>
          <Col xs={2} className='pt-5'>
            <table>
              <tbody>
                {this.state.dataLoaded &&
                <Select
                  dataLoaded={this.state.dataLoaded}
                  title="Country"
                  values={this.#countryList}
                  onChange={this.onCountryChange.bind(this)}
                  initialValue={_.indexOf(this.#countryList, this.#country)}/>}
                {this.state.dataLoaded &&
                <Select
                  dataLoaded={this.state.dataLoaded}
                  title="Graph"
                  values={this.#graphList}
                  onChange={this.onGraphChange.bind(this)}
                  initialValue={0}/>}
              </tbody>
            </table>
          </Col>
        </Row>
      </Container>
    );
  }
};

const Loading: React.FC<{}> = () => {
  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Spinner animation="grow" variant="primary"/>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
