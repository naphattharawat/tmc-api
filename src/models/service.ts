import * as Knex from 'knex';
var request = require('request');

export class ServiceModel {

  verifyTMC(firstName, lastName, code = null) {
    const key = process.env.API_TMC_KEY;
    const api_tmc_url = process.env.API_TMC_URL;
    let obj: any = { name: firstName, lastname: lastName };
    if (code) {
      obj.codecpe = code;
    }
    return new Promise((resolve: any, reject: any) => {
      const options = {
        method: 'POST',
        url: api_tmc_url,
        headers: {
          Authorization: key,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: obj
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