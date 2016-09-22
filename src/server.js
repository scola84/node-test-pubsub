import ws from 'ws';

import { Connector } from '@scola/api-ws';
import { Router, handleError } from '@scola/api-router';
import { codec } from '@scola/api-codec-json';
import { PubSub, pubsubRoutes } from '@scola/api-model';

import { config } from '../config';

function parseAddress(connection) {
  return connection && connection.address().address || '';
}

function logRequest(request, response, next) {
  const date = '[' + new Date().toISOString() + ']';
  const address = parseAddress(request.connection());
  const id = request.method() + ' ' + request.url();

  console.log(date + ' ' + address + ' ' + id);
  next();
}

const server = new ws.Server(config.pubsub);
const router = new Router();
const connector = new Connector()
  .server(server)
  .router(router)
  .codec(codec);

const pubsub = new PubSub();

connector.on('error', handleError);
router.on('error', handleError);
server.on('error', handleError);

router.filter(logRequest);

pubsubRoutes(router, pubsub);
