/**
 * SSE路由
 */
const express = require('express');
const router = express.Router();
const sseService = require('../services/sse.service');
const { apiKeyAuth } = require('../middleware/auth.middleware');

// SSE连接端点
router.get('/sse', apiKeyAuth, (req, res) => {
  sseService.setupSSE(req, res);
});

module.exports = router; 