const UsersState = require("./users");

const buildMessage = ({ message, username }) => {
  return {
    message,
    username,
    timestamp: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
};

const activateUser = (name, id, room) => {
  const user = {
    id: id,
    name: name,
    room: room,
  };
  UsersState.setUsers([
    ...UsersState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
};

const getUser = (id) => {
  return UsersState.users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return UsersState.users.filter((user) => user.room === room);
};

const userLeavesApp = (id) => {
  const user = getUser(id);
  if (user) {
    UsersState.setUsers(UsersState.users.filter((user) => user.id !== id));
  }
  return user;
};

const buildActivityMessage = (username) => {
  return {
    message: `${username} is typing...`,
    username: username,
    timestamp: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
};

const getAllActiveRooms = () => {
  // const rooms = UsersState.users.reduce((acc, user) => {
  //     if (!acc.includes(user.room)) {
  //     acc.push(user.room);
  //     }
  //     return acc;
  // }, []);
  const rooms = [...new Set(UsersState.users.map((user) => user.room))];
  // // Sort rooms alphabetically
  // rooms.sort((a, b) => a.localeCompare(b));
  // Return the unique rooms
  return rooms;
};

module.exports = {
  UsersState,
  buildMessage,
  activateUser,
  getUser,
  getUsersInRoom,
  userLeavesApp,
  buildActivityMessage,
  getAllActiveRooms,
};
