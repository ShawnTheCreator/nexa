import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: process.env.AZURE_SQL_SERVER || 'nexa-sqlserver.database.windows.net',
  database: process.env.AZURE_SQL_DATABASE || 'Nexa',
  authentication: {
    type: 'default',
    options: {
      userName: process.env.AZURE_SQL_USERNAME,
      password: process.env.AZURE_SQL_PASSWORD,
    }
  },
  options: {
    encrypt: true, // Required for Azure SQL
    trustServerCertificate: false,
    enableArithAbort: true,
    port: 1433,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise;

const connectAzureSQL = async () => {
  try {
    if (!poolPromise) {
      poolPromise = new sql.ConnectionPool(config).connect();
    }
    
    const pool = await poolPromise;
    console.log(`Azure SQL Database Connected: ${config.server}/${config.database}`);
    return pool;
  } catch (error) {
    console.error('Error connecting to Azure SQL Database:', error.message);
    process.exit(1);
  }
};

const getPool = async () => {
  if (!poolPromise) {
    await connectAzureSQL();
  }
  return poolPromise;
};

export { connectAzureSQL, getPool, sql };