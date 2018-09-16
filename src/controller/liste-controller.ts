import { getConnection, Connection } from 'typeorm';
import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import {List} from "../entity/List";
import { CreateListResponse, CreateListRequest } from '../interfaces/list-interfaces';
import { Session } from '../interfaces/session';
import { UserToken } from '../interfaces/auth-interfaces';

export async function createList(data: CreateListRequest, socket: Socket) {
    const connection: Connection = getConnection();
		let response: CreateListResponse = { code: 200, status: "ok" };

    jwt.verify(data.token, '©oÜΓŠ', async (err, res: UserToken) => {
			if (err){
				response.code = 401
				response.status = "unauthorized"
				socket.emit('get-user', response);
				return;
			}

		})

}