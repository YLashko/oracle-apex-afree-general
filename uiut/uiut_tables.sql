CREATE TABLE uiut_regions (
    region_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
    region_name VARCHAR2(512) NOT NULL,
    region_width_cols NUMBER NOT NULL,
    description VARCHAR2(4096),
    CONSTRAINT uiut_regions_region_width_cols_chk CHECK (region_width_cols BETWEEN 1 AND 12)
);

CREATE TABLE uiut_user_section_regions (
    user_section_id NUMBER GENERATED BY DEFAULT ON NULL AS IDENTITY PRIMARY KEY,
    user_name VARCHAR2(255) NOT NULL,
    section_num NUMBER NOT NULL,
    region_order NUMBER NOT NULL,
    region_id NUMBER NOT NULL,
    CONSTRAINT uiut_user_section_regions_to_uiut_regions_fk
        FOREIGN KEY (region_id) REFERENCES uiut_regions (region_id)
);

ALTER TABLE uiut_user_section_regions
    ADD CONSTRAINT uiut_user_section_regions_uq UNIQUE (user_name, region_id);
