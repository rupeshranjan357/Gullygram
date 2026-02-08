ALTER TABLE karma_transactions 
ALTER COLUMN source_type TYPE VARCHAR(50);

DROP TYPE karma_source_type;
