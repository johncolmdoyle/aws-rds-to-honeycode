INSERT INTO sample_table (name, email) VALUES ('John', 'john@gizmo.codes');
INSERT INTO sample_table (name, email) VALUES ('Gizmo', 'boss@gizmo.codes');
INSERT INTO sample_table (name, email) VALUES ('Swayze', 'swayze@gizmo.codes');

UPDATE sample_table SET email = 'boss@gizmo.codes' WHERE name = 'John';