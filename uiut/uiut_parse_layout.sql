CREATE OR REPLACE PROCEDURE uiut_parse_layout(p_user_name VARCHAR2, p_layout_id NUMBER, p_json_data CLOB)
AS
    v_row_num NUMBER;
    v_reg_id NUMBER;
BEGIN
    DELETE FROM uiut_user_section_regions
    WHERE user_name = p_user_name;

    FOR reg IN (
        SELECT 
            j.reg_id,
            j.row_num,
            j.reg_order
        FROM JSON_TABLE(p_json_data, '$'
            COLUMNS (
                row_num NUMBER PATH '$[*].row_num',
                NESTED PATH '$[*].regions[*]'
                COLUMNS(
                    reg_id PATH '$.reg_id',
                    reg_order PATH '$.reg_order'
                )
            )
        ) j
        INNER JOIN uiut_regions reg
        ON j.reg_id = reg.region_id
        WHERE reg.layout_id = p_layout_id
    ) LOOP -- TODO optimize
        INSERT INTO uiut_user_section_regions (
            user_name,
            section_num,
            region_id,
            region_order
        ) VALUES (
            p_user_name,
            reg.row_num,
            reg.reg_id,
            reg.reg_order
        );
    END LOOP;
END;
