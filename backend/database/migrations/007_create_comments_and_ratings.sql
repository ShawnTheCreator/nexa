-- 007_create_comments_and_ratings.sql
-- Creates Comments and IdeaRatings tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Comments]') AND type in (N'U'))
BEGIN
  CREATE TABLE dbo.Comments (
    Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdeaId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Text NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
  );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[IdeaRatings]') AND type in (N'U'))
BEGIN
  CREATE TABLE dbo.IdeaRatings (
    Id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    IdeaId UNIQUEIDENTIFIER NOT NULL,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Rating INT NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UX_IdeaRating UNIQUE (IdeaId, UserId)
  );
END
