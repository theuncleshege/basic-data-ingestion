import 'reflect-metadata';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';

import { getPacketWithExpress } from '@Functions/data/get';
import { storePacketWithExpress } from '@Functions/data/store';
import { storeThresholdWithExpress } from '@Functions/threshold/store';

dotenv.config();

const app = express();

app.set('port', process.env.PORT);

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/v1/data/:sensorId/', getPacketWithExpress);
app.put('/v1/data/', storePacketWithExpress);
app.post('/v1/threshold/', storeThresholdWithExpress);

export default app;
