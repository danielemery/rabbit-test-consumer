import bunyan from 'bunyan';

import { Rabbit, observeRabbit } from '@danielemeryau/simple-rabbitmq';

const logger = bunyan.createLogger({ name: 'rabbit-test-consumer' });

async function run() {
  const config = {
    host: process.env.RABBIT_HOST || 'localhost',
    port: process.env.RABBIT_PORT || '5672',
    user: process.env.RABBIT_USER || '',
    password: process.env.RABBIT_PASS || '',
  };
  if (!process.env.RABBIT_EXCHANGE) {
    throw new Error('Must provide RABBIT_EXCHANGE option');
  }
  const rabbit = new Rabbit<any>(config);
  await rabbit.connect();
  const rabbitObserver = observeRabbit(
    rabbit,
    process.env.RABBIT_EXCHANGE,
    (process.env.ROUTING_KEY = ''),
  );
  return new Promise((resolve, reject) => {
    rabbitObserver.subscribe(logger.info, logger.error, () => resolve());
  });
}

logger.info('Rabbit Test Consumer Starting');
run()
  .then(() => {
    logger.info('Rabbit Test Consumer Stopped');
    process.exit(0);
  })
  .catch(err => {
    logger.error(err);
    process.exit(1);
  });
