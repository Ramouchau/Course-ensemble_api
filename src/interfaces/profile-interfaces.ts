export interface GetProfileRequest {
	token: string
}

export interface GetProfileResponse {
	code: number,
	status: string,
	email?: string,
	username?: string;
}