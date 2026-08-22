const express = require('express');
const db = require('../db');
const { auth } = require('../middleware');

const router = express.Router();

router.get('/', auth, (req, res) => {
  const notifications = db.prepare('SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 20').all(req.user.id);
  const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0').get(req.user.id).count;
  res.json({ notifications, unreadCount });
});

router.put('/mark-read', auth, (req, res) => {
  db.prepare('UPDATE notifications SET isRead = 1 WHERE userId = ?').run(req.user.id);
  res.json({ message: 'All notifications marked as read' });
});

module.exports = router;
