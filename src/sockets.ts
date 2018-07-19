import * as socketIo from 'socket.io';

import { userRegister } from './controller/auth-controller'

export const socketInit = (socket: socketIo.Socket) => {

	socket.on('register', (data) => userRegister(data, socket));

	socket.on('disconnect', () => console.log('Client disconnected'));
}