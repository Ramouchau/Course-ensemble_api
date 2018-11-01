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
	DeletedFromList
} from "../interfaces/list-interfaces"
import { UserToken } from "../interfaces/auth-interfaces";
import { io } from '../config';

// get-all-list
export async function getAllList(user: User, data: GetAllListRequest, socket: Socket) {
	let response: GetAllListResponse = { code: 200, status: "ok" }
	let userLists = user.owner_list.concat(user.users_list, user.watcher_list)

	response.lists = userLists.map(list => {
		console.log(list);
		socket.join(`list-${list.id}`)
		let owner: UserToken = {id: user.id, email: user.email, username: user.username};
		let clientlist: ClientList = {owner: owner, id: list.id, name: list.name, updateAt: list.updateAt, nbItems: list.items.length, nbUsers: list.users.length + list.watchers.length}
		return clientlist
	})

	socket.emit("get-all-list", response)
}


// get-list-bid
export async function getListById(user: User, data: GetListRequest, socket: Socket) {
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
	let clientlist: ClientList = { id: list.id, name: list.name, items: list.items, users: [], watchers: [], owner: owner };
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
	else if (list.users.indexOf(user) == -1 && list.owner.id != user.id) {
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
		const updateList: UpdateList = { idList: itemSaved.id, list: data.list }
		socket.to(`list-${list.id}`).emit("update-list", updateList)
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
	} else await listRep.remove(list)

	// TODO : check if peoples on the list are unsubbed from the list or idk when deleted like does it bug or not

	connection.manager.save(list).then(list => {
		socket.emit("delete-list", response)
	})
}
// delete-user-to-list
export async function deleteUserToList(user: User, data: DelUserToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: AddUserToListResponse = { code: 200, status: "ok" }
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
			return;
		}
	}
	response.code = 400
	response.status = "user not in list"
	socket.emit("del-user-to-list", response)

	const resList: DeletedFromList = { by: user.username, list: { id: list.id, name: list.name } }
	io.server.sockets.connected[io.clients[data.idUser]].emit("added-to", resList)
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
			io.server.sockets.connected[io.clients[data.idUser]].emit("added-to", resList)
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

	if (list.users.indexOf(userToAdd) > -1) {
		response.code = 400
		response.status = "user already in list"
		socket.emit("add-user-to-list", response)
		return
	}
	list.users.push(userToAdd)
	await listRep.save(list)
	socket.emit("add-user-to-list", response)

	const resList: AddedToListe = { by: user.username, list: { id: list.id, name: list.name } }
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
	} else if (list.owner.id != user.id && list.users.indexOf(user) == -1) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit("add-watcher-to-list", response)
		return
	}

	if (list.watchers.indexOf(userToAdd) > -1) {
		response.code = 400
		response.status = "user already in watcher list"
		socket.emit("add-watcher-to-list", response)
		return
	}

	list.watchers.push(userToAdd)
	await listRep.save(list)
	socket.emit("add-watcher-to-list", response)

	const resList: AddedToListe = { by: user.username, list: { id: list.id, name: list.name } }
	io.server.sockets.connected[io.clients[data.idUser]].emit("added-to", resList)
}

// add-item-to-list
export async function addItemToList(user: User, data: AddItemToListRequest, socket: Socket) {
	console.log("this");
	const connection: Connection = getConnection()
	let response: AddItemToListResponse = { code: 200, status: "ok", list: [] }
	let listRep = await connection.getRepository(List)
	let itemRep = await connection.getRepository(Item)
	let list = await listRep.findOne(data.idList, { relations: ["owner", "items", "users"] })
	if (!list) {
		response.code = 404
		response.status = "not found"
		socket.emit("add-item-to-list", response)
		return
	} else if (list.users.indexOf(user) == -1 && list.owner.id != user.id) {
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
		const updateItem: UpdateItem = { idItem: itemSaved.id, item: data.item }
		socket.to(`list-${list.id}`).emit("update-item", updateItem)
	});
	socket.emit("add-item-to-list", response)
}

// update-item
export async function updateItem(user: User, data: UpdateItemRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: UpdateItemResponse = { code: 200, status: "ok" }
	let itemRep = await connection.getRepository(Item)
	let item = await itemRep.findOne(data.idItem, { relations: ["list", "list.users", "list.owner"] })
	if (!item) {
		response.code = 404
		response.status = "not found"
		socket.emit('update-item', response)
		return
	}
	else if (item.list.users.indexOf(user) == -1 && item.list.owner.id != user.id) {
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
		// const updateItem: UpdateItem = { idItem: itemSaved.id, item: data.item }
		let userItem: ClientItem = { id: item.id, name: item.name, quantity: item.quantity, status: item.status};
		response.item = userItem;
		let userToken: UserToken = { id: user.id, username: user.username, email: user.email };
		response.user = userToken;
		response.listName = item.list.name;
		socket.to(`list-${item.list.id}`).emit("update-item", response)
	});
	socket.emit('update-item', response)
}


export async function deleteItem(user: User, data: DeleteItemRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: DeleteItemResponse = { code: 200, status: "ok" }
	let itemRep = await connection.getRepository(Item)
	let item = await itemRep.findOne(data.idItem, { relations: ["list", "list.users", "list.owner"] })

	if (!item) {
		response.code = 404
		response.status = "not found"
		socket.emit('delete-item', response)
		return
	}
	else if (item.list.users.indexOf(user) == -1 && item.list.owner.id != user.id) {
		response.code = 401
		response.status = "unauthorized"
		socket.emit('delete-item', response)
		return
	}

	await itemRep.delete(item)
	socket.emit('delete-item', response)
}
