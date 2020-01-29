--
-- PostgreSQL database dump
--

-- Dumped from database version 10.7
-- Dumped by pg_dump version 12beta2

-- Started on 2019-11-01 12:55:22 IST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;

--
-- TOC entry 18 (class 2615 OID 139771)
-- Name: target; Type: SCHEMA; Schema: -; Owner: enterprisedb
--

CREATE SCHEMA target;


ALTER SCHEMA target OWNER TO enterprisedb;

SET default_tablespace = '';

CREATE EXTENSION btree_gist
    SCHEMA target;

--
-- TOC entry 12250 (class 1259 OID 139938)
-- Name: MView; Type: MATERIALIZED VIEW; Schema: target; Owner: enterprisedb
--

CREATE MATERIALIZED VIEW target."MView" AS
 SELECT 'tekst'::text AS text
  WITH NO DATA;


ALTER TABLE target."MView" OWNER TO enterprisedb;

--
-- TOC entry 12259 (class 1259 OID 148971)
-- Name: table_for_column; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_column (
    col1 bigint,
    col2 bigint,
    col4 text
);


ALTER TABLE target.table_for_column OWNER TO enterprisedb;

--
-- TOC entry 12268 (class 1259 OID 149089)
-- Name: table_for_constraints; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_constraints (
    col1 integer NOT NULL,
    col2 text,
    CONSTRAINT check_con CHECK ((col1 > 30))
);


ALTER TABLE target.table_for_constraints OWNER TO enterprisedb;

--
-- TOC entry 61066 (class 0 OID 0)
-- Dependencies: 12268
-- Name: TABLE table_for_constraints; Type: COMMENT; Schema: target; Owner: enterprisedb
--

COMMENT ON TABLE target.table_for_constraints IS 'comments';


--
-- TOC entry 61067 (class 0 OID 0)
-- Dependencies: 12268
-- Name: CONSTRAINT check_con ON table_for_constraints; Type: COMMENT; Schema: target; Owner: enterprisedb
--

COMMENT ON CONSTRAINT check_con ON target.table_for_constraints IS 'coment';


--
-- TOC entry 12257 (class 1259 OID 148960)
-- Name: table_for_del; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_del (
);


ALTER TABLE target.table_for_del OWNER TO enterprisedb;

--
-- TOC entry 12271 (class 1259 OID 149172)
-- Name: table_for_foreign_key; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_foreign_key (
    col1 integer NOT NULL,
    col2 "char",
    col3 bigint
);


ALTER TABLE target.table_for_foreign_key OWNER TO enterprisedb;

--
-- TOC entry 12263 (class 1259 OID 149013)
-- Name: table_for_identical; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_identical (
    col1 integer NOT NULL,
    col2 text
);


ALTER TABLE target.table_for_identical OWNER TO enterprisedb;

--
-- TOC entry 12261 (class 1259 OID 148986)
-- Name: table_for_index; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_index (
    col1 integer NOT NULL,
    col2 text
);


ALTER TABLE target.table_for_index OWNER TO enterprisedb;

--
-- TOC entry 12270 (class 1259 OID 149144)
-- Name: table_for_primary_key; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_primary_key (
    col1 integer NOT NULL,
    col2 text NOT NULL
);


ALTER TABLE target.table_for_primary_key OWNER TO enterprisedb;

--
-- TOC entry 12265 (class 1259 OID 149034)
-- Name: table_for_rule; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_rule (
    col1 bigint NOT NULL,
    col2 text
);


ALTER TABLE target.table_for_rule OWNER TO enterprisedb;

--
-- TOC entry 12267 (class 1259 OID 149066)
-- Name: table_for_trigger; Type: TABLE; Schema: target; Owner: enterprisedb
--

CREATE TABLE target.table_for_trigger (
    col1 bigint NOT NULL,
    col2 text
);


ALTER TABLE target.table_for_trigger OWNER TO enterprisedb;


--
-- TOC entry 56906 (class 2606 OID 149097)
-- Name: table_for_constraints Exclusion; Type: CONSTRAINT; Schema: target; Owner: enterprisedb
--

ALTER TABLE ONLY target.table_for_constraints
    ADD CONSTRAINT "Exclusion" EXCLUDE USING gist (col2 WITH <>) WITH (fillfactor='15') WHERE ((col1 > 1)) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 61068 (class 0 OID 0)
-- Dependencies: 56906
-- Name: CONSTRAINT "Exclusion" ON table_for_constraints; Type: COMMENT; Schema: target; Owner: enterprisedb
--

COMMENT ON CONSTRAINT "Exclusion" ON target.table_for_constraints IS 'comments';


--
-- TOC entry 56910 (class 2606 OID 149176)
-- Name: table_for_foreign_key table_for_foreign_key_pkey; Type: CONSTRAINT; Schema: target; Owner: enterprisedb
--

ALTER TABLE ONLY target.table_for_foreign_key
    ADD CONSTRAINT table_for_foreign_key_pkey PRIMARY KEY (col1);


--
-- TOC entry 56897 (class 2606 OID 148993)
-- Name: table_for_index table_for_index_pkey; Type: CONSTRAINT; Schema: target; Owner: enterprisedb
--

ALTER TABLE ONLY target.table_for_index
    ADD CONSTRAINT table_for_index_pkey PRIMARY KEY (col1);


--
-- TOC entry 56908 (class 2606 OID 149151)
-- Name: table_for_primary_key table_for_primary_key_pkey; Type: CONSTRAINT; Schema: target; Owner: enterprisedb
--

ALTER TABLE ONLY target.table_for_primary_key
    ADD CONSTRAINT table_for_primary_key_pkey PRIMARY KEY (col1);


--
-- TOC entry 56902 (class 2606 OID 149041)
-- Name: table_for_rule table_for_rule_pkey; Type: CONSTRAINT; Schema: target; Owner: enterprisedb
--

ALTER TABLE ONLY target.table_for_rule
    ADD CONSTRAINT table_for_rule_pkey PRIMARY KEY (col1);


--
-- TOC entry 56900 (class 2606 OID 149020)
-- Name: table_for_identical table_for_table_for_identical_pkey; Type: CONSTRAINT; Schema: target; Owner: enterprisedb
--

ALTER TABLE ONLY target.table_for_identical
    ADD CONSTRAINT table_for_table_for_identical_pkey PRIMARY KEY (col1);


--
-- TOC entry 56904 (class 2606 OID 149073)
-- Name: table_for_trigger table_for_trigger_pkey; Type: CONSTRAINT; Schema: target; Owner: enterprisedb
--

ALTER TABLE ONLY target.table_for_trigger
    ADD CONSTRAINT table_for_trigger_pkey PRIMARY KEY (col1);


--
-- TOC entry 56893 (class 1259 OID 148994)
-- Name: index1; Type: INDEX; Schema: target; Owner: enterprisedb
--

CREATE INDEX index1 ON target.table_for_index USING btree (col2 text_pattern_ops);


--
-- TOC entry 56894 (class 1259 OID 148995)
-- Name: index2; Type: INDEX; Schema: target; Owner: enterprisedb
--

CREATE INDEX index2 ON target.table_for_index USING btree (col2 text_pattern_ops);


--
-- TOC entry 56898 (class 1259 OID 149021)
-- Name: index_identical; Type: INDEX; Schema: target; Owner: enterprisedb
--

CREATE INDEX index_identical ON target.table_for_identical USING btree (col2 text_pattern_ops);


--
-- TOC entry 56895 (class 1259 OID 149212)
-- Name: index_same; Type: INDEX; Schema: target; Owner: enterprisedb
--

CREATE INDEX index_same ON target.table_for_index USING btree (col2 text_pattern_ops);


--
-- TOC entry 56892 (class 1259 OID 139945)
-- Name: mview_index; Type: INDEX; Schema: target; Owner: enterprisedb
--

CREATE INDEX mview_index ON target."MView" USING btree (text text_pattern_ops);


--
-- TOC entry 61045 (class 2618 OID 149042)
-- Name: table_for_rule rule1; Type: RULE; Schema: target; Owner: enterprisedb
--

CREATE RULE rule1 AS
    ON UPDATE TO target.table_for_rule DO INSTEAD NOTHING;


--
-- TOC entry 61069 (class 0 OID 0)
-- Dependencies: 61045
-- Name: RULE rule1 ON table_for_rule; Type: COMMENT; Schema: target; Owner: enterprisedb
--

COMMENT ON RULE rule1 ON target.table_for_rule IS 'comments';


--
-- TOC entry 61046 (class 2618 OID 149043)
-- Name: table_for_rule rule2; Type: RULE; Schema: target; Owner: enterprisedb
--

CREATE RULE rule2 AS
    ON UPDATE TO target.table_for_rule DO NOTHING;


--
-- TOC entry 61047 (class 2618 OID 149044)
-- Name: table_for_rule rule3; Type: RULE; Schema: target; Owner: enterprisedb
--

CREATE RULE rule3 AS
    ON INSERT TO target.table_for_rule DO NOTHING;


--
-- TOC entry 61050 (class 0 OID 139938)
-- Dependencies: 12250 61062
-- Name: MView; Type: MATERIALIZED VIEW DATA; Schema: target; Owner: enterprisedb
--

REFRESH MATERIALIZED VIEW target."MView";
