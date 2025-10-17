-- Create Users table (dbo) if it does not exist
IF NOT EXISTS (
    SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type = N'U'
)
BEGIN
CREATE TABLE dbo.Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    
    -- Student personal info
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    
    -- Eduvos-specific identifiers
    StudentNumber NVARCHAR(50) NULL UNIQUE,
    Campus NVARCHAR(100) NULL,
    Faculty NVARCHAR(100) NULL,
    YearOfStudy INT NULL CHECK (YearOfStudy >= 0 AND YearOfStudy <= 4),
    
    -- Authentication & account state
    LastLogin DATETIME2 DEFAULT GETUTCDATE(),
    IsVerified BIT DEFAULT 0,
    
    -- Password reset support
    ResetPasswordToken NVARCHAR(255) NULL,
    ResetPasswordExpiresAt DATETIME2 NULL,
    
    -- Account verification tokens
    VerificationToken NVARCHAR(255) NULL,
    VerificationTokenExpiresAt DATETIME2 NULL,
    
    -- Timestamps
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
END

GO

-- Create indexes for performance (idempotent, only if table exists)
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Users_Email' AND object_id = OBJECT_ID('dbo.Users'))
        CREATE INDEX IX_Users_Email ON dbo.Users(Email);
    IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Users_StudentNumber' AND object_id = OBJECT_ID('dbo.Users'))
        CREATE INDEX IX_Users_StudentNumber ON dbo.Users(StudentNumber) WHERE StudentNumber IS NOT NULL;
    IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Users_IsVerified' AND object_id = OBJECT_ID('dbo.Users'))
        CREATE INDEX IX_Users_IsVerified ON dbo.Users(IsVerified);
    IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Users_CreatedAt' AND object_id = OBJECT_ID('dbo.Users'))
        CREATE INDEX IX_Users_CreatedAt ON dbo.Users(CreatedAt);
END

GO

CREATE TRIGGER TR_Users_UpdatedAt
ON dbo.Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users 
    SET UpdatedAt = GETUTCDATE()
    FROM Users u
    INNER JOIN inserted i ON u.Id = i.Id;
END;

GO