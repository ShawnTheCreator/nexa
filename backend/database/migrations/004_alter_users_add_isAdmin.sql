-- Add IsAdmin column to Users if it does not exist (batch-safe and idempotent)
IF COL_LENGTH('dbo.Users', 'IsAdmin') IS NULL
BEGIN
    -- Add the column as NULL first to avoid compile-time issues in same batch
    ALTER TABLE dbo.Users ADD IsAdmin BIT NULL;
END

GO

-- Backfill, add default constraint, make NOT NULL, and index (idempotent)
IF COL_LENGTH('dbo.Users', 'IsAdmin') IS NOT NULL
BEGIN
    -- Backfill existing rows
    UPDATE dbo.Users SET IsAdmin = 0 WHERE IsAdmin IS NULL;

    -- Add default constraint if missing
    IF NOT EXISTS (
        SELECT 1
        FROM sys.default_constraints dc
        JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
        WHERE dc.parent_object_id = OBJECT_ID('dbo.Users') AND c.name = 'IsAdmin'
    )
    BEGIN
        ALTER TABLE dbo.Users ADD CONSTRAINT DF_Users_IsAdmin DEFAULT 0 FOR IsAdmin;
    END

    -- Make column NOT NULL
    ALTER TABLE dbo.Users ALTER COLUMN IsAdmin BIT NOT NULL;

    -- Create index if not exists
    IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'IX_Users_IsAdmin' AND object_id = OBJECT_ID('dbo.Users'))
        CREATE INDEX IX_Users_IsAdmin ON dbo.Users(IsAdmin);
END

GO