import { Ticket } from "../models/ticketModel.js";
import { azureBlobService } from "../services/azureBlobService.js";

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const {
      type,
      category,
      policyType,
      priority = 'low',
      description,
      duration
    } = req.body;

    // Validate required fields
    if (!type || !category || !policyType || !description) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: type, category, policyType, and description"
      });
    }

    // Handle file attachments if any
    let attachmentUrls = null;
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await azureBlobService.uploadMultipleFiles(
          req.files,
          'tickets',
          { userId: req.user.id, ticketType: type }
        );
        
        attachmentUrls = JSON.stringify(uploadResults.map(result => ({
          fileName: result.fileName,
          url: result.url,
          originalName: result.metadata.originalName,
          size: result.size,
          contentType: result.contentType
        })));
      } catch (uploadError) {
        console.error('File upload error:', uploadError.message);
        return res.status(400).json({
          success: false,
          message: "Error uploading attachments: " + uploadError.message
        });
      }
    }

    // Create ticket data
    const ticketData = {
      userId: req.user.id,
      type,
      category,
      policyType,
      priority,
      description,
      duration: duration ? parseInt(duration) : null,
      attachmentUrls
    };

    // Create ticket in database
    const ticket = await Ticket.create(ticketData);

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: ticket.toJSON()
    });
  } catch (error) {
    console.error('Create ticket error:', error.message);
    res.status(500).json({
      success: false,
      message: "Error creating ticket"
    });
  }
};

// Get tickets for the authenticated user
export const getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      type,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter options
    const options = {
      status,
      priority,
      type,
      sortBy,
      sortOrder,
      skip: (page - 1) * limit,
      limit: parseInt(limit)
    };

    // Remove undefined values
    Object.keys(options).forEach(key => {
      if (options[key] === undefined) {
        delete options[key];
      }
    });

    const tickets = await Ticket.findByUserId(req.user.id, options);

    res.status(200).json({
      success: true,
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: tickets.length
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching tickets"
    });
  }
};

// Get a specific ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    // Check if user owns this ticket
    if (ticket.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own tickets."
      });
    }

    res.status(200).json({
      success: true,
      ticket: ticket.toJSON()
    });
  } catch (error) {
    console.error('Get ticket by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching ticket"
    });
  }
};

// Update a ticket
export const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated by users
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.policyNumber;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    // Check if user owns this ticket
    if (ticket.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own tickets."
      });
    }

    // Update the ticket
    const updatedTicket = await ticket.update(updateData);

    res.status(200).json({
      success: true,
      message: "Ticket updated successfully",
      ticket: updatedTicket.toJSON()
    });
  } catch (error) {
    console.error('Update ticket error:', error.message);
    res.status(500).json({
      success: false,
      message: "Error updating ticket"
    });
  }
};

// Delete a ticket
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    // Check if user owns this ticket
    if (ticket.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own tickets."
      });
    }

    // Delete associated attachments from blob storage
    if (ticket.attachmentUrls) {
      try {
        const attachments = JSON.parse(ticket.attachmentUrls);
        const fileNames = attachments.map(att => att.fileName);
        if (fileNames.length > 0) {
          await azureBlobService.deleteMultipleFiles(fileNames, 'tickets');
        }
      } catch (parseError) {
        console.error('Error parsing attachment URLs for deletion:', parseError.message);
      }
    }

    // Delete the ticket
    await ticket.delete();

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully"
    });
  } catch (error) {
    console.error('Delete ticket error:', error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting ticket"
    });
  }
};

// Get ticket statistics for the user
export const getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.getStatsByUserId(req.user.id);

    // Process stats into a more useful format
    const processedStats = {
      total: 0,
      byStatus: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      byPriority: { low: 0, medium: 0, high: 0, critical: 0 }
    };

    stats.forEach(stat => {
      processedStats.total += stat.Count;
      processedStats.byStatus[stat.Status] = (processedStats.byStatus[stat.Status] || 0) + stat.Count;
      processedStats.byPriority[stat.Priority] = (processedStats.byPriority[stat.Priority] || 0) + stat.Count;
    });

    res.status(200).json({
      success: true,
      stats: processedStats
    });
  } catch (error) {
    console.error('Get ticket stats error:', error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching ticket statistics"
    });
  }
};

// Upload additional attachments to existing ticket
export const uploadAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided"
      });
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    // Check if user owns this ticket
    if (ticket.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only modify your own tickets."
      });
    }

    // Upload new files
    const uploadResults = await azureBlobService.uploadMultipleFiles(
      req.files,
      'tickets',
      { userId: req.user.id, ticketId: id }
    );

    // Get existing attachments
    let existingAttachments = [];
    if (ticket.attachmentUrls) {
      try {
        existingAttachments = JSON.parse(ticket.attachmentUrls);
      } catch (parseError) {
        console.error('Error parsing existing attachments:', parseError.message);
      }
    }

    // Add new attachments
    const newAttachments = uploadResults.map(result => ({
      fileName: result.fileName,
      url: result.url,
      originalName: result.metadata.originalName,
      size: result.size,
      contentType: result.contentType
    }));

    const allAttachments = [...existingAttachments, ...newAttachments];

    // Update ticket with new attachment URLs
    await ticket.update({
      attachmentUrls: JSON.stringify(allAttachments)
    });

    res.status(200).json({
      success: true,
      message: "Attachments uploaded successfully",
      attachments: newAttachments
    });
  } catch (error) {
    console.error('Upload attachment error:', error.message);
    res.status(500).json({
      success: false,
      message: "Error uploading attachments"
    });
  }
};

// Delete a specific attachment from a ticket
export const deleteAttachment = async (req, res) => {
  try {
    const { id, fileName } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    // Check if user owns this ticket
    if (ticket.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only modify your own tickets."
      });
    }

    if (!ticket.attachmentUrls) {
      return res.status(404).json({
        success: false,
        message: "No attachments found for this ticket"
      });
    }

    // Parse existing attachments
    let attachments;
    try {
      attachments = JSON.parse(ticket.attachmentUrls);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        message: "Error parsing attachment data"
      });
    }

    // Find and remove the attachment
    const attachmentIndex = attachments.findIndex(att => att.fileName === fileName);
    if (attachmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Attachment not found"
      });
    }

    // Remove from blob storage
    await azureBlobService.deleteFile(fileName, 'tickets');

    // Remove from attachments array
    attachments.splice(attachmentIndex, 1);

    // Update ticket
    await ticket.update({
      attachmentUrls: attachments.length > 0 ? JSON.stringify(attachments) : null
    });

    res.status(200).json({
      success: true,
      message: "Attachment deleted successfully"
    });
  } catch (error) {
    console.error('Delete attachment error:', error.message);
    res.status(500).json({
      success: false,
      message: "Error deleting attachment"
    });
  }
};