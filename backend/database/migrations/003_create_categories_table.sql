-- Create Categories table if it does not exist
IF NOT EXISTS (
    SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Categories]') AND type in (N'U')
)
BEGIN
    CREATE TABLE Categories (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Name NVARCHAR(100) NOT NULL UNIQUE,
        Type NVARCHAR(50) NOT NULL,
        Description NVARCHAR(1000) NULL,
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
    );

    -- Indexes
    CREATE INDEX IX_Categories_Name ON Categories(Name);
    CREATE INDEX IX_Categories_Type ON Categories(Type);
END

-- Trigger to update UpdatedAt
IF NOT EXISTS (
    SELECT * FROM sys.triggers WHERE name = 'TR_Categories_UpdatedAt'
)
BEGIN
    EXEC ('
    CREATE TRIGGER TR_Categories_UpdatedAt
    ON Categories
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE Categories 
        SET UpdatedAt = GETUTCDATE()
        FROM Categories c
        INNER JOIN inserted i ON c.Id = i.Id;
    END
    ');
END