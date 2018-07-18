import { Request, Response } from "express";
import { getManager, getConnection, Connection } from "typeorm";
import { User } from "../entity/User";
import { createConnection } from "typeorm";
import { userRegisterInterface } from "../interfaces/userInterface";
import * as CryptoJS from 'crypto-js';
import { registerResponse } from "../interfaces/responseInterface";

/**
 * Loads all posts from the database.
 */
export async function getAllUsers(io: SocketIO.Server, data: userRegisterInterface) {

	const encryptedPass: CryptoJS.WordArray = CryptoJS.AES.encrypt(data.password, 'secret key 123');
	const connection: Connection = getConnection();
	const users = await connection.getRepository(User).find({ email: data.email});
	let response: registerResponse = { code: 200, status: "ok"};

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

	io.emit('register', response);

}