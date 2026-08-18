# Database Schema

Entity-relationship diagram for the First Issues database, now managed by **Prisma**.

```mermaid
erDiagram
    USERS ||--o{ BOOKMARKS : "has"
    REPOSITORIES ||--o{ ISSUES : "contains"

    USERS {
        Int id PK
        String email UK
        String username UK
        String passwordHash
        String fullName
        String avatarUrl
        String bio
        Boolean isActive
        Boolean isVerified
        String emailVerificationToken
        String passwordResetToken
        DateTime passwordResetExpires
        DateTime createdAt
        DateTime updatedAt
        DateTime lastLogin
    }

    REPOSITORIES {
        Int id PK
        String githubId UK
        String name
        String description
        String language
        Int starsCount
        Int forksCount
        Int openIssuesCount
        String htmlUrl
        Json repoMetadata
        DateTime createdAt
        DateTime updatedAt
        DateTime lastFetched
        Boolean isActive
    }

    ISSUES {
        Int id PK
        String githubId
        Int number
        String title
        String body
        String state
        String htmlUrl
        Json labels
        Json assignees
        DateTime issueCreatedAt
        DateTime issueUpdatedAt
        DateTime closedAt
        Boolean isGoodFirstIssue
        Float difficultyScore
        String estimatedTime
        Int repositoryId FK
        DateTime createdAt
        DateTime lastFetched
    }

    BOOKMARKS {
        Int id PK
        Int userId FK
        String issueId
        Int issueNumber
        String repoOwner
        String repoName
        String issueTitle
        String issueState
        String issueUrl
        Json issueLabels
        String notes
        Json tags
        Boolean isArchived
        DateTime createdAt
        DateTime updatedAt
    }

    ANALYTICS {
        String id PK
        String eventType
        Json data
        String sessionId
        String ipAddress
        String userAgent
        String pageUrl
        String referrer
        DateTime createdAt
    }
```

---

## Index Strategy (Prisma)

Indexes are explicitly defined in `prisma/schema.prisma` using `@@index()` directives.

| Table          | Indexed Columns                                            | Purpose               |
| -------------- | ---------------------------------------------------------- | --------------------- |
| `User`         | `email`, `username`                                        | Fast login lookup     |
| `Repository`   | `name`, `language`, `starsCount`                           | Search/filter         |
| `Issue`        | `githubId`, `state`, `isGoodFirstIssue`, `repositoryId`    | Query optimization    |
| `Bookmark`     | `userId`, `issueId`, `createdAt`                           | User bookmarks lookup |
| `Analytics`    | `eventType`, `createdAt`                                   | Analytics queries     |

## Unique Constraints
- `User`: `email`, `username`
- `Repository`: `githubId`
- `Bookmark`: Unique combination of `[userId, issueId]`
