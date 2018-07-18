import {Request, Response} from "express";
import {getManager} from "typeorm";
import {User} from "../entity/User";

/**
 * Loads all posts from the database.
 */
export async function getAllUsers(request: Request, response: Response) {

    // get a post repository to perform operations with post
    const postRepository = getManager().getRepository(User);

    // load a post by a given post id
    const posts = await postRepository.find();

    // return loaded posts
    console.log("test in route");
    response.send(posts);
}