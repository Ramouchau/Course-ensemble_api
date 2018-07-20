import { userRegister, userLogin } from './controller/auth-controller'

export const AppRoutes = [
	{
		path: "/register",
		method: "post",
		action: userRegister
	},
	{
		path: "/login",
		method: "post",
		action: userLogin
	},
];