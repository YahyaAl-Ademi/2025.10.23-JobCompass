CREATE TABLE jobs (
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

CREATE TABLE users (
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

CREATE TABLE user_favorites (
    user_id uuid NOT NULL,
    job_id text NOT NULL,
    travel_time smallint,
    least_transfers smallint,
    CONSTRAINT pk_user_favorites PRIMARY KEY (user_id, job_id),
    CONSTRAINT fk_job_id FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);