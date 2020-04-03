/*//////////////////////////////////////////////////////////////////////////////
///                                MyHomePage                                ///
//============================================================================//
//        Author: Marcin Żemlok
//         Email: marcinzemlok@gmail.com
//       Version: 0.2
//
//   Description: MyHomePage functionality.
//
// Creation date: 20/02/2020
================================= CHANGE LOG ===================================
// [20/02/2020]        Marcin Żemlok
        Added links wheel functionality draft.                               ///
// [03/04/2020]        Marcin Żemlok
        * Added force reload button.
        * Added circular link box.                                           ///
//////////////////////////////////////////////////////////////////////////////*/
////////////////////////////////////////////////////////////////////////////////
//  DATE & CLOCK FUNCTIONALITY                                              ///
//////////////////////////////////////////////////////////////////////////////
{
    let d = new Date(Date.now());
    // document.querySelector(".date").innerHTML = d.toLocaleDateString("en-US", {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "numeric",
    //     year: "numeric",
    // });
    let weekday = d.toLocaleString("en-US", { weekday: "long" });
    let day = d.toLocaleString("en-US", { day: "numeric" });
    let month = d.toLocaleString("en-US", { month: "2-digit" });
    let year = d.toLocaleString("en-US", { year: "numeric" });
    document.querySelector(".day").innerHTML = `${weekday}`;
    document.querySelector(".date").innerHTML = `${day}/${month}/${year}`;
}
const ham = document.querySelector(".clock");
const sec = document.querySelector(".seconds");
const clock = function () {
    const time = new Date();
    let s = time.getSeconds();
    let h = time.getHours();
    let m = time.getMinutes();
    if (s < 10) s = "0" + s;
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    sec.innerHTML = s;
    if (s == 0 || ham.innerHTML == "--:--") {
        ham.innerHTML = "" + h + ":" + m;
    }
}
clock();
window.setInterval(clock, 1000);

////////////////////////////////////////////////////////////////////////////////
//  INSPIRING TEXT                                                          ///
//////////////////////////////////////////////////////////////////////////////

const reloadButton = document.querySelector(".controll button");

var mzGetQuery = {
    url: "",
    options: {},
    getQuery: function () {
        let ret = this.url + "?";

        Object.entries(this.options).forEach((e, i) => {
            if (i != 0) ret += "&"
            ret += (e[0] + "=" + e[1]);
        });

        return ret;
    }
}

async function getDailyText(event=null, force=true) {
    const updateOutput = () => {
        const mainps = document.querySelectorAll(".main p");
        mainps[0].innerHTML = `<em>\"${dailyText.quote}\"</em>`;
        mainps[1].innerHTML = dailyText.author;
        document.querySelector("body").style.backgroundImage = `url(${dailyText.background})`;
    };

    let dailyText = {
        author: "",
        quote: "",
        background: "",
        update: 0
    };

    const res = await new Promise((resolve) => {
        chrome.storage.sync.get(["dailyText"], (res) => {
            resolve(res);
        });
    });

    if (res.dailyText != undefined || force) {
        dailyText.author = res.dailyText.author;
        dailyText.quote = res.dailyText.quote;
        dailyText.background = res.dailyText.background;
    }

    const day = Math.floor(Date.now() / 86400000);
    if (res.dailyText == undefined || day != res.dailyText.update || force) {

        // GET inpireting text
        const quote = await new Promise((resolve) => {
            const ins = new XMLHttpRequest();
            const url = 'https://quotes.rest/qod.json/?category=inspire';
            ins.open("GET", url);

            ins.onreadystatechange = () => {
                if (ins.readyState === 4 && ins.status === 200)
                    resolve(JSON.parse(ins.responseText));
            };

            ins.send();
        });

        // GET inspireing image
        const image = await new Promise((resolve) => {
            const ins = new XMLHttpRequest();
            mzGetQuery.url = "https://pixabay.com/api/";
            mzGetQuery.options = {
                key: "14746046-e5f0ddb31593262274d6028d3",
                per_page: 200,
                category: "nature",
                orientation: "horizontal",
                q: "landscape"
            }
            const url = mzGetQuery.getQuery();
            ins.open("GET", url);

            ins.onreadystatechange = (e) => {
                if (ins.readyState === 4 && ins.status === 200)
                    resolve(JSON.parse(ins.responseText));
            };

            ins.send();
        });

        // Save quote results
        dailyText.author = quote.contents.quotes[0].author;
        dailyText.quote = quote.contents.quotes[0].quote;

        // Save image results
        const back = Math.floor(Math.random() * image.hits.length);
        dailyText.background = image.hits[back].largeImageURL;
        dailyText.update = day;

        // Save all results to storage
        chrome.storage.sync.set({
            "dailyText": dailyText
        });
    }

    updateOutput();
}

getDailyText(null, false);

reloadButton.addEventListener('click', getDailyText);

////////////////////////////////////////////////////////////////////////////////
//  LINKS                                                                   ///
//////////////////////////////////////////////////////////////////////////////
class Links {
    constructor() {
        this.links = document.querySelector(".links");

        this.items = this.links.querySelectorAll(".link");

        this.shape = 5 * (60 * 2**(1/2));

        this.links.style.height = `${this.shape}px`
        this.links.style.width = `${this.shape}px`

        this.spaceoutItems();

        document.addEventListener("click", (event) => {
            this.flip(event);
        });
    }

    spaceoutItems() {
        const offset = this.shape / 2;
        let radius = (60 * 2**(1/2));
        let position = { x: 0, y: -radius };
        let angleInc = 2 * Math.PI / 8;
        let angle = 0;

        this.items.forEach((e, i) => {
            e.style.top = `${position.y + offset}px`;
            e.style.left = `${position.x + offset}px`;

            const _x = position.x * Math.cos(angleInc) - position.y * Math.sin(angleInc);
            const _y = position.x * Math.sin(angleInc) + position.y * Math.cos(angleInc);

            position.x = Math.round(_x);
            position.y = Math.round(_y);

            angle += angleInc;

            if (angle >= Math.PI * 2) {
                angle = 0;
                radius = (60 * 2**(1/2)) * 2;
                position = { x: 0, y: -radius };
                angleInc = 2 * Math.PI / 17;
            }
        });
    }

    flip(event) {

        if (document.activeElement === document.querySelector(".google-search-form input") ||
            document.activeElement === document.querySelector(".controll button")) {
            this.links.classList.remove("links-visible");
            return;
        }

        this.links.style.top = `${event.clientY}px`;
        this.links.style.left = `${event.clientX}px`;

        this.links.classList.toggle("links-visible");
    }
}

const links = new Links();
