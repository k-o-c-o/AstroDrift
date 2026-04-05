const PROXIMITY_RADIUS = 150;

function getDistance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

function getRoomId(idA, idB) {
  return [idA, idB].sort().join('--');
}

function checkProximity(socketId, users) {
  const user = users[socketId];
  if (!user) return { toConnect: [], toDisconnect: [] };

  const toConnect = [];
  const toDisconnect = [];

  Object.entries(users).forEach(([otherId, other]) => {
    if (otherId === socketId) return;

    const dist = getDistance(user, other);
    const roomId = getRoomId(socketId, otherId);

    if (dist < PROXIMITY_RADIUS) {
      toConnect.push({ otherId, roomId, otherUser: other });
    } else {
      if (user.connectedTo === otherId) {
        toDisconnect.push({ otherId, roomId });
      }
    }
  });

  return { toConnect, toDisconnect };
}

module.exports = { checkProximity, getRoomId, PROXIMITY_RADIUS };