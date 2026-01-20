# Entity Relationship Diagram (ERD)

This diagram illustrates the current database architecture for the JobCompass application. See [`create_tables.sql`](../db_migrations/create_tables.sql) for the SQL implementation of this schema.

```mermaid
erDiagram
    users ||--o{ user_favorites : "saves"
    jobs ||--o{ user_favorites : "is saved by"
    search_strings ||--o{ search_strings_jobs : ""
    jobs ||--o{ search_strings_jobs : ""

    users {
        uuid id PK "NOT NULL, CONSTRAINT users_pkey"
        character_varying_255 email "NOT NULL"
        character_varying_255 password "NOT NULL"
        character_varying_100 first_name
        character_varying_100 last_name
        character_varying_255 avatar
        character_varying_255 street
        character_varying_50 house_number
        character_varying_100 city
        character_varying_100 country
        text skills
        uuid reset_token
        timestamp reset_token_expires
    }

    jobs {
        text id PK "NOT NULL, CONSTRAINT jobs_pkey"
        timestamp date_posted
        character_varying_500 title
        character_varying_255 organization
        text organization_url
        character_varying_255 employment_type
        text url
        text organization_logo
        character_varying_500 display_location
        character_varying_255 work_mode
        character_varying_255 seniority
        text description_text
        text normalized_description
    }

    user_favorites {
        uuid user_id PK,FK "NOT NULL, PK: user_favorites_pkey, FK: user_favorites_user_id_fkey, ON DELETE CASCADE"
        text job_id PK,FK "NOT NULL, PK: user_favorites_pkey, FK: user_favorites_job_id_fkey, ON DELETE CASCADE"
        smallint travel_time
        smallint least_transfers
    }

    search_strings {
        text search_string PK "NOT NULL, CONSTRAINT search_strings_pkey"
        timestamp search_date
        character_varying_36 is_auth
    }

    search_strings_jobs {
        text search_string PK,FK "NOT NULL, PK: search_strings_jobs_pkey, FK: search_strings_jobs_search_string_fkey, ON DELETE CASCADE"
        text job_id PK,FK "NOT NULL, PK: search_strings_jobs_pkey, FK: search_strings_jobs_job_id_fkey, ON DELETE CASCADE"
    }
```
