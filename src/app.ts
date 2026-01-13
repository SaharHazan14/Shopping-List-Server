import express from 'express';
import listRoutes from './modules/list/list.routes'
import itemRoutes from './routes/item.routes'
import { errorHandler } from './middlewars/error.middleware';

const app = express();

app.use(express.json());

app.use('/list', listRoutes)
app.use('/item', itemRoutes)

app.use(errorHandler)

export default app;