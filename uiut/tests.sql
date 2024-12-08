SELECT * FROM uiut_user_section_regions;

SELECT
    JSON_ARRAYAGG(
        JSON_OBJECT(
            KEY 'row_num' VALUE usreg.section_num,
            KEY 'regions' VALUE JSON_ARRAYAGG(
                JSON_OBJECT(
                    KEY 'name' VALUE reg.region_name,
                    KEY 'width' VALUE reg.region_width_cols,
                    KEY 'reg_id' VALUE reg.region_id
                )
            )
        )
    )
    
FROM uiut_user_section_regions usreg
INNER JOIN uiut_regions reg
ON usreg.region_id = reg.region_id
WHERE user_name = 'AFREE'
GROUP BY usreg.section_num
;
