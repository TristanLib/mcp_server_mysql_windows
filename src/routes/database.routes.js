/**
 * 数据库API路由
 */
const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/database.controller');

// 获取所有数据库
router.get('/databases', databaseController.getDatabases);

// 获取指定数据库的所有表
router.get('/databases/:database/tables', databaseController.getTables);

// 获取表结构
router.get('/databases/:database/tables/:table/structure', databaseController.getTableStructure);

// 执行查询
router.post('/query', databaseController.executeQuery);

module.exports = router; 