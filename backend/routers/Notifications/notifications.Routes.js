const express = require('express');
const {authMiddleware} = require('../../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getPreferences,
  updatePreferences,
} = require('../../controllers/Notification/notification.Controller');

function NotificationsRouter(prisma) {
  const router = express.Router();

router.get('/',               authMiddleware, getNotifications(prisma));
router.get('/preferences',    authMiddleware, getPreferences(prisma));

router.put('/:id/read',       authMiddleware, markAsRead(prisma));
router.put('/read-all',       authMiddleware, markAllAsRead(prisma));
router.put('/preferences',    authMiddleware, updatePreferences(prisma));

router.delete('/:id',         authMiddleware, deleteNotification(prisma));
router.delete('/',            authMiddleware, deleteAllNotifications(prisma));

return router;
}

module.exports = {NotificationsRouter};