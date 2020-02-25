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

async function getDailyText() {
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

    if (res.dailyText != undefined) {
        dailyText.author = res.dailyText.author;
        dailyText.quote = res.dailyText.quote;
        dailyText.background = res.dailyText.background;
    }

    const day = Math.floor(Date.now() / 86400000);
    if (res.dailyText == undefined || day != res.dailyText.update) {

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

getDailyText();

////////////////////////////////////////////////////////////////////////////////
//  LINKS                                                                   ///
//////////////////////////////////////////////////////////////////////////////

document.addEventListener("click", flipLinks);

function flipLinks() {
    const links = document.querySelector(".links");
    if (document.activeElement === document.querySelector(".google-search-form input")) {
        return;
    }
    links.classList.toggle("links-visible");
}
