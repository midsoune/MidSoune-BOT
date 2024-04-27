import cheerio from 'cheerio'
import fetch from 'node-fetch'

const APIs = {
    1: 'https://apkcombo.com',
    2: 'apk-dl.com',
    3: 'https://apk.support',
    4: 'https://apps.evozi.com/apk-downloader',
    5: 'http://ws75.aptoide.com/api/7',
    6: "https://cafebazaar.ir"
}
const Proxy = (url) => (url ? `https://translate.google.com/translate?sl=en&tl=fr&hl=en&u=${encodeURIComponent(url)}&client=webapp` : '')
const api = (ID, path = '/', query = {}) => (ID in APIs ? APIs[ID] : ID) + path + (query ? '?' + new URLSearchParams(Object.entries({
    ...query
})) : '')
const tools = {
    APIs,
    Proxy,
    api
}




const apk4all = {
    search: async function (query) {
        const url = tools.Proxy(tools.api(7, '/search/', { q: query }));
        try {
            const response = await fetch(url);
            const data = await response.text();
            const $ = cheerio.load(data);
            const articles = [];

            $('article').each((index, element) => {
                const $article = $(element);
                const title = $article.find('header .entry-title a').text().trim();
                const titleUrl = $article.find('header .entry-title a').attr('href');
                articles.push({ title, titleUrl });
            });

            return articles;
        } catch (error) {
            throw new Error('Error fetching data:', error);
        }
    },
    download: async function (url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const $ = cheerio.load(html);
            const info = {
                title: $('.dllinks .da').attr('title'),
                link: $('.dllinks .da').attr('href'),
                ogImageUrl: $('meta[property="og:image"]').attr('content'),
                developer: $('td:contains("Developer:")').next().text().trim(),
                currentVersion: $('td:contains("Current Version:")').next().text().trim(),
                latestUpdate: $('td:contains("Latest Update:")').next().find('time').text().trim(),
                contentRating: $('td:contains("Content Rating:")').next().text().trim(),
                getItOn: $('td:contains("Get it on:")').next().find('a').attr('href'),
                requirements: $('td:contains("Requirements:")').next().find('a').text().trim(),
                appID: $('td:contains("App ID:")').next().text().trim()
            };

            const response2 = await fetch(info.link);
            const html2 = await response2.text();
            const $two = cheerio.load(html2);

            const download = {
                title: $two('.box h1.title').text().trim(),
                linkFull: $two('.box p.field a.button.is-danger').attr('href'),
                linkMod: $two('.box div.buttons div.field p.control a.button.is-primary').attr('href'),
                size: $two('.box div.field.has-addons p.control.is-expanded a.button.is-primary').text().trim(),
                qr: $two('.box div.field.has-addons p.control a.zb.button.is-primary img.qr').attr('src'),
                guide: $two('.box div.block.content.notification.is-info.is-light.container').text().trim()
            };

            return { info, download };
        } catch (error) {
            throw new Error('Error fetching additional information:', error);
        }
    }
};
let apkcombo = {
    search: async function(args) {
        let res = (await fetch(tools.Proxy(tools.api(1, '/search/' + encodeURIComponent(args.replace(' ', '-'))))))
        let ress = []
        res = (await res.text())
        let $ = cheerio.load(res)
        let link = []
        let name = []
        $('div.content-apps > a').each(function(a, b) {
            let nem = $(b).attr('title')
            name.push(nem)
            link.push($(b).attr('href').replace('https://apkcombo-com.translate.goog/', 'https://apkcombo.com/').replace('/?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp', ''))
        })
        for (var i = 0; i < (name.length || link.length); i++) {
            ress.push({
                name: name[i],
                link: link[i]
            })
        }
        return ress
    },
    download: async function(url) {
        let res = (await fetch(url))
        res = (await res.text())
        let $ = cheerio.load(res)
        let img = $('div.app_header.mt-14 > div.avatar > img').attr('data-src')
        let developer = $('div.container > div > div.column.is-main > div.app_header.mt-14 > div.info > div.author > a').html()
        let appname = $('div.container > div > div.column.is-main > div.app_header.mt-14 > div.info > div.app_name > h1').text()
        let link1 = 'https://apkcombo.com' + $('div.container > div > div.column.is-main > div.button-group.mt-14.mb-14.is-mobile-only > a').attr('href')
        res = (await fetch(link1))
        res = (await res.text())
        $ = cheerio.load(res)
        let link = $('#best-variant-tab > div:nth-child(1) > ul > li > ul > li > a').attr('href') + '&fp=945d4e52764ab9b1ce7a8fba0bb8d68d&ip=160.177.72.111'
        return {
            img,
            developer,
            appname,
            link
        }
    }
}
let apkdl = {
    search: async function(args) {
        let res = (await fetch(tools.Proxy(tools.api(2, '/search', {
            q: args
        }))))
        res = (await res.text())

        let $ = cheerio.load(res)
      $('script').remove();
      $('style').remove();
        let link = []
        let name = []
        let ress = []
        $('a.title').each(function(a, b) {
            let nem = $(b).text()
            name.push(nem)
            link.push($(b).attr('href').replace('https://apk--dl-com.translate.goog/', 'https://apk-dl.com/').replace('?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp', ''))
        })
        for (var i = 0; i < (name.length || link.length); i++) {
            ress.push({
                name: name[i],
                link: link[i]
          
            })
        }
        return ress
    },
    download: async function(url) {
        let res = (await fetch(tools.Proxy(url)))
        res = (await res.text())
        let $ = cheerio.load(res)
      $('script').remove();
      $('style').remove();
        let img = $('div.logo > img').attr('src')
        let developer = $('div.developer > a').attr('title')
        let appname = $('div.heading > h1 > a').attr('title')
        let link2 = 'https://apk-dl.com' + $('div.download-btn > div > a.mdl-button.mdl-js-button.mdl-button--raised.mdl-js-ripple-effect.fixed-size.mdl-button--primary').attr('href')
      console.log(link2)
        res = (await fetch(link2))
    //   res = (await res.text())
        $ = cheerio.load(res)
      $('script').remove();
      $('style').remove();
        let link1 = $('a.mdl-button.mdl-js-button.mdl-button--raised mdl-button--colored.mdl-js-ripple-effect.fixed-size').attr('href')
        link3 = 'https:' + link1
      consol.log(link3)
        return {
            img,
            developer,
            appname,
            link,
          link3
        }
    }
}
let aptoide = {
    search: async function(args) {
        let res = (await fetch(tools.api(5, '/apps/search', {
            query: args,
            limit: 1000
        })))

        let ress = {}
        res = (await res.json())
        ress = res.datalist.list.map(v => {
            return {
                name: v.name,
                id: v.package
            }
        })
        return ress
    },
    download: async function(id) {
        let res = (await fetch(tools.api(5, '/apps/search', {
            query: id,
            limit: 1
        })))

        res = (await res.json())
        return {
            img: res.datalist.list[0].icon,
            developer: res.datalist.list[0].store.name,
            appname: res.datalist.list[0].name,
            link: res.datalist.list[0].file.path
        }
    }
}

export {
    apkdl,
    apk4all,
    apkcombo,
    aptoide
}