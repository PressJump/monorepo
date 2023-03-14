
/*
  Our Function for base36 conversion and postid generation
*/

CREATE OR REPLACE FUNCTION tobase36(numeric) RETURNS TEXT AS $$
DECLARE
   base36 TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   result TEXT := '';
   remainder INTEGER;
BEGIN
   IF $1 = 0 THEN
      RETURN '0';
   END IF;

   WHILE $1 > 0 LOOP
      remainder := $1 % 36;
      result := substring(base36, remainder+1, 1) || result;
      $1 := floor($1 / 36);
   END LOOP;

   RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Postid increment input id to base36 and applying an offset of 100000
CREATE OR REPLACE FUNCTION postid(numeric) RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- Get current row number as we dont have autoincrement Id

    result := tobase36($1 + 100000);
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Sequence
CREATE SEQUENCE postid_seq;

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "id" SET DEFAULT postid(nextval('postid_seq'));


