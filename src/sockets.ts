import * as socketIo from 'socket.io';
import * as jwt from 'jsonwebtoken';


import { UserToken } from './interfaces/auth-interfaces';
import { User } from './entity/User';
import { userRegister, userLogin, getUser } from './controller/auth-controller'
import { getProfile, searchUser } from './controller/profile-controller'
import {
	createList,
	addUserToList,
	addItemToList,
	getAllList,
	deleteList,
	addWatcherToList,
	getListById,
	updateItem,
	deleteItem,
	updateList,
	deleteUserToList,
	deleteWatcherToList
} from './controller/liste-controller';
import { Connection, getConnection } from 'typeorm';

export const socketInit = (socket: socketIo.Socket) => {

	socket.on('register', (data) => userRegister(data, socket));
	socket.on('login', (data) => userLogin(data, socket));
	socket.on('get-user', (data) => requireAuth(data, socket, 'get-user', getUser));
	socket.on('get-profile', (data) => getProfile(data, socket));
	socket.on('create-list', (data) => requireAuth(data, socket, 'create-list', createList));
	socket.on('add-user-to-list', (data) => requireAuth(data, socket, 'add-user-to-list', addUserToList));
	socket.on('add-watcher-to-list', (data) => requireAuth(data, socket, 'add-watcher-to-list', addWatcherToList));
	socket.on('del-user-to-list', (data) => requireAuth(data, socket, 'del-user-to-list', deleteUserToList));
	socket.on('del-watcher-to-list', (data) => requireAuth(data, socket, 'del-watcher-to-list', deleteWatcherToList));
	socket.on('add-item-to-list', (data) => requireAuth(data, socket, 'add-item-to-list', addItemToList));
	socket.on('update-item', (data) => requireAuth(data, socket, 'update-item', updateItem));
	socket.on('update-list', (data) => requireAuth(data, socket, 'update-item', updateList));
	socket.on('get-all-list', (data) => requireAuth(data, socket, 'get-all-list', getAllList));
	socket.on('delete-list', (data) => requireAuth(data, socket, 'delete-list', deleteList));
	socket.on('disconnect', () => console.log('Client disconnected'));
	socket.on('get-list-bid', (data) => requireAuth(data, socket, 'get-list-bid', getListById));
	socket.on('delete-item', (data) => requireAuth(data, socket, 'delete-item', deleteItem));
	socket.on('search-user', (data) => requireAuth(data, socket, 'search-user', searchUser));

}

const requireAuth = <T>(data: any, socket: socketIo.Socket, resRoute: string, func: Function) => {
	const connection: Connection = getConnection();
	let response = { code: 200, status: "ok" };

	if (!data) {
		response.code = 400
		response.status = "ko"
		socket.emit(resRoute, response)
		return
	}

	jwt.verify(data.token, '©oÜΓŠ', async (err, res: UserToken) => {
		if (err) {
			response.code = 401
			response.status = "unauthorized"
			socket.emit(resRoute, response)
			return
		}

		const user = await connection.getRepository(User).findOne(res.id, { relations: ["owner_list", "owner_list.items", "owner_list.watchers" , "owner_list.users", "users_list", "watcher_list", "users_list.items", "watcher_list.items", "users_list.users", "watcher_list.users", "users_list.watchers", "watcher_list.watchers"] });
		if (!user) {
			response.code = 404
			response.status = "ko"
			socket.emit(resRoute, response)
			return
		}

		func(user, data, socket)
	})
}
