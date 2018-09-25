import * as socketIo from 'socket.io';
import * as jwt from 'jsonwebtoken';


import { UserToken } from './interfaces/auth-interfaces';
import { User } from './entity/User';
import { userRegister, userLogin, getUser } from './controller/auth-controller'
import { getProfile } from './controller/profile-controller'
import { createList, addUserToList, addItemToList, getAllList } from './controller/liste-controller';
import { Connection, getConnection } from 'typeorm';

export const socketInit = (socket: socketIo.Socket) => {

	socket.on('register', (data) => userRegister(data, socket));
	socket.on('login', (data) => userLogin(data, socket));
	socket.on('get-user', (data) => requireAuth(data, socket, 'get-user', getUser));
	socket.on('get-profile', (data) => getProfile(data, socket));
	socket.on('create-list', (data) => requireAuth(data, socket, 'create-list', createList));
	socket.on('add-user-to-list', (data) => requireAuth(data, socket, 'add-user-to-list', addUserToList));
	socket.on('add-item-to-list', (data) => requireAuth(data, socket, 'add-item-to-list', addItemToList));
	socket.on('get-all-list', (data) => requireAuth(data, socket, 'get-all-list', getAllList));

	socket.on('disconnect', () => console.log('Client disconnected'));
}

const requireAuth = <T>(data: any, socket: socketIo.Socket, resRoute: string, func: Function) => {
	const connection: Connection = getConnection();
	let response = { code: 200, status: "ok" };

	jwt.verify(data.token, '©oÜΓŠ', async (err, res: UserToken) => {
		if (err) {
			response.code = 401;
			response.status = "unauthorized";
			socket.emit(resRoute, response);
			return;
		}

		const user = await connection.getRepository(User).findOne(res.id);
		if (!user) {
			response.code = 404
			response.status = "ko"
			socket.emit(resRoute, response);
			return;
		}

		func(user, data, socket);
	})
}