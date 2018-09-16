
import { getConnection, Connection } from "typeorm";
import { User } from "../entity/User";
import { Socket } from 'socket.io';
import { hash, compare } from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import {
	UserRegisterRequest,
	UserRegisterResponse,
	UserLoginRequest,
	UserLoginResponse,
	GetUserRequest,
	GetUserResponse,
	UserToken
} from "../interfaces/auth-interfaces";

// Socket listener user-register
export async function userRegister(data: UserRegisterRequest, socket: Socket) {
	const connection: Connection = getConnection();
	const user = await connection.getRepository(User).findOne({ email: data.email });
	let response: UserRegisterResponse = { code: 200, status: "ok" };

	if (!user) {
		const newUser = new User();
		newUser.email = data.email;
		newUser.username = data.username;
		newUser.profilePicPath = "";
		hash(data.password, 10, (err, pass) => {
			if (err) {
				response = { code: 500, status: "Error password hashing" }
			}
			newUser.password = pass;
			connection.manager.save(newUser).then((res) => {
				let payload = { id: res.id, email: res.email, username: res.username };
				response.token = jwt.sign(payload, '©oÜΓŠ');
				socket.emit('register', response);
			});

		})
	}
	else {
		response.status = "Email already in use";
		response.code = 400;
		socket.emit('register', response);
	}
}

// Socket listener user-login
export async function userLogin(data: UserLoginRequest, socket: Socket) {
	const connection: Connection = getConnection();
	const user = await connection.getRepository(User).findOne({ email: data.email });
	let response: UserLoginResponse = { code: 200, status: "ok" };

	if (!user) {
		response = { code: 401, status: "Wrong email / password" };
		socket.emit('login', response);
		return;
	}

	compare(data.password, user.password, (err, same) => {
		if (!same) {
			response = { code: 401, status: "Wrong email / password" };
			socket.emit('login', response);
			return;
		}
		let payload = { id: user.id, email: user.email, username: user.username };
		response.token = jwt.sign(payload, '©oÜΓŠ');
		response.email = user.email;
		response.username = user.username;
		socket.emit('login', response);
	})
}

// Socket listener get-user
export async function getUser(data: GetUserRequest, socket: Socket) {
	let response: GetUserResponse = { code: 200, status: "ok" };
	const connection: Connection = getConnection();

	 jwt.verify(data.token, '©oÜΓŠ', async (err, res: UserToken) => {
		if (err){
			response.code = 401
			response.status = "ko"
			socket.emit('get-user', response);
			return;
		}

		const user = await connection.getRepository(User).findOne(res.id);
		if (!user){
			response.code = 404
			response.status = "ko"
			socket.emit('get-user', response);
			return;
		}

		response.user = { email: res.email, username: res.username, id: res.id};
		socket.emit('get-user', response);
	})
}