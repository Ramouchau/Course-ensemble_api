export interface UserRegisterResponse {
	status: string,
	code: number
}

export interface UserRegisterRequest {
	email: string,
	username: string,
	password: string
}