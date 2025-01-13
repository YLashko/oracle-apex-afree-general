var uiut_dragged = null;

function construct_region_miniature(name, width, id, row_obj) {
    let el = document.createElement('div');
    el.setAttribute('col-width', width);
    el.setAttribute('reg-id', id);
    el.classList.add('uiut-region-draggable', `reg-${width}`);
    el.draggable = true;
    let inner_span = document.createElement('span');
    inner_span.classList.add('uiut-region-name');
    inner_span.innerText = name;
    el.appendChild(inner_span);

    el.row_obj = row_obj;
    el.addEventListener('dragstart', region_dragstart);
    el.addEventListener('dragover', (event) => {
        if (el.row_obj.can_fit(uiut_dragged) && is_not_added(rows, uiut_dragged)) {
            el.classList.add('dragged-over');
            event.preventDefault();
        }
    });
    el.addEventListener('dragleave', (event) => {
        el.classList.remove('dragged-over');
    });
    el.addEventListener('drop', (event) => {
        el.row_obj.add_region_before_another(uiut_dragged, el);
        el.classList.remove('dragged-over');
        uiut_dragged = null;
        event.preventDefault();
    });

    return el;
}

function region_dragstart(event) {
    uiut_dragged = event.target;
    if (uiut_dragged.row_obj != undefined) {
        setTimeout(() => {
            uiut_dragged.row_obj.remove_region(uiut_dragged);
        }, 1);
    }
}

function load_dashboard(dashboard_json, dashboard_el, reg_id_fn, total_rows) {
    let rows = [];
    let temp_el = document.createElement('div');
    dashboard_el.parentElement.appendChild(temp_el);
    for (let i_row = 0; i_row < total_rows; i_row++) {
        let row = document.createElement('div');
        row.classList.add('row', 'responsive-row');
        rows.push(row);
        temp_el.appendChild(row);
    }

    for (let reg of dashboard_json.sort((a, b) => {
        return a["reg_order"] - b["reg_order"];
    })) {
        let reg_el = document.getElementById(reg_id_fn(reg['reg_id']));
        if (reg['row_num'] > rows.length || reg['row_num'] < 1) {
            throw new Error('Invalid row number');
        }

        reg_el.parentElement.classList.remove('col-start', 'col-end');
        reg_el.parentElement.classList.add(`responsive-col-${reg['width']}`);
        rows[reg['row_num'] - 1].appendChild(reg_el.parentElement);
    }

    for (let i_row = 0; i_row < total_rows; i_row++) {
        dashboard_el.appendChild(rows[i_row])
    }
}

function construct_miniature_row(row_obj) {
    let row_el = document.createElement('div');
    row_el.classList.add('uiut-dashboard-miniature-row');
    let row_add_el = document.createElement('div');
    row_add_el.classList.add('uiut-add-element');
    let icon_el = document.createElement('span');
    icon_el.classList.add('fa', 'fa-plus', 'miniature-icon');
    icon_el["aria-hidden"] = true;
    row_add_el.appendChild(icon_el);
    row_el.appendChild(row_add_el);


    row_add_el.addEventListener('dragenter', (event) => {
        if (row_obj.can_fit(uiut_dragged) && is_not_added(rows, uiut_dragged)) {
            event.target.classList.add('dragged-over');
        }   
    });
    row_add_el.addEventListener('dragleave', (event) => {
        event.target.classList.remove('dragged-over');
    });
    row_add_el.addEventListener('dragover', (event) => {
        if (row_obj.can_fit(uiut_dragged) && is_not_added(rows, uiut_dragged)) {
            event.preventDefault();
        }
    });
    row_add_el.addEventListener('drop', (event) => {
        // uiut_dragged.row_obj.remove_region(uiut_dragged);
        row_obj.add_region_for_add_el(uiut_dragged);
        row_add_el.classList.remove('dragged-over');
        uiut_dragged = null;
        // uiut_dragged.classList.remove('hidden');
        event.preventDefault();
    });

    return row_el;
}

class DashBoardMiniatureRow {
    constructor(row_num, miniature_el) {
        this.row_num = row_num;
        this.row_element = construct_miniature_row(this);
        miniature_el.appendChild(this.row_element);
        this.add_reg_element = this.row_element.querySelector('.uiut-add-element');
        this.regions = [];
        this.total_width = 0
        this.max_width = 12
    }

    add_region_for_add_el(reg) { // reg is an html element
        let reg_width = parseInt(reg.getAttribute('col-width'));
        if (this.total_width + reg_width > this.max_width) {
            throw new Error('Max width exceeded: ' + (this.total_width + reg_width));
        }
        let reg_to_place = this.get_region_or_construct_new(reg);

        this.row_element.insertBefore(reg_to_place, this.add_reg_element);
        this.regions.push(reg_to_place);
        this.total_width += reg_width;

        if (this.total_width === this.max_width) {
            this.add_reg_element.classList.add('hidden');
        }
    }

    add_region_before_another(reg, before) { // reg is an html element
        if (!this.regions.includes(before)) {
            throw new Error('Element does not exist');
        }
        let reg_width = parseInt(reg.getAttribute('col-width'));
        if (this.total_width + reg_width > this.max_width) {
            throw new Error('Max width exceeded: ' + (this.total_width + reg_width));
        }
        let reg_to_place = this.get_region_or_construct_new(reg);
        let reg_index = this.regions.indexOf(before);

        reg_to_place.row_obj = this;
        this.row_element.insertBefore(reg_to_place, this.regions[reg_index]);
        this.regions.splice(reg_index, 0, reg_to_place);

        this.total_width += reg_width;
        if (this.total_width === this.max_width) {
            this.add_reg_element.classList.add('hidden');
        }
    }

    get_region_or_construct_new(reg) {
        if (reg.row_obj != null) {
            return reg;
        } else {
            return construct_region_miniature (
                reg.querySelector(".uiut-region-name").innerText,
                parseInt(reg.getAttribute("col-width")),
                parseInt(reg.getAttribute("reg-id")),
                this
            );
        }
    }

    remove_region(reg) {
        if (!this.regions.includes(reg)) {
            throw new Error('Element does not exist');
        }
        let show_add_el = this.total_width === this.max_width;

        reg.row_obj = null;
        this.total_width -= parseInt(reg.getAttribute('col-width'));
        this.row_element.removeChild(reg);
        this.regions.splice(this.regions.indexOf(reg), 1);

        if (show_add_el) {
            this.add_reg_element.classList.remove('hidden');
        }
    }

    includes_reg_by_id(reg_id) { // reg_id is not parsed to int
        return this.regions.map((reg) => {return reg.getAttribute('reg-id')}).includes(reg_id);
    }

    can_fit(reg) {
        return parseInt(reg.getAttribute('col-width')) + this.total_width <= this.max_width;
    }

    load_regions(regions) { // here regions is a json list
        for (let reg of regions) {
            this.add_region_for_add_el(construct_region_miniature(reg["name"], reg["width"], reg["reg_id"], this));
        }
    }
}

function is_not_added(rows, reg) {
    for (let row of rows) {
        if (row.includes_reg_by_id(reg.getAttribute('reg-id'))) {
            return false;
        }
    }
    return true;
}

function collect_layout_data(rows) {
    return rows.map((row) => {
        return {
            "row_num": row.row_num,
            "regions": row.regions.map((region, index) => {
                return {
                    "reg_id": parseInt(region.getAttribute('reg-id')),
                    "reg_order": index
                }
            })
        }
    });
}
