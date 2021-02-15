/// <reference path="../../../typings.d.ts" />

import * as HttpStatus from 'http-status-codes';
import * as moment from 'moment';

// import * as express from 'express';
import { Router, Request, Response } from 'express';

import { ServiceModel } from '../../models/service';
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
      const rs: any = await serviceModel.verifyTMC(firstName, lastName, code);
      const json = JSON.parse(rs.toString());
      const statusMessage = messageName(json.sta);
      const statusCodeMessage = messageName(json.staCode);
      const obj = {
        prefix:json.prefix,
        firstName: json.name,
        lastName: json.sure_name,
        license:json.license
      }
      const response = {
        ok:true,
        code:HttpStatus.OK,
        status_name : {
          status: json.sta,
          statusMessage:statusMessage, 
        },
        status_code : {
          statusCode:json.staCode,
          statusCodeMessage:statusCodeMessage, 
        },
        data: obj 
      }
      res.send(response);
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

    res.send({ ok: false, code: HttpStatus.INTERNAL_SERVER_ERROR, error: error.message });
  }
});

function isNull(value) {
  if (value == null || value == '' || value == undefined) {
    return true;
  } else {
    return false;
  }
}

function messageName(code){
  let statusMessage = '';
  if (code == 200) {
    statusMessage = 'FOUND';
  } else if (code == 300) {
    statusMessage = 'NOT_FOUND';
  } else if (code == 400  ) {
    statusMessage = 'PERMISSION_DENINED';
  } else if (code == 100  ) {
    statusMessage = 'EMPTY_PARAMETER';
  }
  return statusMessage;
}

export default router;