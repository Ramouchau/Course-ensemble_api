
export interface Item {
    id: number;
    name: string;
    addedId: number;
    //list: List;
    quantity: string;
    createAt: Date;
    updateAt: Date;
    status: number;
}

export interface List {
    id: number;
    name: string;
    ownerId: number;
    items: Item[];
    createAt: Date;
    updateAt: Date;
    //users: User[];
}