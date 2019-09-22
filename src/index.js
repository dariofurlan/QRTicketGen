import './style.scss';

// use double hash
// one known to every staff memebers
// one known only by the brain to verify the correctness
// does it make sense?

const jsPDF = require('jspdf');
const html2canvas = require('html2canvas');
const sha256 = require('sha256');
const QRCode = require('qrcode');
const out_div = document.getElementById('out');

const DEFAULT_WIDTH = 85.60;
const DEFAULT_HEIGHT = 53.90;

class Face {
    constructor(width, height, backgroundColor) {
        this.width = width;
        this.height = height;
        this.backgroundColor = backgroundColor;

        this.el = document.createElement('div');
        this.el.style.display = "inline-block";
        this.el.style.position = "relative";
        this.refreshStyle();
    }

    refreshStyle() {
        this.el.style.width = this.width+"mm";
        this.el.style.height = this.height+"mm";
        this.el.style.backgroundColor = this.backgroundColor;
    }

    clone() {
        return this.el.cloneNode(true);
    }
}

class Front extends Face{
    constructor(width, height, backgroundColor) {
        super(width, height, backgroundColor);
    }

    addIMG(src) {
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

class Back extends Face{
    constructor(width, height, backgroundColor) {
        super(width, height, backgroundColor);
    }

    addQR(string) {
        let svg = new DOMParser().parseFromString(string, 'text/html').body.firstChild;
        svg.style.backgroundColor = "white";
        svg.style.width = 40+"mm";
        svg.style.height = 40+"mm";
        svg.firstChild.outerHTML = null;
        svg.style.position = "absolute";
        svg.style.top = "50%";
        svg.style.left = "50%";
        svg.style.transform = "translate(-50%,-50%)";
        this.qr = svg;
        this.el.appendChild(this.qr);
    }
}

class Ticket {
    constructor(width, height, backgroundColor_F, backgroundColor_B, bleed) {
        this.width = width;
        this.height = height;
        this.backgroundColor_F = backgroundColor_F;
        this.backgroundColor_B = backgroundColor_B;
        this.bleed = bleed;
        this.front = new Front(width, height, this.backgroundColor_F);
        this.back = new Back(width, height, this.backgroundColor_B);
        this.refresh();
    }

    refresh() {
        this.front.width = this.width;
        this.front.height = this.height;
        this.front.backgroundColor = this.backgroundColor_F;
        this.back.width = this.width;
        this.back.height = this.height;
        this.back.backgroundColor = this.backgroundColor_B;
        this.front.refreshStyle();
        this.back.refreshStyle();
    }
}

// STANDARD BLEED AREA 3.175

const PreviewTicket = new Ticket(DEFAULT_WIDTH, DEFAULT_HEIGHT, "transparent", "black");
document.getElementById('td-pw-front').appendChild(PreviewTicket.front.el);
document.getElementById('td-pw-back').appendChild(PreviewTicket.back.el);
QRCode.toString("Marcello bello, monello cammina sul menestrello senza borsello", {errorCorrectionLevel: 'H', type:"svg"}, function (err, string) {
    if (err) throw err;
    PreviewTicket.back.addQR(string);
});

document.getElementById('bg-color').onsubmit = (obj) => {
    PreviewTicket.backgroundColor = obj.target.value;
};
document.getElementById('front-graphic').onchange = function (evt) {
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

    // FileReader support
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.onload = function () {
            PreviewTicket.front.addIMG(fr.result);
        };
        fr.readAsDataURL(files[0]);
    }

    // Not supported
    else {
        // fallback -- perhaps submit the input to an iframe and temporarily store
        // them on the server until the user's session ends.
    }
};

document.getElementById('gen').onclick = () => {
    const static_string = document.getElementById('static_string').value;
    const salt = document.getElementById('salt').value;
    const quantity = document.getElementById('quantity').value;

    const tickets = [];
    const out_hashes = gen_hashes(static_string, salt, quantity);
    for (let hash in out_hashes) {

        QRCode.toCanvas(hash, {errorCorrectionLevel: 'H', maskPattern:5}, function (err, canvas) {
            if (err) throw err;
            // out_div.appendChild(canvas)
        })
    }
};

function gen_hashes(static_string, salt, quantity) {
    let stat = static_string + salt;
    let out = [];
    for (let i = 0; i < quantity; i++) {
        out[i] = sha256(stat + i.toString());
        console.log(out[i]);
        let ticket = new Ticket(DEFAULT_WIDTH, DEFAULT_HEIGHT, "green", "black");
        QRCode.toString(out[i], {errorCorrectionLevel: 'H', type:"svg"}, function (err, string) {
            if (err) throw err;
            ticket.back.addQR(string);
            out_div.appendChild(ticket.back.el);
        })
    }
    return out;
}