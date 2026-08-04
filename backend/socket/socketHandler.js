// backend/socket/socketHandler.js
const jwt = require('jsonwebtoken');

// Track connected users
const connectedUsers = new Map();

// 🔥 Now accepts `prisma` as parameter - matches your pattern
const initializeSocket = (io, prisma) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true, role: true }
      });
      
      if (!user) return next(new Error('User not found'));
      
      socket.userId = user.id;
      socket.userRole = user.role;
      socket.userEmail = user.email;
      socket.userName = user.name;
      
      next();
    } catch (error) {
      console.error('Socket auth error:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`✅ ${socket.userName} (${socket.userRole}) connected [${socket.id}]`);
    
    if (!connectedUsers.has(socket.userId)) {
      connectedUsers.set(socket.userId, {
        sockets: new Set(),
        role: socket.userRole,
        name: socket.userName,
      });
    }
    connectedUsers.get(socket.userId).sockets.add(socket.id);
    
    await joinUserRooms(socket, prisma);
    await sendUnreadCount(socket, prisma);
    
    socket.emit('connected', {
      userId: socket.userId,
      role: socket.userRole,
      message: 'Connected to LIMS real-time server',
    });

    socket.on('refreshRole', async () => {
      await refreshUserRole(socket, prisma);
    });
    
    socket.on('notification:markRead', async (notificationId) => {
      try {
        await prisma.notification.update({
          where: { id: notificationId },
          data: { isRead: true, readAt: new Date() }
        });
        await sendUnreadCount(socket, prisma);
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });
    
    socket.on('notification:markAllRead', async () => {
      try {
        await prisma.notification.updateMany({
          where: getUserNotificationFilter(socket.userId, socket.userRole),
          data: { isRead: true, readAt: new Date() }
        });
        await sendUnreadCount(socket, prisma);
      } catch (error) {
        console.error('Mark all read error:', error);
      }
    });

    socket.on('notification:getUnreadCount', async () => {
      await sendUnreadCount(socket, prisma);
    });
    
    socket.on('disconnect', () => {
      console.log(`❌ ${socket.userName} disconnected [${socket.id}]`);
      const userData = connectedUsers.get(socket.userId);
      if (userData) {
        userData.sockets.delete(socket.id);
        if (userData.sockets.size === 0) {
          connectedUsers.delete(socket.userId);
        }
      }
    });
  });
};

const joinUserRooms = async (socket, prisma) => {
  socket.join(`user:${socket.userId}`);
  socket.join(`role:${socket.userRole}`);
  
  try {
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId: socket.userId, enabled: true }
    });
    
    preferences.forEach(pref => {
      socket.join(`category:${pref.category}`);
    });
  } catch (error) {
    console.error('Load preferences error:', error);
  }
};

const refreshUserRole = async (socket, prisma) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: socket.userId },
      select: { role: true, name: true }
    });
    
    if (!user) return;
    
    const oldRole = socket.userRole;
    const newRole = user.role;
    
    if (oldRole !== newRole) {
      console.log(`🔄 Role change: ${socket.userName} ${oldRole} → ${newRole}`);
      
      socket.leave(`role:${oldRole}`);
      socket.join(`role:${newRole}`);
      
      socket.userRole = newRole;
      const userData = connectedUsers.get(socket.userId);
      if (userData) userData.role = newRole;
      
      socket.emit('role:changed', { oldRole, newRole });
      await sendUnreadCount(socket, prisma);
    }
  } catch (error) {
    console.error('Refresh role error:', error);
  }
};


const forceRoleRefresh = async (io, prisma, userId) => {
  const userData = connectedUsers.get(userId);
  if (!userData) return;
  
  for (const socketId of userData.sockets) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      await refreshUserRole(socket, prisma);
    }
  }
};

const getUserNotificationFilter = (userId, role) => ({
  OR: [
    { userId },
    { role, userId: null }
  ]
});

const sendUnreadCount = async (socket, prisma) => {
  try {
    const count = await prisma.notification.count({
      where: {
        ...getUserNotificationFilter(socket.userId, socket.userRole),
        isRead: false
      }
    });
    socket.emit('notification:unreadCount', count);
  } catch (error) {
    console.error('Send unread count error:', error);
  }
};

const isUserOnline = (userId) => connectedUsers.has(userId);

const getOnlineUsers = () => {
  return Array.from(connectedUsers.entries()).map(([userId, data]) => ({
    userId,
    role: data.role,
    name: data.name,
    connections: data.sockets.size,
  }));
};

module.exports = {
  initializeSocket,
  forceRoleRefresh,
  isUserOnline,
  getOnlineUsers,
};