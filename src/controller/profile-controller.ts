import { getConnection, Connection } from 'typeorm';
import { User } from '../entity/User';
import { Socket } from 'socket.io';
import { GetProfileRequest, GetProfileResponse } from '../interfaces/profile-interfaces'

export async function getProfile(data: GetProfileRequest, socket: Socket) {
	const connection: Connection = getConnection();

	let responce: GetProfileResponse = { code: 200, status: 'ok', email: '', username: ''}
	socket.emit('login', responce)
}