-- 005_create_ideas_table.sql
-- Creates Ideas table to store user-submitted ideas with optional video and attachments

BEGIN TRY
    IF OBJECT_ID('dbo.Ideas', 'U') IS NULL
    BEGIN
        CREATE TABLE dbo.Ideas (
            Id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
            UserId UNIQUEIDENTIFIER NOT NULL,
            Title NVARCHAR(200) NOT NULL,
            Description NVARCHAR(MAX) NULL,
            VideoUrl NVARCHAR(1024) NULL,
            AttachmentUrls NVARCHAR(MAX) NULL,
            Status NVARCHAR(20) NOT NULL DEFAULT 'submitted', -- submitted | approved | rejected
            CreatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
            UpdatedAt DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
            CONSTRAINT PK_Ideas PRIMARY KEY (Id),
            CONSTRAINT FK_Ideas_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
            CONSTRAINT CK_Ideas_Status CHECK (Status IN ('submitted','approved','rejected'))
        );

        CREATE INDEX IX_Ideas_UserId ON dbo.Ideas (UserId);
        CREATE INDEX IX_Ideas_Status ON dbo.Ideas (Status);
        CREATE INDEX IX_Ideas_CreatedAt ON dbo.Ideas (CreatedAt);
    END
END TRY
BEGIN CATCH
    -- If object exists or similar, ignore to allow idempotent migrations
    PRINT '005_create_ideas_table.sql encountered an issue';
END CATCH
GO

-- Trigger to auto-update UpdatedAt on update
IF OBJECT_ID(N'dbo.tr_Ideas_UpdateTimestamp', 'TR') IS NOT NULL
    DROP TRIGGER dbo.tr_Ideas_UpdateTimestamp;
GO
BEGIN TRY
    IF OBJECT_ID('dbo.tr_Ideas_UpdateTimestamp', 'TR') IS NULL
    BEGIN
        EXEC('CREATE TRIGGER dbo.tr_Ideas_UpdateTimestamp ON dbo.Ideas
        AFTER UPDATE AS
        BEGIN
            SET NOCOUNT ON;
            UPDATE dbo.Ideas SET UpdatedAt = SYSUTCDATETIME()
            FROM dbo.Ideas i
            INNER JOIN Inserted ins ON i.Id = ins.Id;
        END');
    END
END TRY
BEGIN CATCH
    PRINT '005_create_ideas_table.sql trigger creation encountered an issue';
END CATCH
GO