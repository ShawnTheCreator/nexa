import { getPool, sql } from '../database/connectAzureSQL.js';

class Category {
  constructor(data) {
    this.id = data.Id || data.id;
    this.name = data.Name || data.name;
    this.type = data.Type || data.type;
    this.description = data.Description || data.description;
    this.isActive = data.IsActive ?? data.isActive ?? true;
    this.createdAt = data.CreatedAt || data.createdAt;
    this.updatedAt = data.UpdatedAt || data.updatedAt;
  }

  static async create({ name, type, description = null }) {
    const pool = await getPool();
    const request = pool.request();
    const result = await request
      .input('Name', sql.NVarChar(100), name)
      .input('Type', sql.NVarChar(50), type)
      .input('Description', sql.NVarChar(1000), description)
      .query(`
        INSERT INTO Categories (Name, Type, Description)
        OUTPUT INSERTED.*
        VALUES (@Name, @Type, @Description)
      `);
    return new Category(result.recordset[0]);
  }

  static async findAll({ includeInactive = false } = {}) {
    const pool = await getPool();
    const request = pool.request();
    const query = includeInactive ? 
      'SELECT * FROM Categories ORDER BY Name ASC' :
      'SELECT * FROM Categories WHERE IsActive = 1 ORDER BY Name ASC';
    const result = await request.query(query);
    return result.recordset.map(r => new Category(r));
  }

  static async findById(id) {
    const pool = await getPool();
    const request = pool.request();
    const result = await request
      .input('Id', sql.UniqueIdentifier, id)
      .query('SELECT * FROM Categories WHERE Id = @Id');
    if (result.recordset.length === 0) return null;
    return new Category(result.recordset[0]);
  }

  async update(updateData) {
    const pool = await getPool();
    const request = pool.request();
    const setClause = [];
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        const SqlKey = key.charAt(0).toUpperCase() + key.slice(1);
        setClause.push(`${SqlKey} = @${SqlKey}`);
        let type = sql.NVarChar(255);
        if (key === 'name') type = sql.NVarChar(100);
        if (key === 'type') type = sql.NVarChar(50);
        if (key === 'description') type = sql.NVarChar(1000);
        if (key === 'isActive') type = sql.Bit;
        request.input(SqlKey, type, updateData[key]);
      }
    });
    if (setClause.length === 0) return this;
    const result = await request
      .input('Id', sql.UniqueIdentifier, this.id)
      .query(`
        UPDATE Categories 
        SET ${setClause.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `);
    if (result.recordset.length > 0) Object.assign(this, new Category(result.recordset[0]));
    return this;
  }

  async archive() {
    const pool = await getPool();
    const request = pool.request();
    const result = await request
      .input('Id', sql.UniqueIdentifier, this.id)
      .query(`
        UPDATE Categories SET IsActive = 0
        OUTPUT INSERTED.*
        WHERE Id = @Id
      `);
    if (result.recordset.length > 0) Object.assign(this, new Category(result.recordset[0]));
    return this;
  }

  toJSON() {
    return { ...this };
  }
}

export { Category };