import { getConnection, Connection } from 'typeorm'
import { Socket } from 'socket.io'
import { List } from '../entity/List'
import { User } from '../entity/User'
import { Item } from '../entity/Item'
import {
    CreateListResponse,
    CreateListRequest,
    addUserToListRequest,
    addUserToListResponce,
    addItemToListRequest,
    addItemToListResponce,
    updateItemRequest,
    updateItemResponce,
    ClientList,
    GetAllListResponce,
    GetAllListRequest,
    DeleteListResponse,
    DeleteListRequest,
    addWatcherToListRequest,
    addWatcherToListResponce,
    GetListResponce,
    GetListRequest,
    UpdateItem,
    DeleteItemRequest,
    DeleteItemResponce, delUserToListRequest, ClientItem
} from "../interfaces/list-interfaces"
import {UserToken} from "../interfaces/auth-interfaces";

// get-all-list
export async function getAllList(user: User, data: GetAllListRequest, socket: Socket) {
	let response: GetAllListResponce = { code: 200, status: "ok" }
	let userLists = user.owner_list.concat(user.users_list)

	response.lists = userLists.map(list => {
		socket.join(`list-${list.id}`)
		let clientlist: ClientList = { id: list.id, name: list.name }
		return clientlist
	})

	socket.emit("get-all-list", response)
}


// get-list-bid
export async function getListById(user: User, data: GetListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: GetListResponce = { code: 200, status: "ok" }
	let listRep = await connection.getRepository(List)
	let list = await listRep.findOne(data.idList, { relations: ["owner", "items", "items.addBy", "users", "watchers"] })
	if (list.owner.id !== user.id) {
		response.code = 403
		response.status = "User is not the list owner"
	}
	let owner: UserToken = {id: list.owner.id, username: list.owner.username, email: list.owner.email};
	let clientlist: ClientList = { id: list.id, name: list.name, items: list.items, users:[], watchers:[], owner: owner}
    list.users.forEach((user) =>
    {
        let formatUser : UserToken = {id: user.id, email: user.email, username: user.username};
        clientlist.users.push(formatUser)
    });
    list.watchers.forEach((user) =>
    {
        let formatUser : UserToken = {id: user.id, email: user.email, username: user.username};
        clientlist.watchers.push(formatUser)
    });
    let formatItems: ClientItem[] = [];
    list.items.forEach((item) => {
        let formatItem : ClientItem = {id: item.id, quantity: item.quantity, status: item.status, name: item.name}
        let addByUser : UserToken = {id: item.addBy.id, email: item.addBy.email, username: item.addBy.username};
        formatItem.addBy = addByUser;
        formatItems.push(formatItem);
    });
    clientlist.items = formatItems;
	response.list = clientlist
	console.log(clientlist);
	socket.emit('get-list-bid', response)
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

	let listRep = await connection.getRepository(List)
	let list = await listRep.findOne(data.id)
	if (list.owner !== user) {
		response.code = 403
		response.status = "User is not the list owner"
	} else await listRep.remove(list)

	// TODO : check if peoples on the list are unsubbed from the list or idk when deleted like does it bug or not

	connection.manager.save(list).then(list => {
		socket.emit("delete-list", response)
	})
}
// delete-user-to-list
export async function deleteUserToList(user: User, data: delUserToListRequest, socket: Socket) {
    const connection: Connection = getConnection()
    let response: addUserToListResponce = { code: 200, status: "ok" }
    let listRep = await connection.getRepository(List)
    let list = await listRep.findOne(data.idList, { relations: ["owner", "users", "users.users_list"] })
	let userRep = await connection.getRepository(User);
    let userToDel = await userRep.findOne(data.idUser, {relations: ["users_list"]})

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
    for(let index in list.users)
	{
		if (list.users[index].id == userToDel.id)
		{
            list.users.splice(parseInt(index), 1);
            for(let index in userToDel.users_list) {
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
	return;
}
// delete-watcher-to-list
export async function deleteWatcherToList(user: User, data: delUserToListRequest, socket: Socket) {
    const connection: Connection = getConnection()
    let response: addUserToListResponce = { code: 200, status: "ok" }
    let listRep = await connection.getRepository(List)
    let list = await listRep.findOne(data.idList, { relations: ["owner", "watchers"] })
    let userRep = await connection.getRepository(User);
    let userToDel = await userRep.findOne(data.idUser, {relations: ["watcher_list"]})

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

    for(let index in list.watchers)
    {
        if (list.watchers[index].id == userToDel.id)
        {
            list.watchers.splice(parseInt(index), 1);
            for(let index in userToDel.watcher_list) {
                if (userToDel.watcher_list[index].id == list.id) {
                    userToDel.watcher_list.splice(parseInt(index), 1);
                }
            }
            await listRep.save(list)
            await userRep.save(userToDel)
            socket.emit("del-watcher-to-list", response)
            return;
        }
    }
    response.code = 400
    response.status = "user not in list"
    socket.emit("del-watcher-to-list", response)
    return;
}
// add-user-to-list
export async function addUserToList(user: User, data: addUserToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: addUserToListResponce = { code: 200, status: "ok" }
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
    console.log(list);
	socket.emit("add-user-to-list", response)
}

// add-watcher-to-list
export async function addWatcherToList(user: User, data: addWatcherToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: addWatcherToListResponce = { code: 200, status: "ok" }
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
}

// add-item-to-list
export async function addItemToList(user: User, data: addItemToListRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: addItemToListResponce = { code: 200, status: "ok", list: [] }
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
	list.items.push(item);
	await itemRep.save(item).then((itemSaved) => {
		const updateItem: UpdateItem = { idItem: itemSaved.id, item: data.item }
		socket.to(`list-${list.id}`).emit("update-item", updateItem)
	});
	await listRep.save(list)
	response.list.push(list)
	socket.emit("add-item-to-list", response)
}

// update-item
export async function updateItem(user: User, data: updateItemRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: updateItemResponce = { code: 200, status: "ok" }
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
		const updateItem: UpdateItem = { idItem: itemSaved.id, item: data.item }
		socket.to(`list-${item.list.id}`).emit("update-item", updateItem)
	});
	socket.emit('update-item', response)
}


export async function deleteItem(user: User, data: DeleteItemRequest, socket: Socket) {
	const connection: Connection = getConnection()
	let response: DeleteItemResponce = { code: 200, status: "ok" }
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
