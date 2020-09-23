/// <reference path="../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from 'moment';

// import * as express from 'express';
import { Router, Request, Response } from 'express';

import { ServiceModel } from '../models/service';
import e = require('express');
// const http = require('http')
const serviceModel = new ServiceModel();
const router: Router = Router();


router.get('/', async (req: Request, res: Response) => {
  try {
    const firstName: any = req.query.firstName;
    const lastName: any = req.query.lastName;
    const code: any = isNull(req.query.code) ? null : req.query.code; // optional
    if (firstName && lastName) {
      const rs: any = await serviceModel.verifyTMC(firstName,lastName,code);
      res.send({ ok: true, code:HttpStatus.OK,rows: rs });
    } else {
      if (!lastName && !firstName) {
        res.send({ ok: false, code: HttpStatus.BAD_REQUEST, error: 'ไม่มีข้อมูลชื่อและนามสกุล' });
      } else if (!firstName) {
        res.send({ ok: false, code: HttpStatus.BAD_REQUEST, error: 'ไม่มีข้อมูลชื่อ' });
      } else if (!lastName) {
        res.send({ ok: false, code: HttpStatus.BAD_REQUEST, error: 'ไม่มีข้อมูลนามสกุล' });
      } else {
        res.send({ ok: false, code: HttpStatus.BAD_REQUEST, error: 'ข้อมูลไม่ถูกต้อง' });
      }
    }
   
  } catch (error) {
    console.log(error);
    
    res.send({ ok: false, code:HttpStatus.INTERNAL_SERVER_ERROR,error: error.message });
  }
});

function isNull(value) {
  if (value == null || value == '' || value == undefined) {
    return true;
  } else {
    return false;
  }
}

export default router;