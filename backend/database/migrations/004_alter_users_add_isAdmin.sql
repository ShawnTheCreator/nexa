-- Add IsAdmin column to Users if it does not exist
IF COL_LENGTH('Users', 'IsAdmin') IS NULL
BEGIN
    ALTER TABLE Users ADD IsAdmin BIT NOT NULL DEFAULT 0;
    UPDATE Users SET IsAdmin = 0 WHERE IsAdmin IS NULL;
    CREATE INDEX IX_Users_IsAdmin ON Users(IsAdmin);
END