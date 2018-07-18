import {getAllUsers} from "./controller/getAllUsers";

/**
 * All application routes.
 */
export const AppRoutes = [
    {
        path: "/api/users",
        method: "get",
        action: getAllUsers
    },

];