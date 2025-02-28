/**
 * 数据库控制器
 * 处理数据库相关API请求
 */
const dbService = require('../services/db.service');

/**
 * 获取所有数据库
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function getDatabases(req, res) {
  try {
    const databases = await dbService.getDatabases();
    
    // 格式化结果为更友好的格式
    const formattedDatabases = databases.map(db => {
      const key = Object.keys(db)[0];
      return db[key];
    });
    
    res.json({
      success: true,
      data: formattedDatabases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取数据库列表失败',
      error: error.message
    });
  }
}

/**
 * 获取数据库表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function getTables(req, res) {
  try {
    const { database } = req.params;
    const tables = await dbService.getTables(database);
    
    // 格式化结果
    const formattedTables = tables.map(table => {
      const key = Object.keys(table)[0];
      return table[key];
    });
    
    res.json({
      success: true,
      database,
      data: formattedTables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取表列表失败',
      error: error.message
    });
  }
}

/**
 * 获取表结构
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function getTableStructure(req, res) {
  try {
    const { database, table } = req.params;
    const structure = await dbService.getTableStructure(table, database);
    
    res.json({
      success: true,
      database,
      table,
      data: structure
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取表结构失败',
      error: error.message
    });
  }
}

/**
 * 执行SQL查询
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
async function executeQuery(req, res) {
  try {
    const { sql, params = [], limit = 100, offset = 0 } = req.body;
    
    if (!sql) {
      return res.status(400).json({
        success: false,
        message: 'SQL查询语句不能为空'
      });
    }
    
    // 简单的SQL注入检查
    if (sql.toLowerCase().includes('drop') || 
        sql.toLowerCase().includes('truncate') ||
        sql.toLowerCase().includes('delete') ||
        sql.toLowerCase().includes('update') ||
        sql.toLowerCase().includes('insert')) {
      return res.status(403).json({
        success: false,
        message: '只允许执行SELECT查询'
      });
    }
    
    // 执行查询
    const result = await dbService.executeSelect(sql, params, limit, offset);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '执行查询失败',
      error: error.message
    });
  }
}

module.exports = {
  getDatabases,
  getTables,
  getTableStructure,
  executeQuery
}; 