import {UserToken} from "./auth-interfaces";

export interface ClientItem {
  name: string;
  quantity?: string;
  status?: number;
}

export interface ClientList {
  id: number;
  name: string;
  items?: ClientItem[];
  users?: UserToken[]
  watchers?: UserToken[]
}

export interface GetAllListRequest {
	token: string
}

export interface GetAllListResponce {
  status: string;
  code: number;
  lists?: ClientList[];
}

export interface GetListRequest {
  token: string
	idList: number
}

export interface GetListResponce {
	status: string
	code: number
	list?: ClientList
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

export interface addUserToListRequest {
  token: string;
  idList: number;
  idUser: number;
}

export interface addUserToListResponce {
  status: string;
  code: number;
}

export interface addWatcherToListRequest {
  token: string;
  idList: number;
  idUser: number;
}

export interface addWatcherToListResponce {
  status: string;
  code: number;
}


export interface delUserToListRequest {
    token: string;
    idList: number;
    idUser: number;
}

export interface delUserToListResponce {
    status: string;
    code: number;
}

export interface delWatcherToListRequest {
    token: string;
    idList: number;
    idUser: number;
}

export interface delWatcherToListResponce {
    status: string;
    code: number;
}

export interface addItemToListRequest {
  token: string;
  idList: number;
  item: ClientItem;
}

export interface addItemToListResponce {
  status: string;
  code: number;
  list: ClientItem[];
}

export interface updateItemRequest {
  token: string;
  idItem: number;
  item: ClientItem;
}

export interface updateItemResponce {
  status: string;
  code: number;
}

export interface searchUserRequest {
    token: string;
    research: string;
}

export interface searchUserResponce {
    status: string;
    code: number;
    users?: UserToken[];
}

export interface DeleteItemRequest {
  token: string;
  idItem: number;
}

export interface DeleteItemResponce {
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
export interface UpdateList{
    idList: number
    list: ClientList
}
export interface UpdateItem{
	idItem: number
	item: ClientItem
}

/*export interface updateItemStatusRequest {
	idItem: number
}

export interface updateItemstatusResponce {
	status: string,
	code: number
}*/
