import { Request, Response } from "express";
import { getManager, getConnection, Connection } from "typeorm";
import { User } from "../entity/User";
import { createConnection } from "typeorm";
import { userRegisterInterface } from "../interfaces/userInterface";
import * as CryptoJS from 'crypto-js';

/**
 * Loads all posts from the database.
 */
export async function getAllUsers(io: SocketIO.Server, data: userRegisterInterface) {

	const encryptedPass: CryptoJS.WordArray = CryptoJS.AES.encrypt(data.password, 'secret key 123');
	const connection: Connection = getConnection();
	const users = await connection.getRepository(User).find();
	let add: boolean = true;

	users.forEach(element => {
		if (element.email === data.email) {
			io.emit('register', { error: "Email already in use" });
			add = false;
		}
	});

	if (add) {
		const newUser = new User();
		newUser.email = data.email;
		newUser.password = encryptedPass.toString();
		newUser.username = data.username;
		newUser.profilePicPath = "";
		connection.manager.save(newUser);
		io.emit('register', { status: "ok" });
	}

}