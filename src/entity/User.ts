import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { List } from "./List";

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

	@OneToMany(type => List, list => list.owner)
	owner_list: List[]

	@ManyToMany(type => List, list => list.users)
	users_list: List[];
}
