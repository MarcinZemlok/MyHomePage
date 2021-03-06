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
//  BACKGROUND & CONTENT                                                    ///
//////////////////////////////////////////////////////////////////////////////

const reloadButton = document.querySelector(".controll button#reload-background-button");
const settingsButton = document.querySelector(".controll button#settings-button");

var userData = null;

class mzGetQuery {
    constructor(url, options) {
        this.url = url;
        this.options = options;
    }

    getQuery = () => {
        let ret = this.url + "?";

        Object.entries(this.options).forEach((e, i) => {
            if (i != 0) ret += "&"
            ret += (e[0] + "=" + e[1]);
        });

        return ret;
    }
}

async function fetchChromeStorage() {
    const ret = await new Promise((resolve) => {
        chrome.storage.sync.get(["myHomePageUserData"], (res) => {
            resolve(res);
        });
    });

    console.table(ret.myHomePageUserData);

    return ret.myHomePageUserData;
}

async function saveUserData() {
    chrome.storage.sync.set({
        myHomePageUserData: userData
    });
    console.log(`User data saved successfully.`)
}

async function getBackground() {
    const ret = await new Promise((resolve) => {
        const query = new mzGetQuery(
            "https://pixabay.com/api/",
            {
                key: "14746046-e5f0ddb31593262274d6028d3",
                per_page: 200,
                category: "nature",
                orientation: "horizontal",
                q: "landscape"
            }
        );
        const ins = new XMLHttpRequest();
        ins.open("GET", query.getQuery());

        ins.onreadystatechange = (e) => {
            if (ins.readyState === 4 && ins.status === 200)
                resolve(JSON.parse(ins.responseText));
        };

        ins.send();
    });

    console.log(ret);

    return ret;
}

async function getQuotation() {
    const ret = await new Promise((resolve) => {
        const query = new mzGetQuery(
            'https://quotes.rest/qod.json/',
            {
                category: 'inspire'
            }
        );
        const ins = new XMLHttpRequest();
        ins.open("GET", query.getQuery());

        ins.onreadystatechange = () => {
            if (ins.readyState === 4 && ins.status === 200)
                resolve(JSON.parse(ins.responseText));
        };

        ins.send();
    });

    console.log(ret);

    return ret;
}

function updateDataOnScreen() {
    const mainps = document.querySelectorAll(".main p");
    mainps[0].innerHTML = `<em>\"${userData.content.quote}\"</em>`;
    mainps[1].innerHTML = userData.content.author;
    document.querySelector("body").style.backgroundImage = `url(${userData.background.url})`;
}

async function fetchContent(force=true) {

    userData = await fetchChromeStorage();

    const day = Math.floor(Date.now() / 86400000);
    if (userData.lastUpdateDay === undefined || day != userData.lastUpdateDay || force) {

        // GET quote
        const quote = await getQuotation();
        userData.content = {
            quote: quote.contents.quotes[0].quote,
            author: quote.contents.quotes[0].author
        };

        // GET image
        const image = await getBackground();
        const back = Math.floor(Math.random() * image.hits.length);
        userData.background = {
            url: image.hits[back].largeImageURL
        }

        userData.lastUpdateDay = day;

        saveUserData();
    }

    updateDataOnScreen();
}

fetchContent(false);

reloadButton.addEventListener('click', () => fetchContent());

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
    links2.toggleLinks();
    // const hexes = document.querySelectorAll('.hexagon');

    // if (hexes.length > 0) {
    //     hexes.forEach(h => {
    //         body.removeChild(h);
    //     });
    // } else {
    //     const linksHTML = [
    //         `<a href="https://netflix.com">
    //         <img src="https://netflix.com/favicon.ico" alt="add link" height="32px">
    //         <p class="link-text">Netflix</p>
    //         </a>`,
    //         `<a href="https://mail.google.com/mail/?tab=mm&amp;authuser=0">
    //         <img src="https://mail.google.com/favicon.ico" alt="add link" width="32px">
    //         <p class="link-text">Gmail</p>
    //         </a>`,
    //         `<a href="https://maps.google.pl/maps?hl=pl&amp;tab=ml&amp;authuser=0">
    //         <img src="https://maps.google.pl/favicon.ico" alt="add link" width="32px">
    //         <p class="link-text">Mapy</p>
    //         </a>`,
    //         `<a href="https://www.youtube.com/?hl=pl&gl=PL">
    //         <img src="https://www.youtube.com/s/desktop/58aaddbe/img/favicon_32.png" alt="add link" width="32px">
    //         <p class="link-text">YouTube</p>
    //         </a>`,
    //         `<a href="https://www.facebook.com/?ref=logo">
    //         <img src="https://www.facebook.com/favicon.ico" alt="add link" width="32px">
    //         <p class="link-text">YouTube</p>
    //         </a>`,
    //         `<a href="#">
    //         <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fc%2Fce%2FPlus_font_awesome.svg%2F1024px-Plus_font_awesome.svg.png&f=1&nofb=1"
    //             alt="add link" width="32px">
    //         </a>`
    //     ];

    //     const links = new Links(
    //         e.clientX,
    //         e.clientY,
    //         100,
    //         linksHTML.length+1,
    //         3,
    //         Math.PI/3
    //     );

    //     links.childrenHTML.forEach((l, i) => {
    //         if (i > 0) {
    //             l.innerHTML = linksHTML[i-1];
    //         }
    //         body.appendChild(l);
    //     });
    // }
});

class Links2 {
    links = [
        {
            href: "https://netflix.com",
            img: "https://netflix.com/favicon.ico",
            text: "Netflix"
        },
        {
            href: "https://mail.google.com/mail/?tab=mm&amp;authuser=0",
            img: "https://mail.google.com/favicon.ico",
            text: "Gmail"
        },
        {
            href: "https://www.youtube.com/?hl=pl&gl=PL",
            img: "https://www.youtube.com/s/desktop/58aaddbe/img/favicon_32.png",
            text: "YouTube"
        },
        {
            href: "#",
            img: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2Fc%2Fce%2FPlus_font_awesome.svg%2F1024px-Plus_font_awesome.svg.png&f=1&nofb=1",
            text: ""
        }
    ];


    constructor() {
        this.links2 = document.querySelector(".links");
        this.linkElements = [];

        this.render();

        this.maxWidth = this.getMaxWidth();

        this.spaceFactor = 50;
        this.setAttributes();

        this.visible = false;
    }

    render() {
        this.links.forEach(l => {
            let div = document.createElement("div");
            div.classList.add("link", "link-hidden");
            div.innerHTML = `<a href="${l.href}">
                                <img src="${l.img}" alt=" ">
                                <p>${l.text}</p>
                                </a>`;
            this.links2.appendChild(div);
            this.linkElements.push(div);
        });
    }

    getMaxWidth() {
        let ret = 0;
        this.linkElements.forEach(l => {
            ret = (l.offsetWidth > ret) ? l.offsetWidth : ret;
        });
        return ret;
    }

    setAttributes(spaceFactor) {
        this.linkElements.forEach((l, i) => {
            l.style.top = (80 + this.spaceFactor * i) + "px";
            l.style.width = this.maxWidth + "px";
        });
    }

    toggleLinks() {
        this.visible = !this.visible;

        this.linkElements.forEach((l, i) => {
            l.classList.toggle("link-hidden");
        });
    }
}

const links2 = new Links2();
