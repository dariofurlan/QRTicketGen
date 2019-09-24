import './style.scss';
import {PAPER_SIZES, Ticket} from './classes.js';

// use double hash
// one known to every staff memebers
// one known only by the brain to verify the correctness
// does it make sense?

const jsPDF = require('jspdf');
const html2canvas = require('html2canvas');
const sha256 = require('sha256');

const out_div = document.getElementById('out');

const DEFAULT_WIDTH = 85.60;
const DEFAULT_HEIGHT = 53.90;
const DEFAULT_BLEED = 3.2;

// STANDARD BLEED AREA 3.175


new Settings();

function Settings() {
    const PreviewTicket = new Ticket();
    const _static_text = document.getElementById('static_string'); //oninput
    const _salt = document.getElementById('salt'); //oninput
    const _quantity = document.getElementById('quantity'); //oninput
    const _ticket_width = document.getElementById('ticket_width');
    const _ticket_height = document.getElementById('ticket_height');
    const _front_graphic = document.getElementById('front-graphic');
    // back graphic?
    const _front_bg_color = document.getElementById('front_bg_color');
    const _back_bg_color = document.getElementById('back_bg_color');
    const _bleed = document.getElementById('bleed');
    const _qr_size = document.getElementById('qr-size');
    const _page_size = document.getElementById('page_size');
    const _custom_page_width = document.getElementById('page_width');
    const _custom_page_height = document.getElementById('page_height');
    const _page_orientation = document.getElementById('page_orientation');

    let static_text = "";
    let salt = "";
    let quantity = 0;
    let ticket_width = DEFAULT_WIDTH;
    let ticket_height = DEFAULT_HEIGHT;
    let front_graphic = "";
    // back graphic?
    let front_bg_color = "#000000";
    let back_bg_color = "#000000";
    let bleed = DEFAULT_BLEED;
    let qr_size = 40;
    let page_size = "A4";
    let custom_width = "";
    let custom_height = "";
    let page_orientation = "landscape";

    //init with default values
    _static_text.value = static_text;
    _salt.value = salt;
    _quantity.value = quantity;
    _ticket_width.value = ticket_width;
    _ticket_height.value = ticket_height;
    _front_graphic.value = front_graphic;
    // back graphic?
    _front_bg_color.value = front_bg_color;
    _back_bg_color.value = back_bg_color;
    _bleed.value = bleed;
    _qr_size.value = qr_size;
    for (let type in PAPER_SIZES) {
        for (let paper_size in type) {

        }
    }

    document.getElementById('td-pw-front').appendChild(PreviewTicket.front.el);
    document.getElementById('td-pw-back').appendChild(PreviewTicket.back.el);

    this.load = () => {

        console.log(front_bg_color, back_bg_color);
        _qr_size.max = Math.min(ticket_width, ticket_height);
        PreviewTicket.width = ticket_width;
        PreviewTicket.height = ticket_height;
        PreviewTicket.front.addIMG(front_graphic);
        PreviewTicket.front.backgroundColor = front_bg_color;
        PreviewTicket.back.backgroundColor = back_bg_color;
        PreviewTicket.bleed = bleed;
        PreviewTicket.back.qr_size = qr_size;
        PreviewTicket.back.addQR(sha256(static_text + salt + "0"));

        PreviewTicket.refresh();
    };

    // events
    _static_text.oninput = () => {
        static_text = _static_text.value;
        this.load()
    };
    _salt.oninput = () => {
        salt = _salt.value;
        this.load()
    };
    _quantity.oninput = () => {
        quantity = _quantity.value;
        this.load()
    };
    _ticket_width.oninput = () => {
        ticket_width = _ticket_width.value;
        this.load()
    };
    _ticket_height.oninput = () => {
        ticket_height = _ticket_height.value;
        this.load()
    };
    _front_graphic.onchange = (evt) => {
        let tgt = evt.target || window.event.srcElement,
            files = tgt.files;
        // FileReader support
        if (FileReader && files && files.length) {
            let fr = new FileReader();
            fr.onload = () => {
                front_graphic = fr.result;
                this.load();
            };
            fr.readAsDataURL(files[0]);
        }
    };
    _front_bg_color.onchange = () => {
        front_bg_color = _front_bg_color.value;
        this.load()
    };
    _back_bg_color.onchange = () => {
        back_bg_color = _back_bg_color.value;
        this.load()
    };
    _bleed.oninput = () => {
        bleed = _bleed.value;
        this.load()
    };
    _qr_size.oninput = () => {
        qr_size = _qr_size.value;
        this.load()
    };


    this.load();
}

document.getElementById('gen').onclick = () => {
    const static_string = document.getElementById('static_string').value;
    const salt = document.getElementById('salt').value;
    const quantity = document.getElementById('quantity').value;

    const tickets = [];
    const out_hashes = gen_hashes(static_string, salt, quantity);
    for (let hash in out_hashes) {

        QRCode.toCanvas(hash, {errorCorrectionLevel: 'H', maskPattern: 5}, function (err, canvas) {
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
        QRCode.toString(out[i], {errorCorrectionLevel: 'H', type: "svg"}, function (err, string) {
            if (err) throw err;
            ticket.back.addQR(string);
            out_div.appendChild(ticket.back.el);
        })
    }
    return out;
}