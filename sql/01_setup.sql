CREATE EXTENSION IF NOT EXISTS aws_s3 CASCADE;

DROP TRIGGER IF EXISTS sample_table_trg ON sample_table;

DROP FUNCTION IF EXISTS export_to_s3;

DROP TABLE IF EXISTS sample_table;

CREATE TABLE sample_table (bid bigint PRIMARY KEY, name varchar(80));
