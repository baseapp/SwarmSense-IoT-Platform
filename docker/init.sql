--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE alembic_version OWNER TO snms_user;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE alerts (
    id integer NOT NULL,
    uid character varying,
    name character varying,
    company_id integer,
    type character varying,
    sensor_type character varying,
    value character varying,
    field character varying,
    between_start time without time zone,
    between_end time without time zone,
    snooze integer,
    alert_text character varying,
    recipients json,
    web_hooks json,
    is_active boolean,
    deleted boolean,
    created_at timestamp without time zone,
    action_type text,
    actuator_type text,
    config_field text,
    config_value text,
    alert_if character varying DEFAULT 'inside'::character varying,
    polygon json
);


ALTER TABLE alerts OWNER TO snms_user;

--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE alerts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE alerts_id_seq OWNER TO snms_user;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE alerts_id_seq OWNED BY alerts.id;


--
-- Name: bin_files; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE bin_files (
    id integer NOT NULL,
    file bytea,
    sensor_id integer,
    meta_info json,
    created_at timestamp without time zone,
    uid text
);


ALTER TABLE bin_files OWNER TO snms_user;

--
-- Name: bin_files_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE bin_files_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE bin_files_id_seq OWNER TO snms_user;

--
-- Name: bin_files_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE bin_files_id_seq OWNED BY bin_files.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE companies (
    id integer NOT NULL,
    name character varying,
    owner_id integer,
    deleted boolean,
    uid character varying,
    key character varying,
    key_read character varying
);


ALTER TABLE companies OWNER TO snms_user;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE companies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE companies_id_seq OWNER TO snms_user;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE companies_id_seq OWNED BY companies.id;


--
-- Name: company_user; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE company_user (
    company_id integer,
    user_id integer,
    role text DEFAULT 'read'::text
);


ALTER TABLE company_user OWNER TO snms_user;

--
-- Name: dashboards; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE dashboards (
    id character varying NOT NULL,
    name character varying,
    company_id integer,
    deleted boolean,
    updated_at timestamp without time zone,
    created_at timestamp without time zone,
    data json
);


ALTER TABLE dashboards OWNER TO snms_user;

--
-- Name: events; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE events (
    id character varying NOT NULL,
    name character varying,
    company_id integer,
    is_active boolean,
    repeat boolean,
    unit character varying,
    actuator_type character varying,
    config_field character varying,
    config_value character varying,
    start_date timestamp without time zone,
    next_runtime timestamp without time zone,
    created_at timestamp without time zone,
    deleted_at timestamp without time zone
);


ALTER TABLE events OWNER TO snms_user;

--
-- Name: firmwares; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE firmwares (
    id integer NOT NULL,
    name character varying,
    version character varying,
    sensor_type character varying(50),
    is_deployed boolean,
    test_sensors json,
    last_update timestamp without time zone,
    created_at timestamp without time zone,
    filename character varying,
    content_type character varying,
    storage_file_id character varying,
    md5 character varying,
    size bigint,
    storage_backend character varying
);


ALTER TABLE firmwares OWNER TO snms_user;

--
-- Name: firmwares_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE firmwares_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE firmwares_id_seq OWNER TO snms_user;

--
-- Name: firmwares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE firmwares_id_seq OWNED BY firmwares.id;


--
-- Name: keys; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE keys (
    key character varying NOT NULL,
    name character varying,
    company_id integer,
    master boolean,
    methods json,
    created_at timestamp without time zone
);


ALTER TABLE keys OWNER TO snms_user;

--
-- Name: network_alerts; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE network_alerts (
    network_id integer NOT NULL,
    alert_id integer NOT NULL
);


ALTER TABLE network_alerts OWNER TO snms_user;

--
-- Name: network_sensor; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE network_sensor (
    network_id integer,
    sensor_id integer
);


ALTER TABLE network_sensor OWNER TO snms_user;

--
-- Name: networks; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE networks (
    id integer NOT NULL,
    name character varying,
    company_id integer,
    deleted boolean,
    uid character varying,
    last_update timestamp without time zone,
    created_at timestamp without time zone,
    storage_file_id character varying,
    md5 character varying,
    content_type character varying,
    storage_backend character varying,
    filename character varying,
    size bigint
);


ALTER TABLE networks OWNER TO snms_user;

--
-- Name: networks_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE networks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE networks_id_seq OWNER TO snms_user;

--
-- Name: networks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE networks_id_seq OWNED BY networks.id;


--
-- Name: sensor_alert; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE sensor_alert (
    sensor_id integer NOT NULL,
    alert_id integer NOT NULL,
    last_execute timestamp without time zone,
    actuator_id integer
);


ALTER TABLE sensor_alert OWNER TO snms_user;

--
-- Name: sensor_alert_status; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE sensor_alert_status (
    sensor_id integer NOT NULL,
    alert_id integer NOT NULL,
    last_execute timestamp without time zone
);


ALTER TABLE sensor_alert_status OWNER TO snms_user;

--
-- Name: sensor_event; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE sensor_event (
    sensor_id integer NOT NULL,
    event_id character varying NOT NULL
);


ALTER TABLE sensor_event OWNER TO snms_user;

--
-- Name: sensor_types; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE sensor_types (
    id integer NOT NULL,
    title character varying,
    type character varying,
    status_timeout integer,
    value_fields json,
    config_fields json,
    created_at timestamp without time zone,
    deleted boolean,
    is_public boolean DEFAULT true,
    created_by integer
);


ALTER TABLE sensor_types OWNER TO snms_user;

--
-- Name: sensor_types_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE sensor_types_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE sensor_types_id_seq OWNER TO snms_user;

--
-- Name: sensor_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE sensor_types_id_seq OWNED BY sensor_types.id;


--
-- Name: sensors; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE sensors (
    id integer NOT NULL,
    name character varying,
    type character varying(50),
    company_id integer,
    description character varying,
    location_lat double precision,
    location_long double precision,
    uid character varying,
    hid character varying,
    key character varying,
    is_down boolean,
    deleted boolean,
    ip character varying,
    last_update timestamp without time zone,
    created_at timestamp without time zone,
    value json,
    config json,
    is_inactive boolean DEFAULT false,
    time_start time without time zone,
    time_end time without time zone,
    config_updated timestamp without time zone
);


ALTER TABLE sensors OWNER TO snms_user;

--
-- Name: sensors_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE sensors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE sensors_id_seq OWNER TO snms_user;

--
-- Name: sensors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE sensors_id_seq OWNED BY sensors.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE settings (
    id integer NOT NULL,
    key character varying,
    value character varying,
    label character varying,
    "group" character varying,
    access character varying,
    description character varying,
    "order" integer
);


ALTER TABLE settings OWNER TO snms_user;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE settings_id_seq OWNER TO snms_user;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE settings_id_seq OWNED BY settings.id;


--
-- Name: time_series_data; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE time_series_data (
    id integer NOT NULL,
    sensor_id integer,
    company_id integer,
    sensor_type character varying,
    data json,
    "timestamp" timestamp without time zone
);


ALTER TABLE time_series_data OWNER TO snms_user;

--
-- Name: time_series_data_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE time_series_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE time_series_data_id_seq OWNER TO snms_user;

--
-- Name: time_series_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE time_series_data_id_seq OWNED BY time_series_data.id;


--
-- Name: user_invites; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE user_invites (
    id integer NOT NULL,
    company_id integer,
    email character varying(200),
    status boolean,
    created_at timestamp without time zone,
    role text DEFAULT 'read'::text
);


ALTER TABLE user_invites OWNER TO snms_user;

--
-- Name: user_invites_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE user_invites_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE user_invites_id_seq OWNER TO snms_user;

--
-- Name: user_invites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE user_invites_id_seq OWNED BY user_invites.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    uid character varying,
    name character varying,
    email character varying,
    password character varying,
    phone character varying,
    role character varying,
    reset_password boolean,
    reset_code character varying,
    created_at timestamp without time zone,
    deleted boolean,
    verification_code character varying,
    is_verified boolean DEFAULT false
);


ALTER TABLE users OWNER TO snms_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO snms_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: users_meta_data; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE users_meta_data (
    id integer NOT NULL,
    user_id integer,
    key character varying,
    value character varying,
    description character varying
);


ALTER TABLE users_meta_data OWNER TO snms_user;

--
-- Name: users_meta_data_id_seq; Type: SEQUENCE; Schema: public; Owner: snms_user
--

CREATE SEQUENCE users_meta_data_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_meta_data_id_seq OWNER TO snms_user;

--
-- Name: users_meta_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: snms_user
--

ALTER SEQUENCE users_meta_data_id_seq OWNED BY users_meta_data.id;


--
-- Name: widgets; Type: TABLE; Schema: public; Owner: snms_user; Tablespace: 
--

CREATE TABLE widgets (
    id character varying NOT NULL,
    dashboard_id character varying,
    updated_at timestamp without time zone,
    created_at timestamp without time zone,
    data json
);


ALTER TABLE widgets OWNER TO snms_user;

--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY alerts ALTER COLUMN id SET DEFAULT nextval('alerts_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY bin_files ALTER COLUMN id SET DEFAULT nextval('bin_files_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY companies ALTER COLUMN id SET DEFAULT nextval('companies_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY firmwares ALTER COLUMN id SET DEFAULT nextval('firmwares_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY networks ALTER COLUMN id SET DEFAULT nextval('networks_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensor_types ALTER COLUMN id SET DEFAULT nextval('sensor_types_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensors ALTER COLUMN id SET DEFAULT nextval('sensors_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY settings ALTER COLUMN id SET DEFAULT nextval('settings_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY time_series_data ALTER COLUMN id SET DEFAULT nextval('time_series_data_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY user_invites ALTER COLUMN id SET DEFAULT nextval('user_invites_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY users_meta_data ALTER COLUMN id SET DEFAULT nextval('users_meta_data_id_seq'::regclass);


--
-- Name: alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: alerts_uid_key; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY alerts
    ADD CONSTRAINT alerts_uid_key UNIQUE (uid);


--
-- Name: companies_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies_uid_key; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY companies
    ADD CONSTRAINT companies_uid_key UNIQUE (uid);


--
-- Name: network_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY network_alerts
    ADD CONSTRAINT network_alerts_pkey PRIMARY KEY (alert_id, network_id);


--
-- Name: pk_bin_files; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY bin_files
    ADD CONSTRAINT pk_bin_files PRIMARY KEY (id);


--
-- Name: pk_dashboards; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY dashboards
    ADD CONSTRAINT pk_dashboards PRIMARY KEY (id);


--
-- Name: pk_events; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY events
    ADD CONSTRAINT pk_events PRIMARY KEY (id);


--
-- Name: pk_firmwares; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY firmwares
    ADD CONSTRAINT pk_firmwares PRIMARY KEY (id);


--
-- Name: pk_keys; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY keys
    ADD CONSTRAINT pk_keys PRIMARY KEY (key);


--
-- Name: pk_networks; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY networks
    ADD CONSTRAINT pk_networks PRIMARY KEY (id);


--
-- Name: pk_sensor_event; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY sensor_event
    ADD CONSTRAINT pk_sensor_event PRIMARY KEY (sensor_id, event_id);


--
-- Name: pk_widgets; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY widgets
    ADD CONSTRAINT pk_widgets PRIMARY KEY (id);


--
-- Name: sensor_alert_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY sensor_alert
    ADD CONSTRAINT sensor_alert_pkey PRIMARY KEY (sensor_id, alert_id);


--
-- Name: sensor_alert_status_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY sensor_alert_status
    ADD CONSTRAINT sensor_alert_status_pkey PRIMARY KEY (sensor_id, alert_id);


--
-- Name: sensor_types_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY sensor_types
    ADD CONSTRAINT sensor_types_pkey PRIMARY KEY (id);


--
-- Name: sensor_types_type_key; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY sensor_types
    ADD CONSTRAINT sensor_types_type_key UNIQUE (type);


--
-- Name: sensors_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY sensors
    ADD CONSTRAINT sensors_pkey PRIMARY KEY (id);


--
-- Name: sensors_uid_key; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY sensors
    ADD CONSTRAINT sensors_uid_key UNIQUE (uid);


--
-- Name: settings_key_key; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: time_series_data_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY time_series_data
    ADD CONSTRAINT time_series_data_pkey PRIMARY KEY (id);


--
-- Name: uq_networks_uid; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY networks
    ADD CONSTRAINT uq_networks_uid UNIQUE (uid);


--
-- Name: user_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY user_invites
    ADD CONSTRAINT user_invites_pkey PRIMARY KEY (id);


--
-- Name: users_email_key; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users_meta_data_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY users_meta_data
    ADD CONSTRAINT users_meta_data_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users_uid_key; Type: CONSTRAINT; Schema: public; Owner: snms_user; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_uid_key UNIQUE (uid);


--
-- Name: alerts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY alerts
    ADD CONSTRAINT alerts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);


--
-- Name: companies_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY companies
    ADD CONSTRAINT companies_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id);


--
-- Name: company_user_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY company_user
    ADD CONSTRAINT company_user_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);


--
-- Name: company_user_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY company_user
    ADD CONSTRAINT company_user_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);


--
-- Name: fk_dashboards_company_id_companies; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY dashboards
    ADD CONSTRAINT fk_dashboards_company_id_companies FOREIGN KEY (company_id) REFERENCES companies(id);


--
-- Name: fk_events_company_id_companies; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY events
    ADD CONSTRAINT fk_events_company_id_companies FOREIGN KEY (company_id) REFERENCES companies(id);


--
-- Name: fk_keys_company_id_companies; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY keys
    ADD CONSTRAINT fk_keys_company_id_companies FOREIGN KEY (company_id) REFERENCES companies(id);


--
-- Name: fk_networks_company_id_companies; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY networks
    ADD CONSTRAINT fk_networks_company_id_companies FOREIGN KEY (company_id) REFERENCES companies(id);


--
-- Name: fk_sensor_event_event_id_events; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensor_event
    ADD CONSTRAINT fk_sensor_event_event_id_events FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;


--
-- Name: fk_sensor_event_sensor_id_sensors; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensor_event
    ADD CONSTRAINT fk_sensor_event_sensor_id_sensors FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE;


--
-- Name: fk_widgets_dashboard_id_dashboards; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY widgets
    ADD CONSTRAINT fk_widgets_dashboard_id_dashboards FOREIGN KEY (dashboard_id) REFERENCES dashboards(id);


--
-- Name: network_alerts_alert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY network_alerts
    ADD CONSTRAINT network_alerts_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE;


--
-- Name: network_sensor_sensor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY network_sensor
    ADD CONSTRAINT network_sensor_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES sensors(id);


--
-- Name: sensor_alert_alert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensor_alert
    ADD CONSTRAINT sensor_alert_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE;


--
-- Name: sensor_alert_sensor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensor_alert
    ADD CONSTRAINT sensor_alert_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE;


--
-- Name: sensor_alert_status_alert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensor_alert_status
    ADD CONSTRAINT sensor_alert_status_alert_id_fkey FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE;


--
-- Name: sensor_alert_status_sensor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensor_alert_status
    ADD CONSTRAINT sensor_alert_status_sensor_id_fkey FOREIGN KEY (sensor_id) REFERENCES sensors(id) ON DELETE CASCADE;


--
-- Name: sensors_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY sensors
    ADD CONSTRAINT sensors_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);


--
-- Name: user_invites_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY user_invites
    ADD CONSTRAINT user_invites_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);


--
-- Name: users_meta_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: snms_user
--

ALTER TABLE ONLY users_meta_data
    ADD CONSTRAINT users_meta_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--
