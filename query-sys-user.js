/**
 * 查询sys_user表记录数的脚本
 */
// 加载环境变量 - 确保在导入其他模块之前加载
require('dotenv').config();
const mysql = require('mysql2/promise');

// 打印环境变量信息，用于调试
console.log('环境变量信息:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已设置' : '未设置');
console.log('DB_NAME:', process.env.DB_NAME);

async function querySysUserCount() {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Junfeng123%',
      database: process.env.DB_NAME || 'qas-master'
    });

    console.log('数据库连接成功');
    console.log(`连接信息: ${process.env.DB_HOST}:${process.env.DB_PORT}, 用户: ${process.env.DB_USER}, 数据库: ${process.env.DB_NAME}`);

    // 查询sys_user表记录数
    const [rows] = await connection.execute('SELECT COUNT(*) AS total FROM sys_user');
    console.log(`sys_user表中共有 ${rows[0].total} 条记录`);

    // 查询sys_user表的前5条记录
    const [users] = await connection.execute('SELECT * FROM sys_user LIMIT 5');
    console.log('前5条记录:');
    console.log(JSON.stringify(users, null, 2));

    // 关闭连接
    await connection.end();
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

// 执行查询
querySysUserCount(); 