INSERT INTO uiut_layouts (
    layout_name
) VALUES (
    'Sample dashboard'
);

DECLARE
BEGIN
    FOR i IN 1..15 LOOP

        INSERT INTO uiut_regions (
            layout_id,
            region_name,
            region_width_cols,
            description
        ) VALUES (
            (SELECT layout_id FROM uiut_layouts ORDER BY layout_id ASC FETCH FIRST 1 ROW ONLY),
            'Sample region ' || CAST(i AS VARCHAR2(255)),
            CASE WHEN i < 10 THEN 3 ELSE 6 END,
            'Description for sample region number ' || CAST(i AS VARCHAR2(255))
        );

    END LOOP;
END;

-- COMMIT;

SELECT * FROM uiut_layouts;
SELECT * FROM uiut_regions;

-- fill in your layout, then

INSERT INTO uiut_default_layout_regions (
    region_id,
    section_num,
    region_order
)
SELECT 
    usreg.region_id,
    usreg.section_num,
    usreg.region_order
FROM uiut_user_section_regions usreg
INNER JOIN uiut_regions reg
ON reg.region_id = usreg.region_id
WHERE usreg.user_name = 'AFREE'
AND layout_id = (
    SELECT layout_id
    FROM uiut_layouts
    WHERE layout_name = 'Sample dashboard'
);

DELETE FROM uiut_user_section_regions;

