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

export interface AddUserToListRequest {
  token: string;
  idList: number;
  idUser: number;
}

export interface AddUserToListResponce {
  status: string;
  code: number;
}

export interface AddWatcherToListRequest {
  token: string;
  idList: number;
  idUser: number;
}

export interface AddWatcherToListResponce {
  status: string;
  code: number;
}


export interface DelUserToListRequest {
    token: string;
    idList: number;
    idUser: number;
}

export interface DelUserToListResponce {
    status: string;
    code: number;
}

export interface DelWatcherToListRequest {
    token: string;
    idList: number;
    idUser: number;
}

export interface DelWatcherToListResponce {
    status: string;
    code: number;
}

export interface AddItemToListRequest {
  token: string;
  idList: number;
  item: ClientItem;
}

export interface AddItemToListResponce {
  status: string;
  code: number;
  list: ClientItem[];
}

export interface UpdateItemRequest {
  token: string;
  idItem: number;
  item: ClientItem;
}

export interface UpdateItemResponce {
  status: string;
  code: number;
}

export interface SearchUserRequest {
    token: string;
    research: string;
}

export interface SearchUserResponce {
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