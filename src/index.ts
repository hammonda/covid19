//
// @file index.ts
// @author David Hammond
// @date 7 Nov 2020
//

import * as _ from 'lodash';
import $ from 'jquery';

import {GovUK} from './data/GovUK';
import {JohnHopkins} from './data/JohnHopkins';
import {MultipleSource} from './data/MultipleSource';

import {Graph} from './Graph';
import {Scatter2D} from './Scatter2D';
import {Scatter3D} from './Scatter3D';

// default averaging and windowing values
const averaging = 7;
const windowing = 14;

// create the data source
const dataSource = new MultipleSource(new JohnHopkins(), new GovUK);

// create the graphs
const graphs = Array<Graph>();
graphs.push(new Scatter2D(averaging, averaging, windowing));
graphs.push(new Scatter3D(averaging, averaging, windowing));
let graphIndex = 0; // show graph zero at start up

// hook up the select box
const graphSelect = $('#graph-select');
graphSelect.on('change', () => {
  $(`#graph-${graphIndex}`).addClass('d-none');
  graphIndex = Number(graphSelect.val());
  $(`#graph-${graphIndex}`).removeClass('d-none');
  graphSelect.trigger('blur');
});

// load the data
function load() {
  graphSelect.prop('disabled', true);
  dataSource.load().then(() => {
    const data = dataSource.getCountryData('US');
    if (data) {
      _.each(graphs, (graph, i) => {
        graph.setRawData(data);
        graph.calcStats();
        graph.render(`graph-${i}`);
      });
    }
    // plotly js hack
    $('#graph-1 g .legendlines').addClass('d-none');
    graphSelect.prop('disabled', false);
  });
}

// kick off initial load
load();
