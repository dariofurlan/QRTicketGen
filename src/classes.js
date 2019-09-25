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
        this.marker.style.display = "inline-block";
        this.marker.style.position = "absolute";
        this.marker.style.zIndex = "1";
        this.marker.style.top = "50%";
        this.marker.style.left = "50%";
        this.marker.style.transform = "translate(-50%,-50%)";
        this.marker.style.border = "1px dashed white";

        // this.marker.style.filter = "invert(1)";
        this.el.appendChild(this.marker);
        this.refresh();
    }

    refresh() {
        this.el.style.width = this.width + "mm";
        this.el.style.height = this.height + "mm";
        this.marker.style.width = this.width - this.bleed + "mm";
        this.marker.style.height = this.height - this.bleed + "mm";
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
        this.front = new Front();
        this.back = new Back();
        this.refresh();
    }

    refresh() {
        this.front.width = this.width + this.bleed;
        this.front.height = this.height + this.bleed;
        this.front.bleed = this.bleed;
        this.back.width = this.width + this.bleed;
        this.back.height = this.height + this.bleed;
        this.back.bleed = this.bleed;
        this.back.qr_size = this.qr_size;
        this.front.refresh();
        this.back.refresh();
    }
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
        child_list[child].width=100/child_list.length;
        parent.appendChild(child_list[child]);
    }
}

class Page {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.padding = 0;

        this.el = document.createElement('div');
        this.el.style.border = "1px solid black";

        this.table = document.createElement('table');
        let top = tr();
        this.top_left_corner = td();
        this.top_left = td('top-left');
        this.top_centre = td('top-centre');
        this.top_right = td('top-right');
        this.top_right_corner = td();
        appenChilds(top, [this.top_left_corner, this.top_left, this.top_centre, this.top_right, this.top_right_corner]);
        this.table.appendChild(top);
        let mid1 = tr();
        this.mid_left_top = td();
        this.mid_centre = td('content-box');
        this.mid_centre.rowSpan = "3";
        this.mid_centre.colSpan = "3";
        this.mid_right_top = td();
        appenChilds(mid1, [this.mid_left_top, this.mid_centre, this.mid_right_top])
        let mid2 = tr();
        this.mid_left_mid = td();
        this.mid_right_mid = td();
        appenChilds(mid2, [this.mid_left_mid, this.mid_right_mid]);
        let mid3 = tr();
        this.mid_left_bot = td();
        this.mid_right_bot = td();
        appenChilds(mid3, [this.mid_left_bot, this.mid_right_bot]);
        appenChilds(this.table, [mid1,mid2,mid3]);
        let bot = tr();
        this.bot_left_corner = td();
        this.bot_left = td('bot-left');
        this.bot_centre = td('bot-centre');
        this.bot_right = td('bot-right');
        this.bot_right_corner = td();
        appenChilds(bot, [this.bot_left_corner, this.bot_left, this.bot_centre, this.bot_right, this.bot_right_corner]);
        this.table.appendChild(bot);
        // this.table.appendChild(this.bot);

        this.el.appendChild(this.table);
    }

    refresh() {
        let left = [this.top_left_corner, this.mid_left_top, this.mid_left_mid, this.mid_left_bot, this.bot_left_corner];
        for (let el in left) {
            left[el].style.width = this.padding+"mm";
        }
        let right = [this.top_right_corner, this.mid_right_top, this.mid_right_mid, this.mid_right_bot, this.bot_right_corner];
        for (let el in right) {
            right[el].style.width = this.padding+"mm";
        }
        let top = [this.top_left_corner, this.top_left, this.top_centre, this.top_right, this.top_right_corner];
        for (let el in top) {
            top[el].style.height = this.padding+"mm";
        }
        let bot = [this.bot_left_corner, this.bot_left, this.bot_centre, this.bot_right, this.bot_right_corner];
        for (let el in bot) {
            bot[el].style.height = this.padding+"mm";
        }
        this.el.style.width = this.width+"mm";
        this.el.style.height = this.height+"mm";
    }
}

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