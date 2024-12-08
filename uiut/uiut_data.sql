DECLARE
BEGIN
    FOR i IN 1..15 LOOP

        INSERT INTO uiut_regions (
            region_name,
            region_width_cols,
            description
        ) VALUES (
            'Sample region ' || CAST(i AS VARCHAR2(255)),
            CASE WHEN i < 10 THEN 3 ELSE 6 END,
            'Description for sample region number ' || CAST(i AS VARCHAR2(255))
        );

    END LOOP;
END;
