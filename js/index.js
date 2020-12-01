////////////////////////////////////////////////////////////////////////////////
//  DATE & CLOCK FUNCTIONALITY                                              ///
//////////////////////////////////////////////////////////////////////////////
{
    let d = new Date(Date.now());
    let weekday = d.toLocaleString("en-US", { weekday: "long" });
    let day = ('0'+d.getDate()).substr(-2, 2);
    let month = ('0'+(d.getMonth()+1)).substr(-2, 2);
    let year = d.getFullYear();
    document.querySelector(".day").innerHTML = `${weekday}`;
    document.querySelector(".date").innerHTML = `${day}/${month}/${year}`;
}

const ham = document.querySelector(".clock");
const sec = document.querySelector(".seconds");
const clock = function () {
    const time = new Date();
    let s = ('0'+time.getSeconds()).substr(-2, 2);
    let h = ('0'+time.getHours()).substr(-2, 2);
    let m = ('0'+time.getMinutes()).substr(-2, 2);
    sec.innerHTML = s;
    if (s == 0 || ham.innerHTML == "--:--") {
        ham.innerHTML = h + ":" + m;
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

async function getdailyContent(event=null, force=true) {
    updateOutput = () => {
        const mainps = document.querySelectorAll(".main p");
        mainps[0].innerHTML = `<em>\"${dailyContent.quote}\"</em>`;
        mainps[1].innerHTML = dailyContent.author;
        document.querySelector("body").style.backgroundImage = `url(${dailyContent.background})`;
    };

    let dailyContent = {
        author: "",
        quote: "",
        background: "",
        update: 0
    };

    const storage = await new Promise((resolve) => {
        chrome.storage.sync.get(["dailyContent"], (res) => {
            resolve(res);
        });
    });

    if (storage.dailyContent != undefined || force) {
        dailyContent.author = storage.dailyContent.author;
        dailyContent.quote = storage.dailyContent.quote;
        dailyContent.background = storage.dailyContent.background;
    }

    const day = Math.floor(Date.now() / 86400000);
    if (storage.dailyContent == undefined || day != storage.dailyContent.update || force) {

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
        dailyContent.author = quote.contents.quotes[0].author;
        dailyContent.quote = quote.contents.quotes[0].quote;

        // Save image results
        const back = Math.floor(Math.random() * image.hits.length);
        dailyContent.background = image.hits[back].largeImageURL;
        dailyContent.update = day;

        // console.log("============================================================")
        // console.log(image)
        // console.log(back)
        // console.log("============================================================")

        // Save all results to storage
        chrome.storage.sync.set({
            "dailyContent": dailyContent
        });
    }

    updateOutput();
}

getdailyContent(null, false);

reloadButton.addEventListener('click', getdailyContent);

////////////////////////////////////////////////////////////////////////////////
//  LINKS                                                                   ///
//////////////////////////////////////////////////////////////////////////////
class Links {
    constructor(x, y, w, count, offset = 0, angle = 0) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.r = this.w + offset;
        this.children = [];
        this.childrenHTML = [];

        var PI2 = Math.PI * 2;
        for (var i = 1; this.children.length < count-1; i++) {
            for (var j = 0; this.children.length < count-1 && j<6; j++) {
                var currentX = this.x+Math.cos(j*PI2/6-angle)*this.r*i;
                var currentY = this.y+Math.sin(j*PI2/6-angle)*this.r*i;
                this.children.push({x: currentX, y: currentY});
                for (var k = 1; this.children.length < count-1 && k<i; k++) {
                    var newX = currentX + Math.cos(j*PI2/6+PI2/3-angle)*this.r*k;
                    var newY = currentY +  Math.sin(j*PI2/6+PI2/3-angle)*this.r*k;
                    this.children.push({x: newX, y: newY});
                }
            }
        }

        let he0 = document.createElement("div");
        he0.classList.add("hexagon");
        he0.style.top = this.y + "px";
        he0.style.left = this.x + "px";

        this.childrenHTML.push(he0);

        this.children.forEach(c => {
            let he = document.createElement("div");
            he.classList.add("hexagon");
            he.style.top = c.y + "px";
            he.style.left = c.x + "px";

            this.childrenHTML.push(he);
        });
    }
}

const body = document.querySelector('body');
const links = document.querySelector('.links');
links.addEventListener('click', e => {
    const hexes = document.querySelectorAll('.hexagon');

    if (hexes.length > 0) {
        hexes.forEach(h => {
            body.removeChild(h);
        });
    } else {
        const linksHTML = [
            `<a href="https://netflix.com">
            <img src="https://netflix.com/favicon.ico" alt="add link" height="32px">
            <p class="link-text">Netflix</p>
            </a>`,
            `<a href="https://mail.google.com/mail/?tab=mm&amp;authuser=0">
            <img src="https://mail.google.com/favicon.ico" alt="add link" width="32px">
            <p class="link-text">Gmail</p>
            </a>`,
            `<a href="https://maps.google.pl/maps?hl=pl&amp;tab=ml&amp;authuser=0">
            <img src="https://maps.google.pl/favicon.ico" alt="add link" width="32px">
            <p class="link-text">Mapy</p>
            </a>`,
            `<a href="https://www.youtube.com/?hl=pl&gl=PL">
            <img src="https://www.youtube.com/s/desktop/58aaddbe/img/favicon_32.png" alt="add link" width="32px">
            <p class="link-text">YouTube</p>
            </a>`,
            `<a href="https://www.facebook.com/?ref=logo">
            <img src="https://www.facebook.com/favicon.ico" alt="add link" width="32px">
            <p class="link-text">YouTube</p>
            </a>`,
            `<a href="#">
            <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fc%2Fce%2FPlus_font_awesome.svg%2F1024px-Plus_font_awesome.svg.png&f=1&nofb=1"
                alt="add link" width="32px">
            </a>`
        ];

        const links = new Links(
            e.clientX,
            e.clientY,
            100,
            linksHTML.length+1,
            3,
            Math.PI/3
        );

        links.childrenHTML.forEach((l, i) => {
            if (i > 0) {
                l.innerHTML = linksHTML[i-1];
            }
            body.appendChild(l);
        });
    }
});
