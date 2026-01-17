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
    user_id uuid NOT NULL,
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
    CONSTRAINT users_pkey PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS user_favorites (
    user_id uuid NOT NULL,
    job_id text NOT NULL,
    travel_time smallint,
    least_transfers smallint,
    CONSTRAINT user_favorites_pkey PRIMARY KEY (user_id, job_id),
    CONSTRAINT user_favorites_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    CONSTRAINT user_favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS search_words (
    search_word text NOT NULL,
    CONSTRAINT search_words_pkey PRIMARY KEY (search_word)
);

CREATE TABLE IF NOT EXISTS search_words_jobs (
    search_word text NOT NULL,
    job_id text NOT NULL,
    CONSTRAINT search_words_jobs_pkey PRIMARY KEY (search_word, job_id),
    CONSTRAINT search_words_jobs_search_word_fkey FOREIGN KEY (search_word) REFERENCES search_words (search_word) ON DELETE CASCADE,
    CONSTRAINT search_words_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
);