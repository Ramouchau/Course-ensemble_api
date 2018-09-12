import { getConnection, Connection } from 'typeorm';
import { User } from '../entity/User';
import { Socket } from 'socket.io';
import * as jwt_decode from 'jwt-decode'
import {UserRegisterRequest, UserRegisterResponse, UserToken} from '../interfaces/auth-interfaces';
import { GetProfileRequest, GetProfileResponse } from '../interfaces/profile-interfaces';
import {hash} from "bcrypt";
import {List} from "../entity/List";

export async function createList(data: List, socket: Socket) {
    /*const connection: Connection = getConnection();
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

    socket.emit('register', response);*/
}