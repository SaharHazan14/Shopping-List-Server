import app from './app';
import logger from './logger';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = app.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
});

/*process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason as Error);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', err as Error);
  process.exit(1);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down');
  server.close(() => process.exit(0));
});*/