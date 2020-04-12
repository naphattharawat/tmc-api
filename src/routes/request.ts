/// <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from 'moment';

// import * as express from 'express';
import { Router, Request, Response } from 'express';

import { RequestModel } from '../models/request';
// const http = require('http')
const requestModel = new RequestModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {
    const db = req.dbEoc
    const rs: any = await requestModel.getFilerData(db);
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }
});

router.get('/hospcode/:hospcode', async (req: Request, res: Response) => {
  const hospcode = req.params.hospcode;
  try {
    const db = req.dbEoc
    const rs: any = await requestModel.getFilerDataCode(db, hospcode);
    res.send({ ok: true, rows: rs });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }
});

export default router;