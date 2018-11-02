import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import {User} from "./User";
import {List} from "./List";

@Entity()
export class Item {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(type => User, owner => owner.id)
    addBy: User;

    @ManyToOne(type => List, list => list.items, {cascade: true, onDelete:'CASCADE'})
    list: List;

    @Column()
    quantity: string;

    @Column("timestamp", { precision: 3, default: () => "CURRENT_TIMESTAMP(3)"})
    createAt: Date;

    @Column("timestamp", { precision: 3, default: () => "CURRENT_TIMESTAMP(3)", onUpdate: "CURRENT_TIMESTAMP(3)"})
    updateAt: Date;

    @Column()
    status: number;

}
