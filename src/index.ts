import { createServer, Server } from 'http';
import { getManager, createConnection, getConnection } from 'typeorm';
import * as express from 'express';
import {Request, Response} from 'express'
import * as socketIo from 'socket.io';
import 'reflect-metadata';
import * as bodyParser from 'body-parser';
import * as cookieparser from 'cookie-parser';
import * as session from 'express-session';
import * as expressValidator from 'express-validator';
import * as passport from 'passport';
import { authorize } from 'socketio-jwt'
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppRoutes } from './routes';
import { socketInit } from './sockets';
import { User } from './entity/User'

createConnection();


let strategy = new Strategy({ jwtFromRequest: ExtractJwt.fromAuthHeader(), secretOrKey: '©oÜΓŠ' }, function (jwt_payload, next) {
	const connection = getConnection();
	console.log('payload received', jwt_payload);
	// usually this would be a database call:
	let user = connection.getRepository(User).findOne({ id: jwt_payload.id });
	if (user) {
		next(null, user);
	} else {
		next(null, false);
	}
});

let sessionMiddleware = session({
	name: 'session',
	secret: '©oÜΓŠ',
	resave: false,
	saveUninitialized: true,
})

passport.use(strategy);


const port = process.env.PORT || 3000;
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieparser());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());



/*AppRoutes.forEach(route => {
	app[route.method](route.path, (request: Request, response: Response, next: Function) => {
		route.action(request, response)
			.then(() => next)
			.catch(err => next(err));
	})
})*/

let server = createServer(app);
let io = socketIo(server);

server.listen(port, () => {
	console.log('Running server on port %s', port);
	express.Router()
});

io.on('connect', (socket: socketIo.Socket) => {
	console.log('Connected client %s.', socket.id);
	socketInit(socket);
});