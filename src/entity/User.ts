import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany} from "typeorm";
import {List} from "./List";

@Entity()
export class User {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	email: string;

	@Column()
	password: string;

	@Column(
		{
			nullable: true
		}
	)

	profilePicPath: string;

    @OneToMany(type => List, list => list.owner) // note: we will create author property in the Photo class below
    owner_list: List[]

    @ManyToMany(type => List, list => list.users) // note: we will create author property in the Photo class below
    users_list: List[];
}
