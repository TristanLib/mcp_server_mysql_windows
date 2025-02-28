/**
 * 测试MCP MySQL API
 */
const fetch = require('node-fetch');

async function testAPI() {
  const apiKey = 'your-api-key-here';
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    // 测试状态API
    console.log('测试状态API...');
    const statusRes = await fetch(`${baseUrl}/status`);
    const statusData = await statusRes.json();
    console.log('状态:', JSON.stringify(statusData, null, 2));
    
    // 测试获取数据库列表
    console.log('\n测试获取数据库列表...');
    const dbRes = await fetch(`${baseUrl}/databases`, {
      headers: { 'x-api-key': apiKey }
    });
    const dbData = await dbRes.json();
    console.log('数据库列表:', JSON.stringify(dbData, null, 2));
    
    // 测试获取表列表
    console.log('\n测试获取表列表...');
    const tablesRes = await fetch(`${baseUrl}/databases/mcp_system/tables`, {
      headers: { 'x-api-key': apiKey }
    });
    const tablesData = await tablesRes.json();
    console.log('表列表:', JSON.stringify(tablesData, null, 2));
    
    // 如果有表，测试获取表结构
    if (tablesData.success && tablesData.data.length > 0) {
      const tableName = tablesData.data[0];
      console.log(`\n测试获取表 "${tableName}" 的结构...`);
      const structureRes = await fetch(`${baseUrl}/databases/mcp_system/tables/${tableName}/structure`, {
        headers: { 'x-api-key': apiKey }
      });
      const structureData = await structureRes.json();
      console.log('表结构:', JSON.stringify(structureData, null, 2));
    }
    
  } catch (error) {
    console.error('测试API时出错:', error);
  }
}

testAPI(); 