
import { getManager, getConnection, Connection } from "typeorm";
import { User } from "../entity/User";
import { UserRegisterRequest, UserRegisterResponse } from "../interfaces/auth-interfaces";
import * as CryptoJS from 'crypto-js';
import { Socket } from 'socket.io';

/**
 * Loads all posts from the database.
 */
export async function userRegister(data: UserRegisterRequest, socket: Socket) {
	const connection: Connection = getConnection();
	const encryptedPass: CryptoJS.WordArray = CryptoJS.AES.encrypt(data.password, '©oÜΓŠ Eⁿ£Σßε');
	const users = await connection.getRepository(User).find({ email: data.email });
	let response: UserRegisterResponse = { code: 200, status: "ok" };

	if (users.length === 0) {
		const newUser = new User();
		newUser.email = data.email;
		newUser.password = encryptedPass.toString();
		newUser.username = data.username;
		newUser.profilePicPath = "";
		connection.manager.save(newUser);
	}
	else {
		response.status = "Email already in use";
		response.code = 400;
	}

	socket.emit('register', response);
}