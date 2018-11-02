import { UserToken } from "./auth-interfaces";

export interface ClientItem {
  id: number;
  name: string;
  quantity?: string;
  status?: number;
  addBy?: UserToken;
}

export interface ClientList {
  id: number;
  name: string;
  items?: ClientItem[];
  users?: UserToken[]
  watchers?: UserToken[];
  owner?: UserToken;
  nbItems?: number;
  nbUsers?: number;
  updateAt?: Date
}

export interface GetAllListRequest {
	token: string;
}

export interface GetAllListResponse {
	status: string;
	code: number;
	lists?: ClientList[];
}

export interface GetListRequest {
	token: string;
	idList: number;
}

export interface GetListResponse {
	status: string;
	code: number;
	list?: ClientList;
}

export interface deleteListRequest {
    token: string;
    idList: number;
}

export interface deleteListResponse {
    status: string;
    code: number;
}
export interface CreateListRequest {
	token: string;
	listName: string;
}

export interface CreateListResponse {
	status: string;
	code: number;
	idList?: number;
}

export interface DeleteListRequest {
	token: string;
	id: number;
}

export interface DeleteListResponse {
	status: string;
	code: number;
	idList?: number;
}

export interface AddUserToListRequest {
	token: string;
	idList: number;
	idUser: number;
}

export interface AddUserToListResponse {
	status: string;
	code: number;
}

export interface AddWatcherToListRequest {
	token: string;
	idList: number;
	idUser: number;
}

export interface AddWatcherToListResponse {
	status: string;
	code: number;
}


export interface DelUserToListRequest {
	token: string;
	idList: number;
	idUser: number;
}

export interface DelUserToListResponse {
	status: string;
	code: number;
}

export interface DelWatcherToListRequest {
	token: string;
	idList: number;
	idUser: number;
}

export interface DelWatcherToListResponse {
	status: string;
	code: number;
}

export interface AddItemToListRequest {
	token: string;
	idList: number;
	item: ClientItem;
}

export interface AddItemToListResponse {
	status: string;
	code: number;
	list: ClientItem[];
}

export interface UpdateItemRequest {
	token: string;
	idItem: number;
	item: ClientItem;
}

export interface UpdateItemResponse {
	status: string;
	code: number;
	item?: ClientItem;
	user?: UserToken;
	listName?: string;
}

export interface SearchUserRequest {
	token: string;
	research: string;
}

export interface SearchUserResponse {
	status: string;
	code: number;
	users?: UserToken[];
}

export interface DeleteItemRequest {
	token: string;
	idItem: number;
}

export interface DeleteItemResponse {
	status: string;
	code: number;
}


export interface UpdateListRequest {
	token: string;
	idList: number;
	list: ClientList
}
export interface UpdateListResponse {
	status: string;
	code: number;
}
export interface UpdateList {
	by?: string;
	idList: number;
	list: ClientList;
}
export interface UpdateItem {
	idItem: number;
	item: ClientItem;
}

export interface AddedToListe {
	by: string
	list: ClientList
}

export interface DeletedFromList {
	by: string
	list: ClientList
}

export interface ItemAdded {
	by: string
	item: ClientItem
}

export interface ItemDeleted {
	by: string
	item: ClientItem
}

export interface ItemUpdated {
	by: string
	item: ClientItem
}
