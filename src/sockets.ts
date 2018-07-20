import * as socketIo from 'socket.io';
import { PassportStatic } from 'passport';

import { userRegister, userLogin } from './controller/auth-controller'
import { getProfile } from './controller/profile-controller'

export const socketInit = (socket: socketIo.Socket) => {

	socket.on('register', (data) => userRegister(data, socket));
	socket.on('login', (data) => userLogin(data, socket));
	socket.on('get-profile', (data) => getProfile(data, socket));

	socket.on('disconnect', () => console.log('Client disconnected'));
}