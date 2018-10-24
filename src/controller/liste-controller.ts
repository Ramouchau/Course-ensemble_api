import { getConnection, Connection } from "typeorm";
import { Socket } from "socket.io";
import { List } from "../entity/List";
import { User } from "../entity/User";
import { Item } from "../entity/Item";
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
	GetListRequest
} from "../interfaces/list-interfaces";

// get-all-list
export async function getAllList(
  user: User,
  data: GetAllListRequest,
  socket: Socket
) {
  let response: GetAllListResponce = { code: 200, status: "ok" };
  let userLists = user.owner_list.concat(user.users_list);

  response.lists = userLists.map(list => {
    socket.join(`list-${list.id}`);
    let clientlist: ClientList = { id: list.id, name: list.name };
    return clientlist;
  });

  socket.emit("get-all-list", response);
}


// get-list-bid
export async function getListById(user: User, data: GetListRequest, socket: Socket) {
    const connection: Connection = getConnection();
    let response: GetListResponce = { code: 200, status: "ok" }
    let listRep = await connection.getRepository(List)
		let list = await listRep.findOne(data.idList, { relations: ["owner"]});
    if (list.owner.id !== user.id) {
        response.code = 403;
        response.status = "User is not the list owner";
    } else
        await listRep.remove(list);
    let clientlist: ClientList = { id: list.id, name: list.name, items: list.items};
    response.list = clientlist;

    socket.emit('get-list-bid', response);
}

// create-list
export async function createList(
  user: User,
  data: CreateListRequest,
  socket: Socket
) {
  const connection: Connection = getConnection();
  let response: CreateListResponse = { code: 200, status: "ok" };

  let list = new List();

  list.name = data.listName;
  list.owner = user;

  connection.manager.save(list).then(list => {
    response.idList = list.id;
    socket.emit("create-list", response);
  });
}

// delete-list
export async function deleteList(
  user: User,
  data: DeleteListRequest,
  socket: Socket
) {
  const connection: Connection = getConnection();
  let response: DeleteListResponse = { code: 200, status: "ok" };

  let listRep = await connection.getRepository(List);
  let list = await listRep.findOne(data.id);
  if (list.owner !== user) {
    response.code = 403;
    response.status = "User is not the list owner";
  } else await listRep.remove(list);

  // TODO : check if peoples on the list are unsubbed from the list or idk when deleted like does it bug or not

  connection.manager.save(list).then(list => {
    socket.emit("delete-list", response);
  });
}

// add-user-to-list
export async function addUserToList(
  user: User,
  data: addUserToListRequest,
  socket: Socket
) {
  const connection: Connection = getConnection();
  let response: addUserToListResponce = { code: 200, status: "ok" };
  let listRep = await connection.getRepository(List);
  let list = await listRep.findOne(data.idList);
  let userToAdd = await connection.getRepository(User).findOne(data.idUser);

  if (!list || !userToAdd) {
    response.code = 404;
    response.status = "not found";
    socket.emit("add-user-to-list", response);
    return;
  } else if (list.owner.id != user.id) {
    response.code = 401;
    response.status = "unauthorized";
    socket.emit("add-user-to-list", response);
    return;
  }

  if (list.users.indexOf(userToAdd) > -1) {
    response.code = 400;
    response.status = "user already in list";
    socket.emit("add-user-to-list", response);
    return;
  }
}

// add-watcher-to-list
export async function addWatcherToList(
  user: User,
  data: addWatcherToListRequest,
  socket: Socket
) {
  const connection: Connection = getConnection();
  let response: addWatcherToListResponce = { code: 200, status: "ok" };
  let listRep = await connection.getRepository(List);
  let list = await listRep.findOne(data.idList);
  let userToAdd = await connection.getRepository(User).findOne(data.idUser);

  if (!list || !userToAdd) {
    response.code = 404;
    response.status = "not found";
    socket.emit("add-watcher-to-list", response);
    return;
  } else if (list.owner.id != user.id) {
    response.code = 401;
    response.status = "unauthorized";
    socket.emit("add-watcher-to-list", response);
    return;
  }

  if (list.watchers.indexOf(userToAdd) > -1) {
    response.code = 400;
    response.status = "user already in watcher list";
    socket.emit("add-watcher-to-list", response);
    return;
  }

  list.watchers.push(userToAdd);
  await listRep.save(list);
  socket.emit("add-watcher-to-list", response);
}

// add-item-to-list
export async function addItemToList(
  user: User,
  data: addItemToListRequest,
  socket: Socket
) {
  const connection: Connection = getConnection();
  let response: addItemToListResponce = { code: 200, status: "ok" };
  let listRep = await connection.getRepository(List);
  let itemRep = await connection.getRepository(Item);
  let list = await listRep.findOne(data.idList);

  if (!list) {
    response.code = 404;
    response.status = "not found";
    socket.emit("add-item-to-list", response);
    return;
  } else if (list.users.indexOf(user) == -1 && list.owner != user) {
    response.code = 401;
    response.status = "unauthorized";
    socket.emit("add-item-to-list", response);
    return;
  }

  let item = new Item();

  item.name = data.item.name;
  item.quantity = data.item.quantity;
  item.status = data.item.status;
  item.addBy = user;
  item.list = list;
  await itemRep.save(item);
  socket.emit("add-item-to-list", response);
}

// update-item
export async function updateItem(user: User, data: updateItemRequest, socket: Socket) {
	const connection: Connection = getConnection();
	let response: updateItemResponce = { code: 200, status: "ok" };
	let itemRep = await connection.getRepository(Item);
	let item = await itemRep.findOne(data.idItem);

	if (!item) {
		response.code = 404;
		response.status = "not found";
		socket.emit('update-item', response);
		return;
	}
	else if (item.list.users.indexOf(user) == -1 && item.list.owner != user) {
		response.code = 401;
		response.status = "unauthorized";
		socket.emit('update-item', response);
		return;
	}

	item.name = data.item.name;
	item.quantity = data.item.quantity;
	item.status = data.item.status;
	await itemRep.save(item);
	socket.emit('update-item', response);
}
