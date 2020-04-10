/// <reference path="../typings.d.ts" />

require('dotenv').config();

import * as path from 'path';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as ejs from 'ejs';
import * as HttpStatus from 'http-status-codes';
import * as express from 'express';
import * as cors from 'cors';

import Knex = require('knex');
import { MySqlConnectionConfig } from 'knex';
import { Router, Request, Response, NextFunction } from 'express';
import { Jwt } from './models/jwt';

var responseSize = require('express-response-size');

import indexRoute from './routes/index';
import loginRoute from './routes/login';
import { Login } from './models/login';
import { LogsModel } from './models/logs';
import requestRoute from './routes/request';

// Assign router to the express.Router() instance
const app: express.Application = express();
const api = express.Router()

const jwt = new Jwt();
const loginModal = new Login();
const logsModel = new LogsModel();

//view engine setup
app.set('views', path.join(__dirname, '../views'));
app.engine('.ejs', ejs.renderFile);
app.set('view engine', 'ejs');

//uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname,'../public','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use(cors());

let connection: MySqlConnectionConfig = {
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true,
  // debug: true
}

let db = Knex({
  client: 'mysql',
  connection: connection,
  pool: {
    min: 0,
    max: 100,
    afterCreate: (conn, done) => {
      conn.query('SET NAMES utf8', (err) => {
        done(err, conn);
      });
    }
  },
});

let connectionEoc: MySqlConnectionConfig = {
  host: process.env.DB_HOST_EOC,
  port: +process.env.DB_PORT_EOC,
  database: process.env.DB_NAME_EOC,
  user: process.env.DB_USER_EOC,
  password: process.env.DB_PASSWORD_EOC,
  multipleStatements: true,
  // debug: true
}

let dbEoc = Knex({
  client: 'mysql',
  connection: connectionEoc,
  pool: {
    min: 0,
    max: 100,
    afterCreate: (conn, done) => {
      conn.query('SET NAMES utf8', (err) => {
        done(err, conn);
      });
    }
  },
});

app.use((req: Request, res: Response, next: NextFunction) => {
  req.db = db;
  req.dbEoc = dbEoc;
  next();
});



let checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  let token: string = null;
  
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  } else {
    token = req.body.token;
  }
  
  jwt.verify(token)
  .then(async (decoded: any) => {
    const _token = await loginModal.checkActive(req.db, decoded.id, token);
    if (_token.length) {
      req.decoded = decoded;
      next();
    } else {
      return res.send({
        ok: false,
        error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
        code: HttpStatus.UNAUTHORIZED
      });
    }
  }, err => {
    return res.send({
      ok: false,
      error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
      code: HttpStatus.UNAUTHORIZED
    });
  });
}

async function saveLogApi(req: Request, res: Response, next) {
  try {
    let log = {
      api_name: req.baseUrl,
      http_method: req.method,
      path: req.baseUrl,
      app_id: req.headers['user-agent'],
      client_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      provider_uid: req.decoded.id,
    }
    await logsModel.saveLogs(req.db, log)
  } catch (error) {
    console.log(error);
  }
}

app.use(responseSize(async (req, res, size) => {
  const stat = `${req.method} - ${req.url.replace(/[:.]/g, '')}`;
  const convertedSize = Math.round(size / 1024);
  const outputSize = `${convertedSize}`;
  // IE: shove into a database for further analysis, wait, spreadsheets are databases, right?
  try {
    let log = {
      api_name:  req.path,
      http_method: req.method,
      path: req.baseUrl +req.path,
      app_id: req.headers['user-agent'],
      client_ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      provider_uid: req.decoded.id,
      response_size: outputSize,
      request_size: req.socket.bytesRead
    }
    await logsModel.saveLogs(req.db, log)
  } catch (error) {
    console.log(error);
  }
}));
// app.use(logResponseBody);
app.use('/login', loginRoute);
app.use('/api', api);
api.use('/', checkAuth, requestRoute);
app.use('/', indexRoute);

//error handlers

if (process.env.NODE_ENV === 'development') {
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(err.stack);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: {
        ok: false,
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
      }
    });
  });
}

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(HttpStatus.NOT_FOUND).json({
    error: {
      ok: false,
      code: HttpStatus.NOT_FOUND,
      error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
    }
  });
});

export default app;
// function logResponseBody(req, res, next) {
//   var oldWrite = res.write,
//       oldEnd = res.end;

//   var chunks = [];

//   res.write = function (chunk) {
//     chunks.push(chunk);

//     oldWrite.apply(res, arguments);
//   };

//   res.end = function (chunk) {
//     if (chunk)
//       chunks.push(chunk);

//     var body = Buffer.concat(chunks).toString('utf8');
//     console.log(req.path, body);

//     oldEnd.apply(res, arguments);
//   };
//   req.headers['x-forwarded-for'] || req.connection.remoteAddress
//   next();
// }