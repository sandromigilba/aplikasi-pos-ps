const mariadb = require('mariadb');

async function test() {
  const url = new URL("mysql://396221q225vzden.root:JUOTwJpW3De09Fvu@gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com:4000/aplikasi_pos?sslaccept=strict");
  const pool = mariadb.createPool({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
    connectionLimit: 1
  });

  try {
    console.log('Testing mariadb driver directly...');
    const conn = await pool.getConnection();
    console.log('Connected!');
    const rows = await conn.query('SHOW TABLES;');
    console.log(rows);
    conn.release();
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await pool.end();
  }
}

test();
