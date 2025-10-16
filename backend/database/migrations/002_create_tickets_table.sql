-- Create Tickets table
CREATE TABLE Tickets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    
    -- Ticket classification
    Type NVARCHAR(50) NOT NULL CHECK (Type IN ('support', 'billing', 'technical', 'general')),
    Category NVARCHAR(50) NOT NULL CHECK (Category IN ('claims', 'quotes', 'policy_changes', 'billing_inquiry', 'technical_support', 'general_inquiry')),
    PolicyType NVARCHAR(50) NOT NULL CHECK (PolicyType IN ('life', 'home', 'auto', 'business', 'health', 'travel')),
    
    -- Auto-generated policy number
    PolicyNumber NVARCHAR(50) NOT NULL UNIQUE,
    
    -- Priority and status
    Priority NVARCHAR(20) NOT NULL DEFAULT 'low' CHECK (Priority IN ('low', 'medium', 'high', 'critical')),
    Status NVARCHAR(20) NOT NULL DEFAULT 'open' CHECK (Status IN ('open', 'in_progress', 'resolved', 'closed')),
    
    -- Ticket content
    Description NVARCHAR(MAX) NOT NULL,
    Duration INT NULL CHECK (Duration >= 0), -- minutes
    
    -- Assignment
    AssignedTo UNIQUEIDENTIFIER NULL,
    
    -- File attachments (stored in Azure Blob Storage)
    AttachmentUrls NVARCHAR(MAX) NULL, -- JSON array of blob URLs
    
    -- Timestamps
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    ResolvedAt DATETIME2 NULL,
    
    -- Foreign key constraints
    CONSTRAINT FK_Tickets_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Tickets_AssignedTo FOREIGN KEY (AssignedTo) REFERENCES Users(Id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IX_Tickets_UserId ON Tickets(UserId);
CREATE INDEX IX_Tickets_Status ON Tickets(Status);
CREATE INDEX IX_Tickets_Priority ON Tickets(Priority);
CREATE INDEX IX_Tickets_CreatedAt ON Tickets(CreatedAt DESC);
CREATE INDEX IX_Tickets_PolicyNumber ON Tickets(PolicyNumber);
CREATE INDEX IX_Tickets_AssignedTo ON Tickets(AssignedTo) WHERE AssignedTo IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IX_Tickets_User_Status ON Tickets(UserId, Status);
CREATE INDEX IX_Tickets_Status_Priority ON Tickets(Status, Priority);

-- Create trigger to update UpdatedAt timestamp
CREATE TRIGGER TR_Tickets_UpdatedAt
ON Tickets
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Tickets 
    SET UpdatedAt = GETUTCDATE(),
        ResolvedAt = CASE 
            WHEN i.Status IN ('resolved', 'closed') AND o.Status NOT IN ('resolved', 'closed') 
            THEN GETUTCDATE() 
            ELSE ResolvedAt 
        END
    FROM Tickets t
    INNER JOIN inserted i ON t.Id = i.Id
    INNER JOIN deleted o ON t.Id = o.Id;
END;