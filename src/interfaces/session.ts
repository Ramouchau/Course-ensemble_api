import * as jwt from 'jsonwebtoken';

export class Session {
    id: number;
    email: string;
    username: string;

    Session(token: string) {
        jwt.verify(token, '©oÜΓŠ',)
    }
}