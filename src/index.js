import './style.scss';
import {Page, PAPER_SIZES, Ticket} from './classes.js';

const jsPDF = require('jspdf');
const html2canvas = require('html2canvas');
const sha256 = require('sha256');

const out_div = document.getElementById('out');

const DEFAULT_WIDTH = 85.60;
const DEFAULT_HEIGHT = 54.0;
const DEFAULT_BLEED = 3.2;

new Settings();

function Settings() {
    const PreviewTicket = new Ticket();
    const FrontPage = new Page();
    const _static_text = document.getElementById('static_string');
    const _salt = document.getElementById('salt');
    const _quantity = document.getElementById('quantity');
    const _ticket_width = document.getElementById('ticket_width');
    const _ticket_height = document.getElementById('ticket_height');
    const _front_graphic = document.getElementById('front-graphic');
    // back graphic?
    const _front_bg_color = document.getElementById('front_bg_color');
    const _back_bg_color = document.getElementById('back_bg_color');
    const _bleed = document.getElementById('bleed');
    const _qr_size = document.getElementById('qr_size');
    const _page_size = document.getElementById('page_size');
    const _custom_page_width = document.getElementById('page_width');
    const _custom_page_height = document.getElementById('page_height');
    const _page_orientation = document.getElementById('page_orientation');
    const _page_padding = document.getElementById('page_padding');
    const _preview_toggle = document.getElementById('preview_toggle');

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
    let page_size = "";
    let page_width = 200;
    let page_height = 100;
    let page_orientation = 1;
    let page_padding = 10;
    let preview = true;
    let rows = 0;
    let cols = 0;

    //init with default values
    let init = () => {
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
            let option = document.createElement('option');
            option.innerHTML = type + " " + PAPER_SIZES[type]["w"] + "x" + PAPER_SIZES[type]["h"];
            option.value = type;
            _page_size.appendChild(option);
        }
        _custom_page_width.value = page_width;
        _custom_page_height.value = page_height;
        _page_orientation.selectedIndex = page_orientation;
        _page_padding.value = page_padding;
        _preview_toggle.checked = preview;
        _custom_page_width.min = ticket_width+page_padding;
        _custom_page_height.min = ticket_height+page_padding;

        document.getElementById('td-pw-front').appendChild(PreviewTicket.front.el);
        document.getElementById('td-pw-back').appendChild(PreviewTicket.back.el);
        document.getElementById('out').appendChild(FrontPage.el);
    };

    this.refresh = () => {
        rows = Math.floor((page_height - 2 * page_padding - 2 * FrontPage.grid.marker) / (ticket_height + bleed)); // TODO count the cut markers
        cols = Math.floor((page_width - 2 * page_padding - 2 * FrontPage.grid.marker) / (ticket_width + bleed)); // TODO count the cut markers
        let ticket_per_page = rows * cols;
        let pages_needed = Math.ceil(quantity/ticket_per_page);
        let reduntant_tickets = pages_needed*ticket_per_page - quantity;

        console.log(rows,cols);
        console.log("Ticket per pagina: "+ticket_per_page);
        console.log("Pagine necessarie: "+pages_needed);
        console.log("Ticket in più:"+reduntant_tickets);

        FrontPage.width = page_width;
        FrontPage.height = page_height;
        FrontPage.padding = page_padding;
        FrontPage.pw = preview;
        FrontPage.rows = rows;
        FrontPage.cols = cols;
        FrontPage.grid.ticket_width = ticket_width+2*bleed;
        FrontPage.grid.ticket_height = ticket_height+2*bleed;
        FrontPage.grid.bleed = bleed;

        PreviewTicket.pw = preview;
        PreviewTicket.width = ticket_width;
        PreviewTicket.height = ticket_height;
        PreviewTicket.front.addIMG(front_graphic);
        PreviewTicket.front.backgroundColor = front_bg_color;
        PreviewTicket.back.backgroundColor = back_bg_color;
        PreviewTicket.bleed = bleed;
        PreviewTicket.back.qr_size = qr_size;
        PreviewTicket.back.addQR(sha256(static_text + salt + "0"));

        PreviewTicket.refresh();
        FrontPage.refresh();
    };

    // events
    let events = () => {
        _static_text.oninput = () => {
            static_text = _static_text.value;
            this.refresh()
        };
        _salt.oninput = () => {
            salt = _salt.value;
            this.refresh()
        };
        _quantity.oninput = () => {
            quantity = parseInt(_quantity.value);
            this.refresh()
        };
        _ticket_width.oninput = () => {
            ticket_width = parseFloat(_ticket_width.value);
            _qr_size.max = Math.min(ticket_width, ticket_height);
            _custom_page_width.min = ticket_width+page_padding;
            this.refresh()
        };
        _ticket_height.oninput = () => {
            ticket_height = parseFloat(_ticket_height.value);
            _qr_size.max = Math.min(ticket_width, ticket_height);
            _custom_page_height.min = ticket_height+page_padding;
            this.refresh()
        };
        _front_graphic.onchange = (evt) => {
            let tgt = evt.target || window.event.srcElement,
                files = tgt.files;
            // FileReader support
            if (FileReader && files && files.length) {
                let fr = new FileReader();
                fr.onload = () => {
                    front_graphic = fr.result;
                    this.refresh();
                };
                fr.readAsDataURL(files[0]);
            }
        };
        _front_bg_color.onchange = () => {
            front_bg_color = _front_bg_color.value;
            this.refresh()
        };
        _back_bg_color.onchange = () => {
            back_bg_color = _back_bg_color.value;
            this.refresh()
        };
        _bleed.oninput = () => {
            bleed = parseFloat(_bleed.value);
            this.refresh()
        };
        _qr_size.oninput = () => {
            qr_size = parseFloat(_qr_size.value);
            this.refresh()
        };
        _page_size.onchange = () => {
            if (_page_size.value === "") {
                _custom_page_width.value = 0;
                _custom_page_height.value = 0;
                page_size = "";
                return;
            }

            page_size = _page_size.value;
            let d = PAPER_SIZES[page_size];
            if (_page_orientation.selectedIndex === 0) {
                page_width = d.w;
                page_height = d.h;
            } else {
                page_width = d.h;
                page_height = d.w;
            }
            _custom_page_width.value = page_width;
            _custom_page_height.value = page_height;
            this.refresh();
        };
        _custom_page_width.oninput = () => {
            page_width = parseFloat(_custom_page_width.value);
            _page_size.selectedIndex = 0;
            this.refresh();
        };
        _custom_page_height.oninput = () => {
            page_height = parseFloat(_custom_page_height.value);
            _page_size.selectedIndex = 0;
            this.refresh();
        };
        _page_orientation.onchange = () => {
            if (_page_orientation.selectedIndex === 0) {
                if (page_size === "") {
                    let new_width = Math.min(page_width, page_height);
                    let new_height = Math.max(page_width, page_height);
                    page_width = new_width;
                    page_height = new_height;
                } else {
                    page_width = PAPER_SIZES[page_size]["w"];
                    page_height = PAPER_SIZES[page_size]["h"];
                }
            } else {
                if (page_size === "") {
                    let new_width = Math.max(page_width, page_height);
                    let new_height = Math.min(page_width, page_height);
                    page_width = new_width;
                    page_height = new_height;
                } else {
                    page_width = PAPER_SIZES[page_size]["h"];
                    page_height = PAPER_SIZES[page_size]["w"];
                }
            }

            _custom_page_width.value = page_width;
            _custom_page_height.value = page_height;
            this.refresh();
        };
        _page_padding.oninput = () => {
            page_padding = parseInt(_page_padding.value);
            this.refresh()
        };
        _preview_toggle.onchange = () => {
            preview = _preview_toggle.checked;
            this.refresh();
        };
    };


    init();
    events();
    this.refresh();
}

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