export const config = {
  log: {
    id: '127.0.0.1',
    name: 'pubsub-server',
    router: {
      name: 'pubsub-router',
      events: ['error']
    },
    ws: {
      name: 'pubsub-ws',
      events: ['error']
    }
  },
  pubsub: {
    host: '127.0.0.1',
    ping: 50000,
    port: 3001
  }
};
