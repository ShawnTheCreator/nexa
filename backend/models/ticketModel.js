import { getPool, sql } from '../database/connectAzureSQL.js';

class Ticket {
  constructor(ticketData) {
    this.id = ticketData.Id || ticketData.id;
    this.userId = ticketData.UserId || ticketData.userId;
    this.type = ticketData.Type || ticketData.type;
    this.category = ticketData.Category || ticketData.category;
    this.policyType = ticketData.PolicyType || ticketData.policyType;
    this.policyNumber = ticketData.PolicyNumber || ticketData.policyNumber;
    this.priority = ticketData.Priority || ticketData.priority || 'low';
    this.status = ticketData.Status || ticketData.status || 'open';
    this.description = ticketData.Description || ticketData.description;
    this.duration = ticketData.Duration || ticketData.duration;
    this.assignedTo = ticketData.AssignedTo || ticketData.assignedTo;
    this.attachmentUrls = ticketData.AttachmentUrls || ticketData.attachmentUrls;
    this.createdAt = ticketData.CreatedAt || ticketData.createdAt;
    this.updatedAt = ticketData.UpdatedAt || ticketData.updatedAt;
    this.resolvedAt = ticketData.ResolvedAt || ticketData.resolvedAt;
  }

  // Generate unique policy number
  static generatePolicyNumber() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `POL-${timestamp}-${random}`;
  }

  // Create a new ticket
  static async create(ticketData) {
    try {
      const pool = await getPool();
      const request = pool.request();

      // Generate policy number if not provided
      const policyNumber = ticketData.policyNumber || Ticket.generatePolicyNumber();

      const result = await request
        .input('UserId', sql.UniqueIdentifier, ticketData.userId)
        .input('Type', sql.NVarChar(50), ticketData.type)
        .input('Category', sql.NVarChar(50), ticketData.category)
        .input('PolicyType', sql.NVarChar(50), ticketData.policyType)
        .input('PolicyNumber', sql.NVarChar(50), policyNumber)
        .input('Priority', sql.NVarChar(20), ticketData.priority || 'low')
        .input('Description', sql.NVarChar(sql.MAX), ticketData.description)
        .input('Duration', sql.Int, ticketData.duration || null)
        .input('AttachmentUrls', sql.NVarChar(sql.MAX), ticketData.attachmentUrls || null)
        .query(`
          INSERT INTO Tickets (UserId, Type, Category, PolicyType, PolicyNumber, Priority, Description, Duration, AttachmentUrls)
          OUTPUT INSERTED.*
          VALUES (@UserId, @Type, @Category, @PolicyType, @PolicyNumber, @Priority, @Description, @Duration, @AttachmentUrls)
        `);

      return new Ticket(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error creating ticket: ${error.message}`);
    }
  }

  // Find ticket by ID
  static async findById(id) {
    try {
      const pool = await getPool();
      const request = pool.request();

      const result = await request
        .input('Id', sql.UniqueIdentifier, id)
        .query('SELECT * FROM Tickets WHERE Id = @Id');

      if (result.recordset.length === 0) {
        return null;
      }

      return new Ticket(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error finding ticket by ID: ${error.message}`);
    }
  }

  // Find tickets by user ID
  static async findByUserId(userId, options = {}) {
    try {
      const pool = await getPool();
      const request = pool.request();

      let query = 'SELECT * FROM Tickets WHERE UserId = @UserId';
      const conditions = [];
      
      request.input('UserId', sql.UniqueIdentifier, userId);

      // Add filters
      if (options.status) {
        conditions.push('Status = @Status');
        request.input('Status', sql.NVarChar(20), options.status);
      }

      if (options.priority) {
        conditions.push('Priority = @Priority');
        request.input('Priority', sql.NVarChar(20), options.priority);
      }

      if (options.type) {
        conditions.push('Type = @Type');
        request.input('Type', sql.NVarChar(50), options.type);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      // Add sorting
      const sortBy = options.sortBy || 'CreatedAt';
      const sortOrder = options.sortOrder || 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Add pagination
      if (options.limit) {
        query += ` OFFSET ${options.skip || 0} ROWS FETCH NEXT ${options.limit} ROWS ONLY`;
      }

      const result = await request.query(query);
      return result.recordset.map(ticket => new Ticket(ticket));
    } catch (error) {
      throw new Error(`Error finding tickets by user ID: ${error.message}`);
    }
  }

  // Find all tickets (admin function)
  static async findAll(options = {}) {
    try {
      const pool = await getPool();
      const request = pool.request();

      let query = 'SELECT * FROM Tickets';
      const conditions = [];

      // Add filters
      if (options.status) {
        conditions.push('Status = @Status');
        request.input('Status', sql.NVarChar(20), options.status);
      }

      if (options.priority) {
        conditions.push('Priority = @Priority');
        request.input('Priority', sql.NVarChar(20), options.priority);
      }

      if (options.assignedTo) {
        conditions.push('AssignedTo = @AssignedTo');
        request.input('AssignedTo', sql.UniqueIdentifier, options.assignedTo);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Add sorting
      const sortBy = options.sortBy || 'CreatedAt';
      const sortOrder = options.sortOrder || 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      // Add pagination
      if (options.limit) {
        query += ` OFFSET ${options.skip || 0} ROWS FETCH NEXT ${options.limit} ROWS ONLY`;
      }

      const result = await request.query(query);
      return result.recordset.map(ticket => new Ticket(ticket));
    } catch (error) {
      throw new Error(`Error finding all tickets: ${error.message}`);
    }
  }

  // Update ticket
  async update(updateData) {
    try {
      const pool = await getPool();
      const request = pool.request();

      const setClause = [];
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined && key !== 'id' && key !== 'userId' && key !== 'createdAt') {
          const sqlKey = key.charAt(0).toUpperCase() + key.slice(1); // Convert to PascalCase
          setClause.push(`${sqlKey} = @${sqlKey}`);
          
          // Determine SQL type based on key
          let sqlType = sql.NVarChar(255);
          if (key === 'duration') sqlType = sql.Int;
          if (key === 'description' || key === 'attachmentUrls') sqlType = sql.NVarChar(sql.MAX);
          if (key.includes('At')) sqlType = sql.DateTime2;
          if (key === 'userId' || key === 'assignedTo') sqlType = sql.UniqueIdentifier;
          
          request.input(sqlKey, sqlType, updateData[key]);
        }
      });

      if (setClause.length === 0) {
        return this;
      }

      const result = await request
        .input('Id', sql.UniqueIdentifier, this.id)
        .query(`
          UPDATE Tickets 
          SET ${setClause.join(', ')}
          OUTPUT INSERTED.*
          WHERE Id = @Id
        `);

      if (result.recordset.length > 0) {
        Object.assign(this, new Ticket(result.recordset[0]));
      }

      return this;
    } catch (error) {
      throw new Error(`Error updating ticket: ${error.message}`);
    }
  }

  // Delete ticket
  async delete() {
    try {
      const pool = await getPool();
      const request = pool.request();

      await request
        .input('Id', sql.UniqueIdentifier, this.id)
        .query('DELETE FROM Tickets WHERE Id = @Id');

      return true;
    } catch (error) {
      throw new Error(`Error deleting ticket: ${error.message}`);
    }
  }

  // Get ticket statistics for a user
  static async getStatsByUserId(userId) {
    try {
      const pool = await getPool();
      const request = pool.request();

      const result = await request
        .input('UserId', sql.UniqueIdentifier, userId)
        .query(`
          SELECT 
            Status,
            Priority,
            COUNT(*) as Count
          FROM Tickets 
          WHERE UserId = @UserId
          GROUP BY Status, Priority
        `);

      return result.recordset;
    } catch (error) {
      throw new Error(`Error getting ticket statistics: ${error.message}`);
    }
  }

  // Convert to JSON
  toJSON() {
    return { ...this };
  }
}

export { Ticket };