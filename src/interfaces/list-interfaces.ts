

/*export interface Item {
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
}*/

export interface CreateListRequest {
    token: string;
    listName: string;
    items: Array<Item>
}

export interface CreateListResponse {
	status: string,
	code: number
}

export interface Item {
    name: string;
    quantity: number;
    status: number;
}
