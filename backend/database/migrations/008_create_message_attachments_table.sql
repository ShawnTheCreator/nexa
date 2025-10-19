-- 008_create_message_attachments_table.sql
-- Creates MessageAttachments table to store media URLs for messages

BEGIN TRY
    IF OBJECT_ID('dbo.MessageAttachments', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.MessageAttachments (
            Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
            MessageId UNIQUEIDENTIFIER NOT NULL,
            Url NVARCHAR(2000) NOT NULL,
            FileName NVARCHAR(500) NULL,
            ContentType NVARCHAR(255) NULL,
            Size BIGINT NULL,
            CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
            CONSTRAINT PK_MessageAttachments PRIMARY KEY (Id),
            CONSTRAINT FK_MessageAttachments_Message FOREIGN KEY (MessageId) REFERENCES dbo.Messages(Id) ON DELETE CASCADE
        );

        CREATE INDEX IX_MessageAttachments_MessageId ON dbo.MessageAttachments (MessageId);
    END
END TRY
BEGIN CATCH
    PRINT '008_create_message_attachments_table.sql encountered an issue';
END CATCH
GO
