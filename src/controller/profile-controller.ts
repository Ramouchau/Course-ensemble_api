import { getConnection, Connection, Like } from 'typeorm';
import { User } from '../entity/User';
import { Socket } from 'socket.io';
import * as jwt_decode from 'jwt-decode'
import { UserToken } from '../interfaces/auth-interfaces';
import { GetProfileRequest, GetProfileResponse } from '../interfaces/profile-interfaces';
import {
	SearchUserRequest,
	SearchUserResponse,
	UpdateItem,
	UpdateItemRequest,
	UpdateItemResponse
} from "../interfaces/list-interfaces";
import { Item } from "../entity/Item";


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
		socket.emit('get-profile', responce);
	}
	catch (e) {
		responce = { code: 401, status: 'unauthorized' };
		socket.emit('get-profile', responce);
		return;
	}
}

export async function searchUser(getUser: User, data: SearchUserRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: SearchUserResponse = { code: 200, status: "ok", users: [] }
	let userRep = await connection.getRepository(User)
	let users = await userRep.find({ email: Like("%" + data.research + "%") })
	users.forEach((user) => {
		if (user.id == getUser.id)
				return;
		let formatUser: UserToken = { id: user.id, email: user.email, username: user.username };
		response.users.push(formatUser);
	});
	socket.emit('search-user', response)
	return;
}
