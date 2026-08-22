const express = require('express');
const db = require('../db');
const { auth } = require('../middleware');

const router = express.Router();

// Get all notifications & unread count
router.get('/', auth, (req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0').get(req.user.id)?.count || 0;
  res.json({ notifications, unreadCount });
});

// Mark all notifications as read
router.put('/mark-read', auth, (req, res) => {
  db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(req.user.id);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0').get(req.user.id)?.count || 0;
  res.json({ message: 'All notifications marked as read', unreadCount });
});

// Clear all notifications for user (MUST be before /:id)
router.delete('/clear-all', auth, (req, res) => {
  db.prepare('DELETE FROM notifications WHERE userId = ?').run(req.user.id);
  res.json({ message: 'All notifications cleared successfully', unreadCount: 0 });
});

// Mark single notification as read
router.put('/:id/read', auth, (req, res) => {
  db.prepare('UPDATE notifications SET isRead = 1 WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0').get(req.user.id)?.count || 0;
  res.json({ message: 'Notification marked as read', unreadCount });
});

// Delete individual notification
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM notifications WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0').get(req.user.id)?.count || 0;
  res.json({ message: 'Notification deleted successfully', unreadCount });
});

module.exports = router;
