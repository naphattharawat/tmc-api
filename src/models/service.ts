import * as Knex from 'knex';
var request = require('request');

export class ServiceModel {

  verifyTMC(firstName, lastName, code = null) {
    const key = process.env.API_TMC_KEY;
    const api_tmc_url = process.env.API_TMC_URL;

    return new Promise((resolve: any, reject: any) => {
      const options = {
        method: 'POST',
        url: api_tmc_url,
        headers: {
          Authorization: key,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {name: firstName, lastname: lastName}
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