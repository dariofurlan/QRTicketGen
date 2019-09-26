const QRCode = require('qrcode');

class Face {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.backgroundColor = "#000";
        this.bleed = 0;

        this.el = document.createElement('div');
        this.el.style.display = "inline-block";
        this.el.style.position = "relative";
        this.el.style.zIndex = "0";

        this.marker = document.createElement('div');
        this.marker.style.display = "none";
        this.marker.style.position = "absolute";
        this.marker.style.zIndex = "1";
        this.marker.style.top = "50%";
        this.marker.style.left = "50%";
        this.marker.style.transform = "translate(-50%,-50%)";
        this.marker.style.border = "1px dashed white";
        this.pw = false;

        // this.marker.style.filter = "invert(1)";
        this.el.appendChild(this.marker);
        this.refresh();
    }

    refresh() {
        if (this.pw) {
            this.marker.style.display = "inline-block";
        } else {
            this.marker.style.display = "none";
        }
        this.el.style.width = (this.width + 2 * this.bleed) + "mm"; // issues with the parenthesis number tunerd into string
        this.el.style.height = (this.height + 2 * this.bleed) + "mm";
        this.marker.style.width = this.width + "mm";
        this.marker.style.height = this.height + "mm";
        this.el.style.backgroundColor = this.backgroundColor;
        this.el.style.padding = this.bleed;
    }

    clone() {
        return this.el.cloneNode(true);
    }
}

class Front extends Face {
    constructor() {
        super();
    }

    addIMG(src) {
        if (this.img !== undefined)
            this.img.parentNode.removeChild(this.img);
        if (src === null || src === undefined || src === "")
            return;
        this.img = document.createElement('img');
        this.img.src = src;
        this.img.style.width = "100%";
        this.img.style.height = "100%";
        this.img.style.position = "absolute";
        this.img.style.top = "50%";
        this.img.style.left = "50%";
        this.img.style.transform = "translate(-50%,-50%)";


        this.el.appendChild(this.img);
    }
}

class Back extends Face {
    constructor() {
        super();
        this.qr_size = 0;
    }

    addQR(str) {
        if (this.qr !== undefined)
            this.qr.parentNode.removeChild(this.qr);
        QRCode.toString(str, {errorCorrectionLevel: 'H', type: "svg"}, (err, qr) => {
            if (err) throw err;
            let svg = new DOMParser().parseFromString(qr, 'text/html').body.firstChild;
            svg.style.backgroundColor = "white";
            svg.style.width = this.qr_size + "mm";
            svg.style.height = this.qr_size + "mm";
            svg.firstChild.outerHTML = null;
            svg.style.position = "absolute";
            svg.style.top = "50%";
            svg.style.left = "50%";
            svg.style.transform = "translate(-50%,-50%)";
            this.qr = svg;
            this.el.appendChild(this.qr);
        });
    }
}

class Ticket {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.bleed = 0;
        this.qr_size = 0;
        this.pw = false;
        this.front = new Front();
        this.back = new Back();
        this.refresh();
    }

    refresh() {
        this.front.width = this.width;
        this.front.height = this.height;
        this.front.bleed = this.bleed;
        this.front.pw = this.pw;
        this.front.refresh();

        this.back.width = this.width;
        this.back.height = this.height;
        this.back.bleed = this.bleed;
        this.back.pw = this.pw;
        this.back.qr_size = this.qr_size;
        this.back.refresh();
    }
}

function horiz_marker_box() {
    let marker_box = document.createElement('div');
    marker_box.style.boxSizing = "content-box";
    marker_box.style.width = "100%";
    marker_box.style.height = "100%";
    marker_box.style.borderLeft = "1px solid black";
    marker_box.style.borderRight = "1px solid black";
    return marker_box;
}

function vert_marker_box() {
    let marker_box = document.createElement('div');
    marker_box.style.boxSizing = "content-box";
    marker_box.style.width = "100%";
    marker_box.style.height = "100%";
    marker_box.style.borderTop = "1px solid black";
    marker_box.style.borderBottom = "1px solid black";
    return marker_box;
}

function th() {
    let el = document.createElement('th');
    el.style.margin = "0";
    el.style.padding = "0";

    return el;
}

function tr() {
    let el = document.createElement('tr');
    el.style.margin = "0";
    el.style.padding = "0";

    return el;
}

function td(id) {
    let el = document.createElement('td');
    el.style.margin = "0";
    el.style.padding = "0";
    if (id) {
        el.id = id;
    }

    return el;
}

function appenChilds(parent, child_list) {
    for (let child in child_list) {
        child_list[child].width = 100 / child_list.length;
        parent.appendChild(child_list[child]);
    }
}

class Grid {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.rows = 0;
        this.cols = 0;
        this.tickets_td = [];
        this.ticket_width = 0;
        this.ticket_height = 0;
        this.marker = 6;
        this.bleed = 0;

        this.el = document.createElement('div');
        this.el.style.position = "relative";

        this.nested = document.createElement('div');
        this.nested.style.position = "absolute";
        this.nested.style.top = "50%";
        this.nested.style.left = "50%";
        this.nested.style.transform = "translate(-50%,-50%)";

        this.el.appendChild(this.nested);
    }

    refresh() {
        this.el.style.width = this.width;
        this.el.style.height = this.height;
        this.nested.style.width = ((this.ticket_width * this.cols) + 2 * this.marker) + "mm";
        this.nested.style.height = ((this.ticket_height * this.rows) + 2 * this.marker) + "mm";

        if (this.rows === 0 || this.cols === 0)
            return;
        if (this.table !== undefined)
            this.table.parentNode.removeChild(this.table);


        this.table = document.createElement('table');
        this.table.style.tableLayout = "fixed";
        this.table.style.width = "100%";
        this.table.style.height = "100%";

        let pre = tr();
        for (let r = 0; r < this.cols + 2; r++) {
            let m = th();
            if (r === 0 || r === this.cols + 1) {
                m.style.width = this.marker + "mm";
            } else {
                m.style.padding = "0 " + this.bleed + "mm";
                m.appendChild(horiz_marker_box());
            }
            m.style.height = this.marker + "mm";
            pre.appendChild(m);
        }
        this.table.appendChild(pre);

        for (let r = 0; r < this.rows; r++) {
            let row = tr();
            row.style.height = this.ticket_height + "mm";

            let m_l = td();
            m_l.style.height = "100%";
            m_l.style.padding = this.bleed + "mm 0mm";
            m_l.appendChild(vert_marker_box());
            row.appendChild(m_l);
            for (let c = 0; c < this.cols; c++) {
                let pos = r * this.cols + c;
                let col = td("grid" + pos);
                // col.style.outline = "1px solid black"; //todo developing purpose
                col.style.width = this.ticket_width;
                col.style.height = this.ticket_height;
                this.tickets_td.push(col);
                row.appendChild(col);
                console.log("r: " + r + " , c: " + c);
            }
            let m_r = td();
            m_r.style.height = "100%";
            m_r.style.padding = this.bleed + "mm 0mm";
            m_r.appendChild(vert_marker_box());
            row.appendChild(m_r);

            this.table.appendChild(row);
        }
        let post = tr();
        for (let r = 0; r < this.cols + 2; r++) {
            let m = th();
            if (r === 0 || r === this.cols + 1) {
                m.style.width = this.marker + "mm";
            } else {
                m.style.padding = "0 " + this.bleed + "mm";
                m.appendChild(horiz_marker_box());
            }
            m.style.height = this.marker + "mm";
            post.appendChild(m);
        }
        this.table.appendChild(post);
        this.nested.appendChild(this.table);
    }
}

class Page {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.padding = 0;
        this.pw = false;
        this.rows = 0;
        this.cols = 0;
        this.grid = new Grid();

        this.el = document.createElement('div');
        this.el.style.outline = "1px solid black";

        this.table = document.createElement('table');
        this.tr_top = tr();
        this.top_left_corner = td();
        this.top_left = td('top-left');
        this.top_centre = td('top-centre');
        this.top_right = td('top-right');
        this.top_right_corner = td();
        appenChilds(this.tr_top, [this.top_left_corner, this.top_left, this.top_centre, this.top_right, this.top_right_corner]);
        this.table.appendChild(this.tr_top);

        this.tr_mid = tr();
        this.mid_left = td();
        this.mid_centre = td('content-box');
        this.mid_centre.colSpan = "3";
        this.mid_right = td();
        appenChilds(this.tr_mid, [this.mid_left, this.mid_centre, this.mid_right]);
        this.table.appendChild(this.tr_mid);

        this.tr_bot = tr();
        this.bot_left_corner = td();
        this.bot_left = td('bot-left');
        this.bot_centre = td('bot-centre');
        this.bot_right = td('bot-right');
        this.bot_right_corner = td();
        appenChilds(this.tr_bot, [this.bot_left_corner, this.bot_left, this.bot_centre, this.bot_right, this.bot_right_corner]);
        this.table.appendChild(this.tr_bot);
        // this.table.appendChild(this.bot);

        this.el.appendChild(this.table);
        this.mid_centre.appendChild(this.grid.el);
    }

    refresh() {
        let left_right = [this.top_left_corner, this.mid_left, this.bot_left_corner, this.top_right_corner, this.mid_right, this.bot_right_corner];
        for (let el in left_right) {
            left_right[el].style.width = this.padding + "mm";
            left_right[el].style.outline = (this.pw) ? "1px dotted black" : "";
        }
        let top_bot = [this.top_left_corner, this.top_left, this.top_centre, this.top_right, this.top_right_corner, this.bot_left_corner, this.bot_left, this.bot_centre, this.bot_right, this.bot_right_corner];
        for (let el in top_bot) {
            top_bot[el].style.height = this.padding + "mm";
            top_bot[el].style.outline = (this.pw) ? "1px dotted black" : "";
        }
        // this.mid_centre.style.width = (this.width - (2 * this.padding)) + "mm";
        // this.mid_centre.style.height = (this.height - (2 * this.padding)) + "mm";
        let content_width = (this.width - (2 * this.padding)) + "mm"; // TODO count the cut markers
        let content_height = (this.height - (2 * this.padding)) + "mm"; // TODO count the cut markers
        // this.mid_centre.style.width = content_width;
        // this.mid_centre.style.height = content_height;
        this.el.style.width = this.width + "mm";
        this.el.style.height = this.height + "mm";
        this.table.style.width = this.width + "mm";
        this.table.style.height = this.height + "mm";

        this.grid.width = content_width;
        this.grid.height = content_height;
        this.grid.rows = this.rows;
        this.grid.cols = this.cols;

        this.grid.refresh();
    }
}

//TODO front page subclass
//TODO back page subclass

const PAPER_SIZES = {
    "A0": {
        "w": 841,
        "h": 1189
    },
    "A0+": {
        "w": 914,
        "h": 1292
    },
    "A1": {
        "w": 594.5,
        "h": 841
    },
    "A1+": {
        "w": 609,
        "h": 914
    },
    "A2": {
        "w": 420.5,
        "h": 594.5
    },
    "A3": {
        "w": 297.25,
        "h": 420.5
    },
    "A3+": {
        "w": 329,
        "h": 483
    },
    "A4": {
        "w": 210.25,
        "h": 297.25
    },
    "A5": {
        "w": 148.62,
        "h": 210.25
    },
    "A6": {
        "w": 105.12,
        "h": 148.62
    },
    "A7": {
        "w": 74.31,
        "h": 105.12
    },
    "A8": {
        "w": 52.56,
        "h": 74.31
    }
};

export {
    Ticket, PAPER_SIZES, Page
}