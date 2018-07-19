import { createServer, Server } from 'http';
import { getManager, createConnection } from 'typeorm';
import * as express from 'express';
import * as socketIo from 'socket.io';
import 'reflect-metadata';
import * as bodyParser from 'body-parser';
import * as cookieparser from 'cookie-parser';
import * as passport from 'passport';
import * as session from 'express-session';
import * as expressValidator from 'express-validator';

import { AppRoutes } from './routes';
import { socketInit } from './sockets';


const port = process.env.PORT || 3000;
let app = express();

createConnection();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator());
app.use(cookieparser());
app.use(session({ secret: '©oÜΓŠ', resave: false, saveUninitialized: true, }));
app.use(passport.initialize());
app.use(passport.session());

let server = createServer(app);
let io = socketIo(server);

server.listen(port, () => {
	console.log('Running server on port %s', port);
});

io.on('connect', (socket: socketIo.Socket) => {
	console.log('Connected client on port %s.', port);
	socketInit(socket);
});