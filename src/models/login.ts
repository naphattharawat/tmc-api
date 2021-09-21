import * as Knex from 'knex';
const request = require("request");

export class Login {
  login(db: Knex, username: string, password: string) {
    const appId = process.env.APP_ID;
    return db('um_users')
      .where('username', username)
      .where('password', password)
      .where('app_id', appId)
      .limit(1);
  }

  logs_token(db: Knex, data: any) {
    return db('logs_token')
      .insert(data)
  }

  updateLastActive(db, id, date: {}) {
    return db('um_users')
      .update(date)
      .where('id', id)
  }

  checkActive(db, useId = 0 ,token= '') {
    return db('view_actived_token')
    .where('use_id', useId)
    .where('token',token)
  }

  verify(token) {
    console.log('1');
    
    return new Promise((resolve: any, reject: any) => {
      var options = {
        method: 'GET',
        url: 'https://oauth.moph.go.th/v1/verify',
        qs: { app_id: process.env.APP_ID },
        headers:
        {
          'cache-control': 'no-cache',
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`

        },
        agentOptions: {
          rejectUnauthorized: false
        }
      };
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(body));
        }
      });
    });
  }
}