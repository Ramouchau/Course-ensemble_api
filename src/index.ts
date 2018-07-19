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


createConnection();
const port = process.env.PORT || 3000;
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieparser());
/*app.use(passport.initialize());
app.use(passport.session());
app.use(session({ secret: 'courses', resave: false, saveUninitialized: true, }));
app.use(expressValidator());*/

let server = createServer(app);
let io = socketIo(server);

server.listen(port, () => {
	console.log('Running server on port %s', port);
});

io.on('connect', (socket: socketIo.Socket) => {
	console.log('Connected client on port %s.', port);
	socketInit(socket);
});