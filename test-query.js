/**
 * 测试MCP MySQL查询API
 */
const fetch = require('node-fetch');

async function testQueryAPI() {
  const apiKey = 'your-api-key-here';
  const baseUrl = 'http://localhost:3000/api';
  
  try {
    // 执行查询
    console.log('测试执行查询...');
    const queryBody = {
      sql: 'SELECT * FROM mcp_system.query_history',
      params: [],
      limit: 5,
      offset: 0
    };
    
    const queryRes = await fetch(`${baseUrl}/query`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': apiKey 
      },
      body: JSON.stringify(queryBody)
    });
    
    const queryData = await queryRes.json();
    console.log('查询结果:', JSON.stringify(queryData, null, 2));
    
  } catch (error) {
    console.error('测试查询API时出错:', error);
  }
}

testQueryAPI(); 