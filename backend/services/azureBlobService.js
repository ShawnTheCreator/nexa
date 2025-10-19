import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import crypto from 'crypto';
import path from 'path';

class AzureBlobService {
  constructor() {
    this.accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'nexastorage2025';
    this.accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    this.connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.isConfigured = false;
    
    // Initialize BlobServiceClient
    if (this.connectionString) {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      this.isConfigured = true;
    } else if (this.accountName && this.accountKey) {
      const credential = new StorageSharedKeyCredential(this.accountName, this.accountKey);
      this.blobServiceClient = new BlobServiceClient(
        `https://${this.accountName}.blob.core.windows.net`,
        credential
      );
      this.isConfigured = true;
    } else {
      // Not configured – allow server to start, but storage ops will be disabled
      this.blobServiceClient = null;
      this.isConfigured = false;
    }

    // Container names
    this.containers = {
      tickets: 'ticket-attachments',
      profiles: 'user-profiles',
      temp: 'temp-uploads',
      ideaAttachments: 'idea-attachments',
      ideaVideos: 'idea-videos',
      messageAttachments: 'message-attachments'
    };
  }

  // Initialize containers if they don't exist
  async initializeContainers() {
    try {
      if (!this.blobServiceClient || !this.isConfigured) {
        console.warn('Azure Blob Storage not configured; skipping container initialization');
        return;
      }
      for (const [key, containerName] of Object.entries(this.containers)) {
        const containerClient = this.blobServiceClient.getContainerClient(containerName);
        
        // Create container if it doesn't exist
        const exists = await containerClient.exists();
        if (!exists) {
          await containerClient.create({
            access: 'blob' // Allow public read access to blobs
          });
          console.log(`Container '${containerName}' created successfully`);
        }
      }
    } catch (error) {
      console.error('Error initializing containers:', error.message);
      throw error;
    }
  }

  // Generate unique filename
  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    
    // Sanitize filename
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    return `${timestamp}_${randomString}_${sanitizedBaseName}${extension}`;
  }

  // Upload file to blob storage
  async uploadFile(file, containerType = 'tickets', metadata = {}) {
    try {
      if (!this.blobServiceClient || !this.isConfigured) {
        throw new Error('Azure Storage not configured');
      }
      const containerName = this.containers[containerType];
      if (!containerName) {
        throw new Error(`Invalid container type: ${containerType}`);
      }

      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      
      // Generate unique filename
      const fileName = this.generateUniqueFileName(file.originalname || file.name || 'unnamed');
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      // Determine content type
      const contentType = file.mimetype || this.getContentType(fileName);

      // Upload options
      const uploadOptions = {
        blobHTTPHeaders: {
          blobContentType: contentType
        },
        metadata: {
          originalName: file.originalname || file.name || 'unnamed',
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      };

      // Upload the file
      const uploadResponse = await blockBlobClient.upload(
        file.buffer || file.data,
        file.size || file.buffer?.length || file.data?.length,
        uploadOptions
      );

      return {
        fileName,
        url: blockBlobClient.url,
        containerName,
        contentType,
        size: file.size || file.buffer?.length || file.data?.length,
        uploadedAt: new Date().toISOString(),
        etag: uploadResponse.etag,
        metadata: uploadOptions.metadata
      };
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(files, containerType = 'tickets', metadata = {}) {
    try {
      if (!this.blobServiceClient || !this.isConfigured) {
        throw new Error('Azure Storage not configured');
      }
      const uploadPromises = files.map(file => 
        this.uploadFile(file, containerType, metadata)
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Error uploading multiple files:', error.message);
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }

  // Download file from blob storage
  async downloadFile(fileName, containerType = 'tickets') {
    try {
      if (!this.blobServiceClient || !this.isConfigured) {
        throw new Error('Azure Storage not configured');
      }
      const containerName = this.containers[containerType];
      if (!containerName) {
        throw new Error(`Invalid container type: ${containerType}`);
      }

      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      // Check if blob exists
      const exists = await blockBlobClient.exists();
      if (!exists) {
        throw new Error(`File '${fileName}' not found`);
      }

      // Download the blob
      const downloadResponse = await blockBlobClient.download();
      
      return {
        fileName,
        contentType: downloadResponse.contentType,
        contentLength: downloadResponse.contentLength,
        lastModified: downloadResponse.lastModified,
        metadata: downloadResponse.metadata,
        stream: downloadResponse.readableStreamBody
      };
    } catch (error) {
      console.error('Error downloading file:', error.message);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  // Delete file from blob storage
  async deleteFile(fileName, containerType = 'tickets') {
    try {
      if (!this.blobServiceClient || !this.isConfigured) {
        throw new Error('Azure Storage not configured');
      }
      const containerName = this.containers[containerType];
      if (!containerName) {
        throw new Error(`Invalid container type: ${containerType}`);
      }

      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);

      // Delete the blob
      const deleteResponse = await blockBlobClient.delete();
      
      return {
        fileName,
        deleted: true,
        deletedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(fileNames, containerType = 'tickets') {
    try {
      if (!this.blobServiceClient || !this.isConfigured) {
        throw new Error('Azure Storage not configured');
      }
      const deletePromises = fileNames.map(fileName => 
        this.deleteFile(fileName, containerType)
      );
      
      const results = await Promise.all(deletePromises);
      return results;
    } catch (error) {
      console.error('Error deleting multiple files:', error.message);
      throw new Error(`Failed to delete files: ${error.message}`);
    }
  }

  // List files in container
  async listFiles(containerType = 'tickets', prefix = '') {
    try {
      if (!this.blobServiceClient || !this.isConfigured) {
        throw new Error('Azure Storage not configured');
      }
      const containerName = this.containers[containerType];
      if (!containerName) {
        throw new Error(`Invalid container type: ${containerType}`);
      }

      const containerClient = this.blobServiceClient.getContainerClient(containerName);
      const files = [];

      // List blobs with optional prefix
      const listOptions = prefix ? { prefix } : {};
      
      for await (const blob of containerClient.listBlobsFlat(listOptions)) {
        files.push({
          name: blob.name,
          url: `${containerClient.url}/${blob.name}`,
          contentType: blob.properties.contentType,
          contentLength: blob.properties.contentLength,
          lastModified: blob.properties.lastModified,
          etag: blob.properties.etag,
          metadata: blob.metadata
        });
      }

      return files;
    } catch (error) {
      console.error('Error listing files:', error.message);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  // Get file URL (for public access)
  getFileUrl(fileName, containerType = 'tickets') {
    const containerName = this.containers[containerType];
    if (!containerName) {
      throw new Error(`Invalid container type: ${containerType}`);
    }

    return `https://${this.accountName}.blob.core.windows.net/${containerName}/${fileName}`;
  }

  // Get content type based on file extension
  getContentType(fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.zip': 'application/zip',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo'
    };

    return contentTypes[ext] || 'application/octet-stream';
  }

  // Validate file type and size
  validateFile(file, allowedTypes = [], maxSize = 10 * 1024 * 1024) { // 10MB default
    const errors = [];

    // Check file size
    const fileSize = file.size || file.buffer?.length || file.data?.length || 0;
    if (fileSize > maxSize) {
      errors.push(`File size (${Math.round(fileSize / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`);
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const fileName = file.originalname || file.name || '';
      const fileExtension = path.extname(fileName).toLowerCase();
      const mimeType = file.mimetype || this.getContentType(fileName);

      const isValidExtension = allowedTypes.some(type => 
        type.startsWith('.') ? type === fileExtension : mimeType.includes(type)
      );

      if (!isValidExtension) {
        errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const azureBlobService = new AzureBlobService();

export { azureBlobService, AzureBlobService };