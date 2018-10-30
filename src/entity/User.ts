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

	@OneToMany(type => List, list => list.owner, {cascade: true})
	owner_list: List[]

	@ManyToMany(type => List, list => list.users, {cascade: true})
	users_list: List[];

	@ManyToMany(type => List, list => list.watchers, {cascade: true})
	watcher_list: List[];
}
