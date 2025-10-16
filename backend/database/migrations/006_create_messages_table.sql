-- 006_create_messages_table.sql
-- Creates Messages table for user-to-user texting interface

BEGIN TRY
    IF OBJECT_ID('dbo.Messages', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.Messages (
            Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
            SenderId UNIQUEIDENTIFIER NOT NULL,
            ReceiverId UNIQUEIDENTIFIER NOT NULL,
            Content NVARCHAR(MAX) NOT NULL,
            CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
            ReadAt DATETIME2(0) NULL,
            CONSTRAINT PK_Messages PRIMARY KEY (Id),
            CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderId) REFERENCES dbo.Users(Id),
            CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverId) REFERENCES dbo.Users(Id)
        );

        CREATE INDEX IX_Messages_SenderReceiver ON dbo.Messages (SenderId, ReceiverId);
        CREATE INDEX IX_Messages_ReceiverCreatedAt ON dbo.Messages (ReceiverId, CreatedAt);
        CREATE INDEX IX_Messages_CreatedAt ON dbo.Messages (CreatedAt);
    END
END TRY
BEGIN CATCH
    PRINT '006_create_messages_table.sql encountered an issue';
END CATCH
GO