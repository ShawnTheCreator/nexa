-- Create Tickets table if it does not exist
IF NOT EXISTS (
    SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Tickets]') AND type = N'U'
)
BEGIN
CREATE TABLE dbo.Tickets (
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
    CONSTRAINT FK_Tickets_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Tickets_AssignedTo FOREIGN KEY (AssignedTo) REFERENCES dbo.Users(Id) ON DELETE SET NULL
);
END

GO

BEGIN TRY
    IF OBJECT_ID('dbo.Tickets', 'U') IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Tickets_UserId' AND object_id = OBJECT_ID('dbo.Tickets'))
            EXEC('CREATE INDEX IX_Tickets_UserId ON dbo.Tickets(UserId)');
        IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Tickets_Status' AND object_id = OBJECT_ID('dbo.Tickets'))
            EXEC('CREATE INDEX IX_Tickets_Status ON dbo.Tickets(Status)');
        IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Tickets_Priority' AND object_id = OBJECT_ID('dbo.Tickets'))
            EXEC('CREATE INDEX IX_Tickets_Priority ON dbo.Tickets(Priority)');
        IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Tickets_CreatedAt' AND object_id = OBJECT_ID('dbo.Tickets'))
            EXEC('CREATE INDEX IX_Tickets_CreatedAt ON dbo.Tickets(CreatedAt)');
        IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Tickets_PolicyNumber' AND object_id = OBJECT_ID('dbo.Tickets'))
            EXEC('CREATE INDEX IX_Tickets_PolicyNumber ON dbo.Tickets(PolicyNumber)');
        IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Tickets_AssignedTo' AND object_id = OBJECT_ID('dbo.Tickets'))
            EXEC('CREATE INDEX IX_Tickets_AssignedTo ON dbo.Tickets(AssignedTo) WHERE AssignedTo IS NOT NULL');
    END
END TRY
BEGIN CATCH
    PRINT '002_create_tickets_table.sql index creation encountered an issue';
END CATCH

BEGIN TRY
    IF OBJECT_ID('dbo.Tickets', 'U') IS NOT NULL
    BEGIN
        IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Tickets_User_Status' AND object_id = OBJECT_ID('dbo.Tickets'))
            EXEC('CREATE INDEX IX_Tickets_User_Status ON dbo.Tickets(UserId, Status)');
        IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Tickets_Status_Priority' AND object_id = OBJECT_ID('dbo.Tickets'))
            EXEC('CREATE INDEX IX_Tickets_Status_Priority ON dbo.Tickets(Status, Priority)');
    END
END TRY
BEGIN CATCH
    PRINT '002_create_tickets_table.sql composite index creation encountered an issue';
END CATCH

GO

-- Create trigger to update UpdatedAt timestamp
CREATE TRIGGER TR_Tickets_UpdatedAt
ON dbo.Tickets
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

GO