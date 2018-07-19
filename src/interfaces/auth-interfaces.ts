export interface UserRegisterResponse {
	status: string,
	code: number
}

export interface UserRegisterRequest {
	email: string,
	username: string,
	password: string
}

export interface UserLoginResponse {
	status: string,
	code: number
}

export interface UserLoginRequest {
	email: string,
	password: string
}