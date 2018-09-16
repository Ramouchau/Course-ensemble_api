import * as socketIo from 'socket.io';
import { PassportStatic } from 'passport';

import { userRegister, userLogin, getUser } from './controller/auth-controller'
import { getProfile } from './controller/profile-controller'
import { createList } from './controller/liste-controller';

export const socketInit = (socket: socketIo.Socket) => {

	socket.on('register', (data) => userRegister(data, socket));
	socket.on('login', (data) => userLogin(data, socket));
	socket.on('get-user', (data) => getUser(data,socket));
	socket.on('get-profile', (data) => getProfile(data, socket));
	socket.on('create-list', (data) => createList(data, socket));

	socket.on('disconnect', () => console.log('Client disconnected'));
}