//
// @file load.ts
// @author David Hammond
// @date 13 Nov 2020
//

import axios from 'axios';
import fs from 'fs';
import { JSDOM } from 'jsdom';

axios.get('https://www.worldometers.info/world-population/population-by-country/')
  .then(html => {
  const { window } = new JSDOM(html.data);
  const $ = require('jquery')(window) as JQueryStatic;
  const data: any = {};
  $('tr').each(function() {
    const td = $(this).find('td');
    if ($(td[0]).html()) {
      data[$(td[1]).text()] = Number($(td[2]).text().replace(/,/g,''));
    }
  });
  fs.writeFileSync('src/data/population.json', JSON.stringify(data));
});
