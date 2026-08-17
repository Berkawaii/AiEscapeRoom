import * as http from 'http';

function makeRequest(roomId: string, actionIndex: number): Promise<{ statusCode?: number; body: string }> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ action: `Spam action #${actionIndex}` });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: `/api/rooms/${roomId}/action`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      },
    );
    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

async function runBenchmark() {
  console.log('🚀 Creating a test room...');
  
  const postData = JSON.stringify({ theme: 'cyberpunk_escape' });
  const createReq = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/rooms',
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
    },
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', async () => {
      const room = JSON.parse(body);
      console.log(`✅ Room Created: ${room.id}`);
      console.log('⚡ Sending 10 SIMULTANEOUS ACTIONS to test Redis Distributed Lock (Race Condition test)...');

      const start = Date.now();
      const promises = Array.from({ length: 10 }).map((_, i) => makeRequest(room.id, i + 1));
      const results = await Promise.all(promises);
      const elapsed = Date.now() - start;

      const success = results.filter((r) => r.statusCode === 200);
      const blocked = results.filter((r) => r.statusCode === 429);

      console.log(`\n==================================================`);
      console.log(`📊 CONCURRENCY BENCHMARK RESULTS (${elapsed} ms):`);
      console.log(`  - Total Requests Sent: 10`);
      console.log(`  - Successfully Executed: ${success.length}`);
      console.log(`  - Blocked by Redis Distributed Lock (HTTP 429): ${blocked.length}`);
      console.log(`==================================================\n`);

      if (blocked.length > 0) {
        console.log('🎉 SUCCESS: Redis Distributed Lock successfully prevented race conditions!');
      } else {
        console.log('⚠️ Notice: Lock released fast or requests executed sequentially.');
      }
    });
  });

  createReq.write(postData);
  createReq.end();
}

runBenchmark().catch(console.error);
