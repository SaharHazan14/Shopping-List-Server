import express, { Request, Response } from 'express';
import listRoutes from './routes/list.routes'
import itemRoutes from './routes/item.routes'
import { errorHandler } from './middlewars/error.middleware';

const app = express();

app.use(express.json());

app.use('/list', listRoutes)
app.use('/item', itemRoutes)

app.use(errorHandler)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express + TypeScript!');
});

export default app;