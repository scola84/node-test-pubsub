import http from 'http';
import parallel from 'async/parallel';
import WebSocket from 'ws';

import { codec } from '@scola/api-codec-json';

import {
  ConnectorHandler,
  RouterHandler,
  ConsoleLogger
} from '@scola/api-log';

import {
  PubSub,
  pubsubRoutes
} from '@scola/api-model';

import {
  Router,
  handleError
} from '@scola/api-router';

import { WsConnector } from '@scola/api-ws';
import { config } from '../conf/server';

const httpServer = new http.Server();
const wsServer = new WebSocket.Server({ server: httpServer });

const router = new Router();
const connector = new WsConnector()
  .server(wsServer)
  .router(router)
  .codec(codec)
  .ping(config.pubsub.ping);

const consoleLogger = new ConsoleLogger();

const wsLog = new ConnectorHandler()
  .id(config.log.id)
  .name(config.log.ws.name)
  .source(connector)
  .target(consoleLogger)
  .events(config.log.ws.events);

const routerLog = new RouterHandler()
  .id(config.log.id)
  .name(config.log.router.name)
  .source(router)
  .target(consoleLogger)
  .events(config.log.router.events);

const pubsub = new PubSub();

httpServer
  .listen(config.pubsub.port, config.pubsub.host);

pubsubRoutes(router, pubsub);

router.on('error', handleError);

consoleLogger.log({
  date: new Date(),
  id: config.log.id,
  name: config.log.name,
  type: 'start'
});

process.on('SIGINT', () => {
  consoleLogger.log({
    date: new Date(),
    id: config.log.id,
    name: config.log.name,
    type: 'stop'
  });

  parallel([
    (callback) => {
      connector.close(1001, 'delay=1');
      callback();
    },
    (callback) => {
      routerLog.end();
      wsLog.end();
      callback();
    },
    (callback) => {
      httpServer.close(callback);
    },
    (callback) => {
      wsServer.close(callback);
    }
  ], () => {
    process.exit();
  });
});
