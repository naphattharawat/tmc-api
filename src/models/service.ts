import * as Knex from 'knex';
var request = require('request');

export class ServiceModel {

  verifyTMC(firstName, lastName, code = null) {
    const key = process.env.API_TMC_KEY;
    const api_tmc_url = process.env.API_TMC_URL;
    let url = `${api_tmc_url}/${key}/`;
    
    let p = `${firstName}!${lastName}`;
    if (code) {
      p += `!${code}`;
    }
    return new Promise((resolve: any, reject: any) => {
      var options = {
        'method': 'GET',
        'url': url,
        'qs': {p: p},
      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(body);
        }
      });
    });
  }


}