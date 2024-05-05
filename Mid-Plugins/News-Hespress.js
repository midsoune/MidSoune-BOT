// ميزة عرض أخر أخبار موقع هيسبريس
import cheerio from 'cheerio';
import fetch from 'node-fetch';

const midsoune = async (m, { conn }) => {
  conn.hespress = conn.hespress ? conn.hespress : {};
  const res = await allhespress();
  const instructions = "📢 *رد على الرسالة برقم الخبر لعرضه كاملا*";
  const smCaps = '¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ¹⁰ ¹¹ ¹² ¹³ ¹⁴ ¹⁵ ¹⁶ ¹⁷ ¹⁸ ¹⁹ ²⁰';
  const smCapsArray = smCaps.split(' ');
  let teks = res.slice(0, 50).map((item, index) => {
    return `${smCapsArray[index]} ${item.title}`;
  }).join("\n\n");
  const { key } = await m.reply(`${teks}\n\n${instructions}`);
  conn.hespress[m.chat] = { list: res, key, timeout: setTimeout(() => { conn.sendMessage(m.chat, { delete: key }); delete conn.hespress[m.chat]; }, 60 * 1000)};
}

midsoune.before = async (m, { conn }) => {
  conn.hespress = conn.hespress ? conn.hespress : {};

  if (m.isBaileys || !(m.chat in conn.hespress)) return;
  const input = m.text.trim();
  if (!/^\d+$/.test(input)) return; 

  const { list, key } = conn.hespress[m.chat];
  const index = parseInt(input);

  const selectedNewsIndex = index - 1;
  if (selectedNewsIndex >= 0 && selectedNewsIndex < list.length) {
    const url = list[selectedNewsIndex].link;
    console.log(url);
    let item = await readhespress(url);
    let cap = `${item.content}`;
    const image = item.image;
    await conn.sendFile(m.chat, image, '', cap, m);

    clearTimeout(conn.hespress[m.chat].timeout);
    conn.hespress[m.chat].timeout = setTimeout(() => {
      conn.sendMessage(m.chat, { delete: key });
      delete conn.hespress[m.chat];
    }, 3 * 60 * 1000);
  }
}
midsoune.command = /^(hespress|hes|هيسبريس)$/i
export default midsoune;

async function allhespress() {
    try {
        const response = await fetch('https://www.hespress.com/all');
        const html = await response.text();

        const $ = cheerio.load(html);
        const result = [];

        $('.col-12.col-sm-6.col-md-6.col-xl-3').each((index, element) => {
            const card = {
                title: $(element).find('.card-title').text().trim(),
                image: $(element).find('.card-img-top img').attr('src'),
                link: $(element).find('.stretched-link').attr('href')
            };

            result.push(card);
        });

        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
async function readhespress(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        const $ = cheerio.load(html);
        $('script').remove();
        $('style').remove();
        const header = $('.article-header');
        const title = header.find('.post-title').text().trim();
        const image = $('.figure-heading-post .post-thumbnail img').attr('src');
        const content = $('.article-content').text().trim().replace(/\./g, '.\n\n');
        const article = {
            title,
            image,
            content
        };

        return article;
    } catch (error) {
        console.error('Error:', error);
    }
}
