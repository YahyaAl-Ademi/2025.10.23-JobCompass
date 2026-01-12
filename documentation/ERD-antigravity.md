# Entity Relationship Diagram (ERD)

This diagram illustrates the current database architecture for the JobCompass application.

```mermaid
erDiagram
    users ||--o{ user_favorites : "saves"
    favorites ||--o{ user_favorites : "is saved by"

    users {
        uuid userid PK
        string email
        string password
        string firstname
        string lastname
        string avatar
        string street
        string housenumber
        string city
        string country
        string skills
        string reset_token
        timestamp reset_token_expires
    }

    favorites {
        string id PK
        string title
        string organization
        string organization_url
        string employment_type
        string url
        string organization_logo
        string display_location
        string work_mode
        string seniority
        string description_text
        string date_posted
        string normalized_description
    }

    user_favorites {
        uuid user_id FK
        string favorite_id FK
        string travel_time
        string least_transfers
    }
```
