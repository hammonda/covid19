//
// @file load.ts
// @author David Hammond
// @date 13 Nov 2020
//

import axios from 'axios';
import { promises as fs } from 'fs';
import { JSDOM } from 'jsdom';

// Scrape country population data from https://www.worldometers.info/
const loadPopulationData = async (): Promise<{[key: string]: number}> => {
  const html = (await axios.get('https://www.worldometers.info/world-population/population-by-country/'
    , { timeout: 2000})).data;
  const { window } = new JSDOM(html);
  const $ = require('jquery')(window) as JQueryStatic;
  const data: {[key: string]: number} = {};
  $('tr').each(function() {
    const td = $(this).find('td');
    if ($(td[0]).html()) {
      data[$(td[1]).text()] = Number($(td[2]).text().replace(/,/g,''));
    }
  });
  return data;
};

// Load and save data
loadPopulationData()
.then(data => fs.writeFile('src/data/population.json', JSON.stringify(data)))
.then(() => console.log('done!'))
.catch(err => console.error(err));
