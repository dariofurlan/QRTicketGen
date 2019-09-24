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
        QRCode.toString(str, {errorCorrectionLevel: 'H', type:"svg"}, (err, qr) => {
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
        this.front.width = this.width+this.bleed;
        this.front.height = this.height+this.bleed;
        this.front.bleed = this.bleed;
        this.back.width = this.width+this.bleed;
        this.back.height = this.height+this.bleed;
        this.back.bleed = this.bleed;
        this.back.qr_size = this.qr_size;
        this.front.refresh();
        this.back.refresh();
    }
}

class Page {
    constructor() {
        this.width = 0;
        this.height = 0;

        this.el = document.createElement('div');

    }

    refresh() {

    }
}

const PAPER_SIZES = {
    "A": {
        "0": {
            "w": 841,
            "h": 1189
        },
        "1": {
            "w": 594.5,
            "h": 841
        },
        "2": {
            "w": 420.5,
            "h": 594.5
        },
        "3": {
            "w": 297.25,
            "h": 420.5
        },
        "4": {
            "w": 210.25,
            "h": 297.25
        },
        "5": {
            "w": 148.625,
            "h": 210.25
        },
        "6": {
            "w": 105.125,
            "h": 148.625
        },
        "7": {
            "w": 74.3125,
            "h": 105.125
        },
        "8": {
            "w": 52.5625,
            "h": 74.3125
        },
        "9": {
            "w": 37.15625,
            "h": 52.5625
        }
    },
    "A+": {
        0 : {
            "w": 914,
            "h": 1292
        },
        1 : {
            "w": 609,
            "h": 914
        },
        3: {
            "w": 329,
            "h": 483
        }
    }

};

export {
    Face, Front, Back, Ticket, PAPER_SIZES
}