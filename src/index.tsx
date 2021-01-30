//
// @file index.tsx
// @author David Hammond
// @date 22 Nov 2020
//

import "./App.scss";

import * as _ from 'lodash';
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from './app/App';
import ViewPort from './app/ViewPort';

import GovUK from './data/GovUK';
import JohnHopkins from './data/JohnHopkins';
import MultipleSource from './data/MultipleSource';

import Graph from './graph/Graph';
import Scatter2D from './graph/Scatter2D';
import Scatter3D from './graph/Scatter3D';

// Create the data source
const dataSource = new MultipleSource(new JohnHopkins(), new GovUK());

// Create the available graphs
const averaging = 7;
const windowing = 14;
const graphs = new Array<Graph>();
const viewPort = window.innerWidth < 576 ? ViewPort.xSmall : ViewPort.extraExtraLarge;
graphs.push(new Scatter2D(dataSource, averaging, averaging, windowing, viewPort));
graphs.push(new Scatter3D(dataSource, averaging, averaging, windowing, viewPort));
const graphDisplayNames = _.map(graphs, graph => graph.displayName);

// Create and render the App
ReactDOM.render(<App
  dataSource={dataSource}
  graphs={graphs}
  graphDisplayNames={graphDisplayNames}
  defaultCountry='United Kingdom'/>,
  document.getElementById('root'));
