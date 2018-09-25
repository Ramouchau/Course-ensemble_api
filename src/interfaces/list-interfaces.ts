export interface ClientItem {
	name: string
	quantity?: number
	status?: number
}

export interface ClientList {
	id: number
	name: string
	items?: ClientItem[]
}

export interface GetAllListRequest {}

export interface GetAllListResponce {
	status: string
	code: number
	lists?: ClientList[]
}

export interface GetListRequest {
	idList: number
}

export interface GetListResponce {
	status: string
	code: number
	list: ClientList
}

export interface CreateListRequest {
    token: string
    listName: string
}

export interface CreateListResponse {
	status: string
	code: number
	idList?: number
}

export interface addUserToListRequest {
	idList: number
	idUser: number
}

export interface addUserToListResponce {
	status: string
	code: number
}

export interface addItemToListRequest {
	idList: number
	item: ClientItem
}

export interface addItemToListResponce {
	status: string
	code: number
}

export interface updateItemRequest {
	idItem: number
	item: ClientItem
}

export interface updateItemResponce {
	status: string,
	code: number
}

/*export interface updateItemStatusRequest {
	idItem: number
}

export interface updateItemstatusResponce {
	status: string,
	code: number
}*/
