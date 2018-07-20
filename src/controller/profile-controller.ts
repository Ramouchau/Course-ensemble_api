import { getConnection, Connection } from 'typeorm';
import { User } from '../entity/User';
import { Socket } from 'socket.io';
import * as jwt_decode from 'jwt-decode'
import { UserToken } from '../interfaces/auth-interfaces';
import { GetProfileRequest, GetProfileResponse } from '../interfaces/profile-interfaces';

export async function getProfile(data: GetProfileRequest, socket: Socket) {
	let responce: GetProfileResponse;
	try {
		let auth: UserToken = jwt_decode(data.token);
		const connection: Connection = getConnection();
		const user = await connection.getRepository(User).findOne({ id: auth.id });

		if (!user) {
			responce = { code: 500, status: 'error' };
			socket.emit('get-profile', responce);
			return;
		}

		responce = { code: 200, status: 'ok', email: user.email, username: user.username };
		socket.emit('get-profile', responce)
	}
	catch (e) {
		responce = { code: 401, status: 'unauthorized' };
		socket.emit('get-profile', responce);
		return;
	}
}