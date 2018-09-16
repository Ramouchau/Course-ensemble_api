export interface UserRegisterResponse {
	status: string,
	code: number,
	token?: string
}

export interface UserRegisterRequest {
	email: string,
	username: string,
	password: string
}

export interface UserLoginResponse {
	status: string,
	code: number,
	token?: string,
	username?: string,
	email?: string
}

export interface UserLoginRequest {
	email: string,
	password: string,
}

export interface UserToken {
	id: number,
	email: string,
	username: string,
}

export interface GetUserRequest {
	token: string
}

export interface GetUserResponse {
	status: string,
	code: number,
	user?: UserToken
}