# Entity Relationship Diagram (ERD)

This diagram illustrates the current database architecture for the JobCompass application.

```mermaid
erDiagram
    users ||--o{ user_favorites : "saves"
    jobs ||--o{ user_favorites : "is saved by"

    users {
        uuid user_id PK
        varchar email "Not null"
        varchar password "Hashed password"
        varchar first_name
        varchar last_name
        varchar avatar "Avatar URL/path"
        varchar street "Address field"
        varchar house_number "Address field"
        varchar city "Address field"
        varchar country "Address field"
        text skills "Comma-separated list"
        uuid reset_token "Password reset token"
        timestamp reset_token_expires "Token expiration"
    }

    jobs {
        text id PK
        timestamp date_posted
        varchar title
        varchar organization
        text organization_url
        varchar employment_type
        text url "Job posting URL"
        text organization_logo
        varchar display_location
        varchar work_mode
        varchar seniority
        text description_text
        text normalized_description
    }

    user_favorites {
        uuid user_id FK
        text job_id FK
        smallint travel_time "User-specific travel time"
        smallint least_transfers "User-specific transfer count"
    }
```
