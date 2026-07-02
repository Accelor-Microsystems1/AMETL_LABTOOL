const createNotification = async (io, prisma, options) => {
  const {
    userId, role, userIds, roles,
    category, event, title, message,
    priority = 'MEDIUM',
    icon, color,
    relatedId, relatedType, actionUrl,
    metadata, createdById,
  } = options;
  
  if (!category || !event || !title || !message) {
    console.error('Notification missing required fields');
    return [];
  }
  
  if (!userId && !role && !userIds?.length && !roles?.length) {
    console.error(' Notification has no recipient');
    return [];
  }
  
  const notifications = [];
  const baseData = {
    category, event, title, message,
    priority, icon, color,
    relatedId: relatedId ? String(relatedId) : null,
    relatedType, actionUrl, metadata,
    createdById,
  };
  
  try {
    if (userIds && userIds.length > 0) {
      for (const uid of userIds) {
        const notif = await prisma.notification.create({
          data: { ...baseData, userId: uid }
        });
        io.to(`user:${uid}`).emit('notification:new', notif);
        notifications.push(notif);
      }
    }
    
    if (roles && roles.length > 0) {
      for (const r of roles) {
        const notif = await prisma.notification.create({
          data: { ...baseData, role: r }
        });
        io.to(`role:${r}`).emit('notification:new', notif);
        notifications.push(notif);
      }
    }
    
    if (userId && !userIds?.includes(userId)) {
      const notif = await prisma.notification.create({
        data: { ...baseData, userId }
      });
      io.to(`user:${userId}`).emit('notification:new', notif);
      notifications.push(notif);
    }
    
    if (role && !roles?.includes(role)) {
      const notif = await prisma.notification.create({
        data: { ...baseData, role }
      });
      io.to(`role:${role}`).emit('notification:new', notif);
      notifications.push(notif);
    }
    
    if (notifications.length > 0) {
      io.to(`category:${category}`).emit('notification:new', notifications[0]);
    }
    
    console.log(` Notification sent: [${category}:${event}] to ${notifications.length} recipients`);
    return notifications;
  } catch (error) {
    console.error(' createNotification error:', error);
    return [];
  }
};

const broadcast = (io, target, event, data) => {
  if (target.user) io.to(`user:${target.user}`).emit(event, data);
  if (target.users && Array.isArray(target.users)) {
    target.users.forEach(u => io.to(`user:${u}`).emit(event, data));
  }
  if (target.role) io.to(`role:${target.role}`).emit(event, data);
  if (target.roles && Array.isArray(target.roles)) {
    target.roles.forEach(r => io.to(`role:${r}`).emit(event, data));
  }
  if (target.category) io.to(`category:${target.category}`).emit(event, data);
  if (target.all) io.emit(event, data);
};

const updateNotification = async (io, prisma, notificationId, updates) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: updates,
    });
    
    if (notification.userId) {
      io.to(`user:${notification.userId}`).emit('notification:updated', notification);
    } else if (notification.role) {
      io.to(`role:${notification.role}`).emit('notification:updated', notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Update notification error:', error);
    return null;
  }
};

module.exports = {
  createNotification,
  broadcast,
  updateNotification,
};