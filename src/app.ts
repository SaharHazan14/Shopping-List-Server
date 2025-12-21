import express, { Request, Response } from 'express';
import listRoutes from './routes/list.routes'
import { errorHandler } from './middlewars/error.middleware';

const app = express();

app.use(express.json());

app.use('/list', listRoutes)

app.use(errorHandler)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express + TypeScript!');
});

export default app;