/**
 * 数据库服务
 * 提供基本的数据库操作函数
 */
const { pool } = require('../config/db.config');

/**
 * 执行SQL查询
 * @param {string} sql - SQL查询语句
 * @param {Array} params - 查询参数
 * @returns {Promise<Array>} - 查询结果
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('查询执行错误:', error.message);
    throw error;
  }
}

/**
 * 获取所有数据库
 * @returns {Promise<Array>} - 数据库列表
 */
async function getDatabases() {
  try {
    const sql = 'SHOW DATABASES';
    return await query(sql);
  } catch (error) {
    console.error('获取数据库列表错误:', error.message);
    throw error;
  }
}

/**
 * 获取指定数据库的所有表
 * @param {string} database - 数据库名称
 * @returns {Promise<Array>} - 表列表
 */
async function getTables(database) {
  try {
    let sql;
    let params = [];
    
    if (database) {
      sql = `SHOW TABLES FROM ${database}`;
    } else {
      sql = 'SHOW TABLES';
    }
    
    return await query(sql, params);
  } catch (error) {
    console.error('获取表列表错误:', error.message);
    throw error;
  }
}

/**
 * 获取表结构信息
 * @param {string} table - 表名
 * @param {string} database - 数据库名称 (可选)
 * @returns {Promise<Array>} - 表结构信息
 */
async function getTableStructure(table, database) {
  try {
    let sql, params;
    
    if (database) {
      sql = `DESCRIBE ${database}.${table}`;
      params = [];
    } else {
      sql = 'DESCRIBE ??';
      params = [table];
    }
    
    return await query(sql, params);
  } catch (error) {
    console.error('获取表结构错误:', error.message);
    throw error;
  }
}

/**
 * 执行SELECT查询
 * @param {string} sql - SELECT查询语句
 * @param {Array} params - 查询参数
 * @param {number} limit - 限制返回的行数
 * @param {number} offset - 跳过的行数
 * @returns {Promise<Object>} - 查询结果和总数
 */
async function executeSelect(sql, params = [], limit = 100, offset = 0) {
  try {
    // 复制参数数组，不修改原数组
    const queryParams = [...params];
    
    // 替换sql语句中的LIMIT和OFFSET占位符
    let processedSql = sql;
    if (sql.toUpperCase().includes('LIMIT ?')) {
      // 找到LIMIT ?的位置，替换为具体的数字
      processedSql = processedSql.replace(/LIMIT\s+\?/i, `LIMIT ${limit}`);
      // 从params中删除对应的参数
      const limitIndex = queryParams.findIndex((_, i) => 
        sql.toUpperCase().indexOf('LIMIT ?') < 
        getPositionOfNthQuestionMark(sql, i + 1)
      );
      if (limitIndex !== -1) {
        queryParams.splice(limitIndex, 1);
      }
    } else {
      // 如果没有LIMIT子句，添加一个
      processedSql = `${processedSql} LIMIT ${limit}`;
    }
    
    if (processedSql.toUpperCase().includes('OFFSET ?')) {
      // 找到OFFSET ?的位置，替换为具体的数字
      processedSql = processedSql.replace(/OFFSET\s+\?/i, `OFFSET ${offset}`);
      // 从params中删除对应的参数
      const offsetIndex = queryParams.findIndex((_, i) => 
        processedSql.toUpperCase().indexOf('OFFSET ?') < 
        getPositionOfNthQuestionMark(processedSql, i + 1)
      );
      if (offsetIndex !== -1) {
        queryParams.splice(offsetIndex, 1);
      }
    } else if (processedSql.toUpperCase().includes('LIMIT')) {
      // 如果有LIMIT但没有OFFSET子句，添加一个
      processedSql = `${processedSql} OFFSET ${offset}`;
    }
    
    // 执行查询
    const rows = await query(processedSql, queryParams);
    
    // 获取总记录数（移除LIMIT和OFFSET子句）
    let countSql = sql.replace(/LIMIT\s+.*$/i, '').replace(/OFFSET\s+.*$/i, '');
    if (!countSql.toUpperCase().startsWith('SELECT COUNT')) {
      countSql = `SELECT COUNT(*) as total FROM (${countSql}) as count_query`;
    }
    const countResult = await query(countSql, params.filter((_, i) => 
      i < params.length - (sql.toUpperCase().includes('LIMIT ?') ? 1 : 0) - (sql.toUpperCase().includes('OFFSET ?') ? 1 : 0)
    ));
    
    const total = countResult[0]?.total || 0;
    
    return {
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('执行SELECT查询错误:', error.message);
    throw error;
  }
}

/**
 * 获取第n个问号的位置
 * @param {string} str - 输入字符串
 * @param {number} n - 第几个问号
 * @returns {number} - 问号的位置，如果没有找到返回-1
 */
function getPositionOfNthQuestionMark(str, n) {
  let pos = -1;
  for (let i = 0; i < n; i++) {
    pos = str.indexOf('?', pos + 1);
    if (pos === -1) break;
  }
  return pos;
}

module.exports = {
  query,
  getDatabases,
  getTables,
  getTableStructure,
  executeSelect
}; 