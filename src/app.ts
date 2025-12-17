import express, { Request, Response } from 'express';
import listRoutes from './routes/list.routes'

const app = express();

app.use(express.json());

app.use('/list', listRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express + TypeScript!');
});

export default app;