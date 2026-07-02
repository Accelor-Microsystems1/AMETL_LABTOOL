
const getNotifications = (prisma) => async (req, res) => {
  try {
    const { limit = 20, offset = 0, unreadOnly, category } = req.query;
    
    const where = {
      OR: [
        { userId: req.user.id },
        { role: req.user.role, userId: null }
      ]
    };
    
    if (unreadOnly === 'true') where.isRead = false;
    if (category) where.category = category;
    
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          OR: [
            { userId: req.user.id },
            { role: req.user.role, userId: null }
          ],
          isRead: false
        }
      })
    ]);
    
    res.status(200).json({ success: true, data: notifications, total, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
};

const markAsRead = (prisma) => async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() }
    });
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark as read' });
  }
};

const markAllAsRead = (prisma) => async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId: req.user.id },
          { role: req.user.role, userId: null }
        ],
        isRead: false
      },
      data: { isRead: true, readAt: new Date() }
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ success: false, error: 'Failed to mark all as read' });
  }
};

const deleteNotification = (prisma) => async (req, res) => {
  try {
    await prisma.notification.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notification' });
  }
};

const deleteAllNotifications = (prisma) => async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId: req.user.id },
          { role: req.user.role, userId: null }
        ]
      }
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete all error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete notifications' });
  }
};

const getPreferences = (prisma) => async (req, res) => {
  try {
    const preferences = await prisma.notificationPreference.findMany({
      where: { userId: req.user.id }
    });
    res.status(200).json({ success: true, data: preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch preferences' });
  }
};

const updatePreferences = (prisma) => async (req, res) => {
  try {
    const { category, enabled, channels } = req.body;
    
    const preference = await prisma.notificationPreference.upsert({
      where: {
        userId_category: { userId: req.user.id, category }
      },
      update: { enabled, channels },
      create: { userId: req.user.id, category, enabled, channels }
    });
    
    res.status(200).json({ success: true, data: preference });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: 'Failed to update preferences' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getPreferences,
  updatePreferences
};