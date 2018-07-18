import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import { Request, Response } from "express";
import * as bodyParser from "body-parser";
import { AppRoutes } from "./routes";
import { getAllUsers } from "./controller/getAllUsers";
import { getManager } from "typeorm";
import { userRegisterInterface } from './interfaces/userInterface';
import * as cookieparser from "cookie-parser";
import * as passport from 'passport';
import * as session from 'express-session';
import * as expressValidator from 'express-validator';

export class ChatServer {
	public static readonly PORT: number = 8080;
	private app: express.Application;
	private server: Server;
	private io: SocketIO.Server;
	private port: string | number;

	constructor() {
		createConnection();
		this.createApp();
		this.config();
		this.createServer();
		this.sockets();
		this.listen();
	}

	private createApp(): void {
		this.app = express();
	}

	private createServer(): void {
		this.server = createServer(this.app);
	}

	private config(): void {
		this.port = process.env.PORT || ChatServer.PORT;
		// this.app.use(bodyParser.json());
		// this.app.use(bodyParser.urlencoded({extended: true}));
		// this.app.use(cookieparser());
		// this.app.use(passport.initialize());
		// this.app.use(passport.session());
		// this.app.use(session({ secret: 'courses', resave: false, saveUninitialized: true, }));
		// this.app.use(expressValidator());


	}

	private sockets(): void {
		this.io = socketIo(this.server);
	}

	private listen(): void {
		this.server.listen(this.port, () => {
			console.log('Running server on port %s', this.port);
		});

		//TODO : change any
		this.io.on('connect', (socket: any) => {
			console.log('Connected client on port %s.', this.port);
			socket.on('register', (data: userRegisterInterface) => {
				getAllUsers(this.io, data);
			});

			socket.on('disconnect', () => {
				console.log('Client disconnected');
			});
		});
	}

	public getApp(): express.Application {
		return this.app;
	}
}