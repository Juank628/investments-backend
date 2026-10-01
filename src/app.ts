import express, { Express } from 'express';
import { createServer } from 'node:http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import usersRoutes from './routes/users';
import usersAdminRoutes from './routes/usersAdmin';
import diagnosticRoutes from './routes/diagnostic';
import verticalSpreadsRoutes from './routes/verticalSpreads';
import movementsRoutes from './routes/movements';
import balancesRoutes from './routes/balances';
import { getTokenPayload } from './middlewares/getTokenPayload';

const app: Express = express();
const server = createServer(app);

const port: number = 3500;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  //cors for http
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
//unprotected routes
app.use('/users', usersRoutes);
//protected routes
app.use(getTokenPayload);
app.use('/users-admin', usersAdminRoutes);
app.use('/diagnostic', diagnosticRoutes);
app.use('/vertical-spreads', verticalSpreadsRoutes);
app.use('/movements', movementsRoutes);
app.use('/balances', balancesRoutes);

server.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
