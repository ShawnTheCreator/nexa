import { getPool, sql } from '../database/connectAzureSQL.js';

export async function listUsers(req, res) {
  try {
    const q = (req.query.q || '').trim();
    const pool = await getPool();
    const request = pool.request();
    if (q) {
      request.input('Query', sql.NVarChar(255), `%${q}%`);
      const result = await request.query("SELECT Id, FirstName, LastName, ProfilePicUrl FROM dbo.Users WHERE FirstName LIKE @Query OR LastName LIKE @Query ORDER BY FirstName");
      return res.status(200).json({ success: true, data: result.recordset });
    }
    const result = await pool.request().query('SELECT Id, FirstName, LastName, ProfilePicUrl FROM dbo.Users ORDER BY FirstName');
    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('listUsers error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to list users' });
  }
}
