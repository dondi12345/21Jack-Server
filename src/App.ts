import APIRotuer from "./apiRouter";

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Util } from "./Utils/Utils";
import { databaseService } from "./Database/DatabaseService";
import { configColyseus } from "./ServerConfig/ColyseusConfig";
import { listen } from "@colyseus/arena";

require('dotenv').config();

// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const http = require('http');

const app = express();


databaseService.Init();
listen(configColyseus, Util.strToNumber(process.env.FISH_KINGDOM_WS_PORT))

app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: '5mb',
  })
);

app.use('/api', APIRotuer);
const server = http.createServer(app);

server.listen(process.env.FISH_KINGDOM_API_PORT, () => {
    console.log(`Worker ${process.pid} listening on port: ${process.env.FISH_KINGDOM_API_PORT}`);
  });