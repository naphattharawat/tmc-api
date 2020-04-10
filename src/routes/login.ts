/// <reference path="../../typings.d.ts" />

import * as express from 'express';
import { Router, Request, Response } from 'express';
import * as HttpStatus from 'http-status-codes';
import * as crypto from 'crypto';

import { Login } from '../models/login';

import { Jwt } from '../models/jwt';
import moment = require('moment');

const loginModel = new Login();
const jwt = new Jwt();

const router: Router = Router();

router.post('/', async (req: Request, res: Response, ) => {
  let username: string = req.body.username;
  let password: string = req.body.password;

  let db = req.db;

  try {
    let encPassword = crypto.createHash('md5').update(password).digest('hex');
    let rs: any = await loginModel.login(db, username, encPassword);

    if (rs.length) {

      let payload = {
        vender_name: `${rs[0].vender_name}`,
        id: rs[0].id,

      }

      let token = jwt.signApiKey(payload);
      // let checkAvtives = await loginModel.checkAvtives(db, dataLogs)
      if (token) {
        let dataLogs = {
          token: token,
          actived: moment().format('YYYY-MM-DD HH:m:s'),
          expired: moment().add('d',1).format('YYYY-MM-DD HH:m:s'),
          use_id: rs[0].id
        }
        await loginModel.logs_token(db, dataLogs)
      }
      await loginModel.updateLastActive(db, rs[0].id, {last_actived: moment().format('YYYY-MM-DD HH:m:s')})
      res.send({ ok: true, token: token, code: HttpStatus.OK });
    } else {
      res.send({ ok: false, error: 'Login failed!', code: HttpStatus.UNAUTHORIZED });
    }
  } catch (error) {
    res.send({ ok: false, error: error.message, code: HttpStatus.INTERNAL_SERVER_ERROR });
  }

});

export default router;