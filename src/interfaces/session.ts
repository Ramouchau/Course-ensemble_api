import * as jwt from 'jsonwebtoken';

export class Session {
    id: number;
    email: string;
    username: string;

    constructor(token: string) {

				let test = jwt.verify(token, '©oÜΓŠ')

				console.log(test);
    }
}