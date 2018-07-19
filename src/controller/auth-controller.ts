
import { getConnection, Connection } from "typeorm";
import { User } from "../entity/User";
import { Socket } from 'socket.io';
import { hash, compare } from 'bcrypt';
import {
	UserRegisterRequest,
	UserRegisterResponse,
	UserLoginRequest,
	UserLoginResponse
} from "../interfaces/auth-interfaces";

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
			connection.manager.save(newUser);
		})
	}
	else {
		response.status = "Email already in use";
		response.code = 400;
	}

	socket.emit('register', response);
}

export async function userLogin(data: UserLoginRequest, socket: Socket) {
	const connection: Connection = getConnection();
	const user = await connection.getRepository(User).findOne({ email: data.email });
	let response: UserLoginResponse = { code: 200, status: "ok" };

	if (!user) {
		response = { code: 401, status: "Wrong email / password" };
		socket.emit('login', response);
		return;
	}

	compare(data.password, user.email, (err, same) => {
		if (!same) {
			response = { code: 401, status: "Wrong email / password" };
			socket.emit('login', response);
			return;
		}

		socket.emit('login', response);
	})
}