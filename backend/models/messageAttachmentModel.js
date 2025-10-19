import { getPool, sql } from '../database/connectAzureSQL.js';

class MessageAttachment {
  constructor({ id, messageId, url, fileName, contentType, size, createdAt }) {
    this.id = id;
    this.messageId = messageId;
    this.url = url;
    this.fileName = fileName;
    this.contentType = contentType;
    this.size = size;
    this.createdAt = createdAt;
  }

  static async create({ messageId, url, fileName, contentType, size }) {
    const pool = await getPool();
    const result = await pool.request()
      .input('MessageId', sql.UniqueIdentifier, messageId)
      .input('Url', sql.NVarChar(sql.MAX), url)
      .input('FileName', sql.NVarChar(500), fileName)
      .input('ContentType', sql.NVarChar(255), contentType)
      .input('Size', sql.BigInt, size)
      .query(`INSERT INTO dbo.MessageAttachments (MessageId, Url, FileName, ContentType, Size)
              OUTPUT INSERTED.*
              VALUES (@MessageId, @Url, @FileName, @ContentType, @Size)`);

    return new MessageAttachment(MessageAttachment._mapRecord(result.recordset[0]));
  }

  static async findByMessageId({ messageId }) {
    const pool = await getPool();
    const result = await pool.request()
      .input('MessageId', sql.UniqueIdentifier, messageId)
      .query(`SELECT * FROM dbo.MessageAttachments WHERE MessageId = @MessageId ORDER BY CreatedAt ASC`);
    return result.recordset.map(MessageAttachment._mapRecord);
  }

  static _mapRecord(rec) {
    return new MessageAttachment({
      id: rec.Id,
      messageId: rec.MessageId,
      url: rec.Url,
      fileName: rec.FileName,
      contentType: rec.ContentType,
      size: rec.Size,
      createdAt: rec.CreatedAt
    });
  }
}

export { MessageAttachment };
