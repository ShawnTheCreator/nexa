-- Create Users table
CREATE TABLE Users (
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

-- Create indexes for performance
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_StudentNumber ON Users(StudentNumber) WHERE StudentNumber IS NOT NULL;
CREATE INDEX IX_Users_IsVerified ON Users(IsVerified);
CREATE INDEX IX_Users_CreatedAt ON Users(CreatedAt);

-- Create trigger to update UpdatedAt timestamp
CREATE TRIGGER TR_Users_UpdatedAt
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users 
    SET UpdatedAt = GETUTCDATE()
    FROM Users u
    INNER JOIN inserted i ON u.Id = i.Id;
END;