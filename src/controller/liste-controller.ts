import { getConnection, Connection } from 'typeorm'
import { Socket } from 'socket.io'
import { List } from '../entity/List'
import { User } from '../entity/User'
import { Item } from '../entity/Item'
import {
	CreateListResponse,
	CreateListRequest,
	AddUserToListRequest,
	AddUserToListResponse,
	AddItemToListRequest,
	AddItemToListResponse,
	UpdateItemRequest,
	UpdateItemResponse,
	ClientList,
	GetAllListResponse,
	GetAllListRequest,
	DeleteListResponse,
	DeleteListRequest,
	AddWatcherToListRequest,
	AddWatcherToListResponse,
	GetListResponse,
	GetListRequest,
	UpdateItem,
	DeleteItemRequest,
	DeleteItemResponse,
	UpdateListRequest,
	UpdateListResponse,
	UpdateList,
	DelUserToListRequest,
	AddedToListe,
	ClientItem,
	DeletedFromList,
	DelUserToListResponse,
	ItemUpdated
} from "../interfaces/list-interfaces"
import { UserToken } from "../interfaces/auth-interfaces";
import { io } from '../config';

// get-all-list
export async function getAllList(user: User, data: GetAllListRequest, socket: Socket) {
	let response: GetAllListResponse = { code: 200, status: "ok" }
	let userLists = user.owner_list.concat(user.users_list, user.watcher_list)
	response.lists = userLists.map(list => {
		socket.join(`list-${list.id}`)
		let owner: UserToken = { id: user.id, email: user.email, username: user.username };
		let clientlist: ClientList = {
			owner: owner,
			id: list.id,
			name: list.name,
			updateAt: list.updateAt,
			nbItems: list.items ? list.items.length : 0,
			nbUsers: (list.users ? list.users.length : 0) + (list.watchers ? list.watchers.length : 0)
		}
		return clientlist
	})
	response.lists = response.lists.sort((list1, list2) => {
		return list1.updateAt > list2.updateAt ? -1 : 1;
	})

	socket.emit("get-all-list", response)
}


// get-list-bid
export async function getListById(user: User, data: GetListRequest, socket: Socket) {
    io.clients[user.id] = socket.id
	const connection: Connection = getConnection()
	let response: GetListResponse = { code: 200, status: "ok" }
	let listRep = await connection.getRepository(List)
	let list = await listRep.findOne(data.idList, { relations: ["owner", "items", "items.addBy", "users", "watchers"] })
	if (list.owner.id !== user.id) {
		response.code = 403
		response.status = "User is not the list owner"
	}

	list.watchers.forEach(element => {
		if (element.id === user.id) {
			response.code = 200
			response.status = "ok"
		}
	});

	list.users.forEach(element => {
		if (element.id === user.id) {
			response.code = 200
			response.status = "ok"
		}
	});

	let owner: UserToken = { id: list.owner.id, username: list.owner.username, email: list.owner.email };
	let clientlist: ClientList = { id: list.id, name: list.name, items: list.items, users: [], watchers: [], owner: owner, updateAt: list.updateAt};
	list.users.forEach((user) => {
		let formatUser: UserToken = { id: user.id, email: user.email, username: user.username };
		clientlist.users.push(formatUser)
	});
	list.watchers.forEach((user) => {
		let formatUser: UserToken = { id: user.id, email: user.email, username: user.username };
		clientlist.watchers.push(formatUser)
	});
	let formatItems: ClientItem[] = [];
	list.items.forEach((item) => {
		let formatItem: ClientItem = { id: item.id, quantity: item.quantity, status: item.status, name: item.name }
		let addByUser: UserToken = { id: item.addBy.id, email: item.addBy.email, username: item.addBy.username };
		formatItem.addBy = addByUser;
		formatItems.push(formatItem);
	});
	clientlist.items = formatItems;
	response.list = clientlist
	socket.emit('get-list-bid', response)
}

// update-list
export async function updateList(user: User, data: UpdateListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: UpdateListResponse = { code: 200, status: "ok" }
	let listRep = await connection.getRepository(List)
	let list = await listRep.findOne(data.idList, { relations: ["users", "owner"] })
	if (!list) {
		response.code = 404
		response.status = "not found"
		socket.emit('update-list', response)
		return
	}
	else if (!list.users.find(u => u.id === user.id) && list.owner.id != user.id) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit('update-list', response)
		return
	}

	list.name = data.list.name;
	/*
	TODO: Rajouter la liste des utilisateurs à l'update de la liste
	 */
	response.status = "OK";
	await listRep.save(list).then((itemSaved) => {
        let owner : UserToken = {id: list.owner.id, email: list.owner.email, username: list.owner.username}
        const updateList: UpdateList = { by: user.username, idList: list.id, list: { id: list.id, name: list.name, owner:owner, updateAt: list.updateAt, nbItems: list.items ? list.items.length : 0, nbUsers: (list.users ? list.users.length: 0) + (list.watchers ? list.watchers.length: 0)} }
        socket.to(`list-${list.id}`).emit("updated-list", updateList)
        //io.server.sockets.connected[io.clients[user.id]].emit("update-list", updateList)
	});
	socket.emit('update-item', response)
}

// create-list
export async function createList(user: User, data: CreateListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: CreateListResponse = { code: 200, status: "ok" }

	let list = new List()

	list.name = data.listName
	list.owner = user

	connection.manager.save(list).then(list => {
		response.idList = list.id
		console.log(list.id)
		socket.emit("create-list", response)
	})
}

// delete-list
export async function deleteList(user: User, data: DeleteListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: DeleteListResponse = { code: 200, status: "ok" }

	let listRep = await connection.getRepository(List);
	let list = await listRep.findOne(data.id, {relations: ["owner"]})
	if (list.owner.id !== user.id) {
		response.code = 403
		response.status = "User is not the list owner"
		return;
	} else
		await listRep.remove(list)
    /*let index = user.owner_list.findIndex((l) => l.id === data.id)
    user.owner_list.splice(index, 1);
    let indexW = user.watcher_list.findIndex((l) => l.id === data.id)
    user.watcher_list.splice(indexW, 1);
    let indexU = user.users_list.findIndex((l) => l.id === data.id)
    user.users_list.splice(indexU, 1);
	await connection.getRepository(User).save(user);*/

	socket.emit("delete-list", response)
}
// delete-user-to-list
export async function deleteUserToList(user: User, data: DelUserToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: DelUserToListResponse = { code: 200, status: "ok" }
	let listRep = await connection.getRepository(List)
	let list = await listRep.findOne(data.idList, { relations: ["owner", "users", "users.users_list"] })
	let userRep = await connection.getRepository(User);
	let userToDel = await userRep.findOne(data.idUser, { relations: ["users_list"] })

	if (!list || !userToDel) {
		response.code = 404
		response.status = "not found"
		socket.emit("del-user-to-list", response)
		return
	} else if (list.owner.id != user.id) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit("del-user-to-list", response)
		return
	}
	for (let index in list.users) {
		if (list.users[index].id == userToDel.id) {
			list.users.splice(parseInt(index), 1);
			for (let index in userToDel.users_list) {
				if (userToDel.users_list[index].id == list.id) {
					userToDel.users_list.splice(parseInt(index), 1);
				}
			}
			await listRep.save(list)
			await userRep.save(userToDel)
			socket.emit("del-user-to-list", response)

			const resList: DeletedFromList = { by: user.username, list: { id: list.id, name: list.name } }
			io.server.sockets.connected[io.clients[userToDel.id]].emit("list-deleted", resList)
			return;
		}
	}
	response.code = 400
	response.status = "user not in list"
	socket.emit("del-user-to-list", response)
}
// delete-watcher-to-list
export async function deleteWatcherToList(user: User, data: DelUserToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: AddUserToListResponse = { code: 200, status: "ok" }
	let listRep = await connection.getRepository(List)
	let list = await listRep.findOne(data.idList, { relations: ["owner", "watchers"] })
	let userRep = await connection.getRepository(User);
	let userToDel = await userRep.findOne(data.idUser, { relations: ["watcher_list"] })

	if (!list || !userToDel) {
		response.code = 404
		response.status = "not found"
		socket.emit("del-watcher-to-list", response)
		return
	} else if (list.owner.id != user.id) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit("del-watcher-to-list", response)
		return
	}

	for (let index in list.watchers) {
		if (list.watchers[index].id == userToDel.id) {
			list.watchers.splice(parseInt(index), 1);
			for (let index in userToDel.watcher_list) {
				if (userToDel.watcher_list[index].id == list.id) {
					userToDel.watcher_list.splice(parseInt(index), 1);
				}
			}
			await listRep.save(list)
			await userRep.save(userToDel)
			socket.emit("del-watcher-to-list", response)

			const resList: DeletedFromList = { by: user.username, list: { id: list.id, name: list.name } }
			io.server.sockets.connected[io.clients[data.idUser]].emit("list-deleted", resList)
		}
	}
	response.code = 400
	response.status = "user not in list"
	socket.emit("del-watcher-to-list", response)
	return;
}
// add-user-to-list
export async function addUserToList(user: User, data: AddUserToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: AddUserToListResponse = { code: 200, status: "ok" }
	let listRep = await connection.getRepository(List)
	let list = await listRep.findOne(data.idList, { relations: ["owner", "users"] })
	let userToAdd = await connection.getRepository(User).findOne(data.idUser)

	if (!list || !userToAdd) {
		response.code = 404
		response.status = "not found"
		socket.emit("add-user-to-list", response)
		return
	} else if (list.owner.id != user.id) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit("add-user-to-list", response)
		return
	}

	if (list.users.find(u => u.id === userToAdd.id)) {
		response.code = 400
		response.status = "user already in list"
		socket.emit("add-user-to-list", response)
		return
	}
	list.users.push(userToAdd)
	await listRep.save(list)
	socket.emit("add-user-to-list", response)

	let owner : UserToken = {id: list.owner.id, email: list.owner.email, username: list.owner.username}
	const resList: AddedToListe = { by: user.username, list: { id: list.id, name: list.name, owner:owner, updateAt: list.updateAt, nbItems: list.items ? list.items.length : 0, nbUsers: (list.users ? list.users.length: 0) + (list.watchers ? list.watchers.length: 0)} }
	io.server.sockets.connected[io.clients[data.idUser]].emit("added-to", resList)
}

// add-watcher-to-list
export async function addWatcherToList(user: User, data: AddWatcherToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: AddWatcherToListResponse = { code: 200, status: "ok" }
	let listRep = await connection.getRepository(List)
	let list = await listRep.findOne(data.idList, { relations: ["owner", "watchers", "users"] })
	let userToAdd = await connection.getRepository(User).findOne(data.idUser)

	if (!list || !userToAdd) {
		response.code = 404
		response.status = "not found"
		socket.emit("add-watcher-to-list", response)
		return
	} else if (list.owner.id != user.id && !list.users.find(u => u.id === user.id)) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit("add-watcher-to-list", response)
		return
	}

	if (list.watchers.find(u => u.id === userToAdd.id)) {
		response.code = 400
		response.status = "user already in watcher list"
		socket.emit("add-watcher-to-list", response)
		return
	}

	list.watchers.push(userToAdd)
	await listRep.save(list)
	socket.emit("add-watcher-to-list", response)

    let owner : UserToken = {id: list.owner.id, email: list.owner.email, username: list.owner.username}
    const resList: AddedToListe = { by: user.username, list: { id: list.id, name: list.name, owner:owner, updateAt: list.updateAt, nbItems: list.items ? list.items.length : 0, nbUsers: (list.users ? list.users.length: 0) + (list.watchers ? list.watchers.length: 0)} }
    io.server.sockets.connected[io.clients[data.idUser]].emit("added-to", resList)
}

// add-item-to-list
export async function addItemToList(user: User, data: AddItemToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: AddItemToListResponse = { code: 200, status: "ok", list: [] }
	let listRep = await connection.getRepository(List)
	let itemRep = await connection.getRepository(Item)
	let list = await listRep.findOne(data.idList, { relations: ["owner", "items", "users", "watchers"] })
	if (!list) {
		response.code = 404
		response.status = "not found"
		socket.emit("add-item-to-list", response)
		return
	} else if (!list.users.find(u => u.id === user.id) && list.owner.id != user.id) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit("add-item-to-list", response)
		return
	}
	let item = new Item()

	item.name = data.item.name
	item.quantity = data.item.quantity
	item.status = data.item.status
	item.addBy = user
	item.list = list;
	await itemRep.save(item).then((itemSaved) => {
		let resItem = data.item
		resItem.id = itemSaved.id
		let roomRes: ItemUpdated = {by: user.username, item: resItem}
		socket.to(`list-${item.list.id}`).emit("item-added", roomRes)
        let owner : UserToken = {id: list.owner.id, email: list.owner.email, username: list.owner.username}
        const updateList: UpdateList = { by: user.username, idList: list.id, list: { id: list.id, name: list.name, owner:owner, updateAt: list.updateAt, nbItems: list.items ? list.items.length + 1: 0, nbUsers: (list.users ? list.users.length: 0) + (list.watchers ? list.watchers.length: 0)} }
        socket.to(`list-${list.id}`).emit("updated-list", updateList)
	});
	socket.emit("add-item-to-list", response)
}

// update-item
export async function updateItem(user: User, data: UpdateItemRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: UpdateItemResponse = { code: 200, status: "ok" }
	let itemRep = await connection.getRepository(Item)
	let item = await itemRep.findOne(data.idItem, { relations: ["list", "list.users", "list.owner", "list.items"] })

	if (!item) {
		response.code = 404
		response.status = "not found"
		socket.emit('update-item', response)
		return
	}
	else if (!item.list.users.find(u => u.id === user.id) && item.list.owner.id != user.id) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit('update-item', response)
		return
	}

	item.name = data.item.name
	item.quantity = data.item.quantity
	item.status = data.item.status
	response.status = "OK";

	await itemRep.save(item).then((itemSaved) => {
		let userItem: ClientItem = { id: item.id, name: item.name, quantity: item.quantity, status: item.status };
		response.item = userItem;
		let userToken: UserToken = { id: user.id, username: user.username, email: user.email };
		response.user = userToken;
		response.listName = item.list.name;
    let roomRes: ItemUpdated = {by: user.username, item: userItem}
		socket.to(`list-${item.list.id}`).emit("item-updated", roomRes)
	});
	socket.emit('update-item', response)
}


export async function deleteItem(user: User, data: DeleteItemRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: DeleteItemResponse = { code: 200, status: "ok" }
	let itemRep = await connection.getRepository(Item)
	let item = await itemRep.findOne(data.idItem, { relations: ["list", "list.users", "list.owner", "list.items", "list.watchers"] })
    let list = item.list;
	if (!item) {
		response.code = 404
		response.status = "not found"
		socket.emit('delete-item', response)
		return
	}
	else if (!item.list.users.find(u => u.id === user.id)&& item.list.owner.id != user.id) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit('delete-item', response)
		return
	}

	await itemRep.delete(item)
	socket.emit('delete-item', response)

	let roomRes: ItemUpdated = {by: user.username, item: item}
	socket.to(`list-${item.list.id}`).emit("item-deleted", roomRes)
    let owner : UserToken = {id: list.owner.id, email: list.owner.email, username: list.owner.username}
    const updateList: UpdateList = { by: user.username, idList: list.id, list: { id: list.id, name: list.name, owner:owner, updateAt: list.updateAt, nbItems: list.items ? list.items.length - 1: 0, nbUsers: (list.users ? list.users.length: 0) + (list.watchers ? list.watchers.length: 0)} }
    socket.to(`list-${item.list.id}`).emit("updated-list", updateList)
}
