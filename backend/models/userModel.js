import { getPool, sql } from '../database/connectAzureSQL.js';
import bcrypt from 'bcrypt';

class User {
  constructor(userData) {
    this.id = userData.Id || userData.id;
    this.email = userData.Email || userData.email;
    this.password = userData.Password || userData.password;
    this.firstName = userData.FirstName || userData.firstName;
    this.lastName = userData.LastName || userData.lastName;
    this.studentNumber = userData.StudentNumber || userData.studentNumber;
    this.campus = userData.Campus || userData.campus;
    this.faculty = userData.Faculty || userData.faculty;
    this.yearOfStudy = userData.YearOfStudy || userData.yearOfStudy;
    this.lastLogin = userData.LastLogin || userData.lastLogin;
    this.isVerified = userData.IsVerified || userData.isVerified || false;
    this.isAdmin = userData.IsAdmin || userData.isAdmin || false;
    this.resetPasswordToken = userData.ResetPasswordToken || userData.resetPasswordToken;
    this.resetPasswordExpiresAt = userData.ResetPasswordExpiresAt || userData.resetPasswordExpiresAt;
    this.verificationToken = userData.VerificationToken || userData.verificationToken;
    this.verificationTokenExpiresAt = userData.VerificationTokenExpiresAt || userData.verificationTokenExpiresAt;
    this.createdAt = userData.CreatedAt || userData.createdAt;
    this.updatedAt = userData.UpdatedAt || userData.updatedAt;
  }

  // Create a new user
  static async create(userData) {
    try {
      const pool = await getPool();
      const request = pool.request();

      const result = await request
        .input('Email', sql.NVarChar(255), userData.email)
        .input('Password', sql.NVarChar(255), userData.password)
        .input('FirstName', sql.NVarChar(100), userData.firstName)
        .input('LastName', sql.NVarChar(100), userData.lastName)
        .input('StudentNumber', sql.NVarChar(50), userData.studentNumber || null)
        .input('Campus', sql.NVarChar(100), userData.campus || null)
        .input('Faculty', sql.NVarChar(100), userData.faculty || null)
        .input('YearOfStudy', sql.Int, userData.yearOfStudy || null)
        .input('VerificationToken', sql.NVarChar(255), userData.verificationToken || null)
        .input('VerificationTokenExpiresAt', sql.DateTime2, userData.verificationTokenExpiresAt || null)
        .query(`
          INSERT INTO Users (Email, Password, FirstName, LastName, StudentNumber, Campus, Faculty, YearOfStudy, VerificationToken, VerificationTokenExpiresAt)
          OUTPUT INSERTED.*
          VALUES (@Email, @Password, @FirstName, @LastName, @StudentNumber, @Campus, @Faculty, @YearOfStudy, @VerificationToken, @VerificationTokenExpiresAt)
        `);

      return new User(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const pool = await getPool();
      const request = pool.request();

      const result = await request
        .input('Email', sql.NVarChar(255), email)
        .query('SELECT * FROM Users WHERE Email = @Email');

      if (result.recordset.length === 0) {
        return null;
      }

      return new User(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }

  // Find user by verification token
  static async findByVerificationToken(token) {
    try {
      const pool = await getPool();
      const request = pool.request();
      const result = await request
        .input('VerificationToken', sql.NVarChar(255), token)
        .query('SELECT * FROM Users WHERE VerificationToken = @VerificationToken');
      if (result.recordset.length === 0) {
        return null;
      }
      return new User(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error finding user by verification token: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const pool = await getPool();
      const request = pool.request();

      const result = await request
        .input('Id', sql.UniqueIdentifier, id)
        .query('SELECT * FROM Users WHERE Id = @Id');

      if (result.recordset.length === 0) {
        return null;
      }

      return new User(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  // Find user by email and student number
  static async findByEmailAndStudentNumber(email, studentNumber) {
    try {
      const pool = await getPool();
      const request = pool.request();

      const result = await request
        .input('Email', sql.NVarChar(255), email)
        .input('StudentNumber', sql.NVarChar(50), studentNumber)
        .query('SELECT * FROM Users WHERE Email = @Email AND StudentNumber = @StudentNumber');

      if (result.recordset.length === 0) {
        return null;
      }

      return new User(result.recordset[0]);
    } catch (error) {
      throw new Error(`Error finding user by email and student number: ${error.message}`);
    }
  }

  // Update user
  async update(updateData) {
    try {
      const pool = await getPool();
      const request = pool.request();

      const setClause = [];
      const params = [];

      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          const sqlKey = key.charAt(0).toUpperCase() + key.slice(1); // Convert to PascalCase
          setClause.push(`${sqlKey} = @${sqlKey}`);
          
          // Determine SQL type based on key
          let sqlType = sql.NVarChar(255);
          if (key === 'yearOfStudy') sqlType = sql.Int;
          if (key === 'isVerified' || key === 'isAdmin') sqlType = sql.Bit;
          if (key.includes('ExpiresAt') || key.includes('Login')) sqlType = sql.DateTime2;
          
          request.input(sqlKey, sqlType, updateData[key]);
        }
      });

      if (setClause.length === 0) {
        return this;
      }

      const result = await request
        .input('Id', sql.UniqueIdentifier, this.id)
        .query(`
          UPDATE Users 
          SET ${setClause.join(', ')}
          OUTPUT INSERTED.*
          WHERE Id = @Id
        `);

      if (result.recordset.length > 0) {
        Object.assign(this, new User(result.recordset[0]));
      }

      return this;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete user
  async delete() {
    try {
      const pool = await getPool();
      const request = pool.request();

      await request
        .input('Id', sql.UniqueIdentifier, this.id)
        .query('DELETE FROM Users WHERE Id = @Id');

      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  // Compare password
  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
      throw new Error(`Error comparing password: ${error.message}`);
    }
  }

  // Convert to JSON (excluding sensitive fields)
  toJSON() {
    const userObject = { ...this };
    delete userObject.password;
    delete userObject.resetPasswordToken;
    delete userObject.verificationToken;
    return userObject;
  }
}

export { User };
