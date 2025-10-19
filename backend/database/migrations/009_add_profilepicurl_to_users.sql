-- 009_add_profilepicurl_to_users.sql
-- Adds ProfilePicUrl column to dbo.Users if it doesn't exist

BEGIN TRY
    IF COL_LENGTH('dbo.Users','ProfilePicUrl') IS NULL
    BEGIN
        ALTER TABLE dbo.Users ADD ProfilePicUrl NVARCHAR(2000) NULL;
        PRINT 'ProfilePicUrl column added to dbo.Users';
    END
END TRY
BEGIN CATCH
    PRINT '009_add_profilepicurl_to_users.sql encountered an issue';
END CATCH
GO
