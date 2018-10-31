import { createServer, Server } from 'http';
import { createConnection } from 'typeorm';
import * as express from 'express';
import * as socketIo from 'socket.io';
import 'reflect-metadata';
import * as bodyParser from 'body-parser';
import * as cookieparser from 'cookie-parser';
import * as expressValidator from 'express-validator';
import { socketInit } from './sockets';
import { io } from './config'

createConnection();

const port = process.env.PORT || 3000;
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(cookieparser());



/*AppRoutes.forEach(route => {
	app[route.method](route.path, (request: Request, response: Response, next: Function) => {
		route.action(request, response)
			.then(() => next)
			.catch(err => next(err));
	})
})*/

let server = createServer(app);
io.server = socketIo(server);

server.listen(port, () => {
	console.log('Running server on port %s', port);
	express.Router()
});

io.server.on('connect', (socket: socketIo.Socket) => {
	console.log('Connected client %s.', socket.id);
	socketInit(socket);
});