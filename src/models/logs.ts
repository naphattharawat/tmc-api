import * as Knex from 'knex';

export class LogsModel {

  saveLogs(db: Knex, data: any) {
    return db('logs_api_reques')
      .insert(data);
  }  

}