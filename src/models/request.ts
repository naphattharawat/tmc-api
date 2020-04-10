import * as Knex from 'knex';

export class RequestModel {

  getFilerData(db: Knex) {
    return db('filter_data')
  }

  getFilerDataCode(db: Knex, code) {
    return db('filter_data')
      .where('HOS_CODE', code)
  }

}