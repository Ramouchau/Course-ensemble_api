
import * as socketIo from 'socket.io';

export let io: Io = {
	server: null,
	clients: []
}
export interface Io {
	server: socketIo.Server;
	clients: { [id: number]: string }
}