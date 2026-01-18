CREATE TABLE IF NOT EXISTS jobs (
    id text NOT NULL,
    date_posted timestamp without time zone,
    title character varying(500),
    organization character varying(255),
    organization_url text,
    employment_type character varying(255),
    url text,
    organization_logo text,
    display_location character varying(500),
    work_mode character varying(255),
    seniority character varying(255),
    description_text text,
    normalized_description text,
    CONSTRAINT jobs_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS users (
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    avatar character varying(255),
    street character varying(255),
    house_number character varying(50),
    city character varying(100),
    country character varying(100),
    skills text,
    reset_token uuid,
    reset_token_expires timestamp without time zone,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS user_favorites (
    user_id uuid NOT NULL,
    job_id text NOT NULL,
    travel_time smallint,
    least_transfers smallint,
    CONSTRAINT user_favorites_pkey PRIMARY KEY (user_id, job_id),
    CONSTRAINT user_favorites_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_strings (
    search_string text NOT NULL,
    search_date timestamp without time zone,
    is_auth boolean DEFAULT false,
    CONSTRAINT search_strings_pkey PRIMARY KEY (search_string)
);

CREATE TABLE IF NOT EXISTS search_strings_jobs (
    search_string text NOT NULL,
    job_id text NOT NULL,
    CONSTRAINT search_strings_jobs_pkey PRIMARY KEY (search_string, job_id),
    CONSTRAINT search_strings_jobs_search_string_fkey FOREIGN KEY (search_string) REFERENCES search_strings (search_string) ON DELETE CASCADE,
    CONSTRAINT search_strings_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);