// ميزة عرض أخر أخبار موقع البطولة
import cheerio from 'cheerio';
import fetch from 'node-fetch';
import moment from 'moment';

const midsoune = async (m, { conn }) => {
  conn.botolad = conn.botolad ? conn.botolad : {};

  const res = await allelbotola();
  const instructions = "📢 *رد على الرسالة برقم الخبر لعرضه كاملا*";

  const smCaps = '¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ¹⁰ ¹¹ ¹² ¹³ ¹⁴ ¹⁵ ¹⁶ ¹⁷ ¹⁸ ¹⁹ ²⁰ ²¹ ²² ²³ ²⁴ ²⁵ ²⁶ ²⁷ ²⁸ ²⁹ ³⁰ ³¹ ³² ³³ ³⁴ ³⁵ ³⁶ ³⁷ ³⁸ ³⁹ ⁴⁰ ⁴¹ ⁴² ⁴³ ⁴⁴ ⁴⁵ ⁴⁶ ⁴⁷ ⁴⁸ ⁴⁹ ⁵⁰ ⁵¹ ⁵² ⁵³ ⁵⁴ ⁵٥ ⁵٦ ⁵٧ ⁵٨ ⁵٩ ⁶٠';
  const smCapsArray = smCaps.split(' ');

  let teks = res.slice(0, 50).map((item, index) => {
    const date = item.date;
    const originalMoment = moment(date, "YYYY-MM-DD HH:mm Z");
    const datenew = originalMoment.clone().add(1, 'hour').format("HH:mm");
    return `${smCapsArray[index]} *[${datenew}]* ${item.title}`;
  }).join("\n\n");

  const { key } = await m.reply(`${teks}\n\n${instructions}`);
  conn.botolad[m.chat] = { list: res, key, timeout: setTimeout(() => { conn.sendMessage(m.chat, { delete: key }); delete conn.botolad[m.chat]; }, 60 * 1000)};
}

midsoune.before = async (m, { conn }) => {
  conn.botolad = conn.botolad ? conn.botolad : {};

  if (m.isBaileys || !(m.chat in conn.botolad)) return;
  const input = m.text.trim();
  if (!/^\d+$/.test(input)) return; 

  const { list, key } = conn.botolad[m.chat];
  const index = parseInt(input);

  const selectedNewsIndex = index - 1;
  if (selectedNewsIndex >= 0 && selectedNewsIndex < list.length) {
    const url = list[selectedNewsIndex].link;
    console.log(url);
    let item = await readelbotola(url);
    let cap = `${item.content}`;
    const image = item.image;
    const imageRelativeSrc = image;
    const baseUrl = 'https:';
    const fullImageUrl = baseUrl + imageRelativeSrc;

    await conn.sendFile(m.chat, fullImageUrl, '', cap, m);
   await conn.sendMessage(m.chat, { delete: key });

    clearTimeout(conn.botolad[m.chat].timeout);
    conn.botolad[m.chat].timeout = setTimeout(() => {
      delete conn.botolad[m.chat];
    }, 2 * 60 * 1000);
  }
}

async function allelbotola() {
  try {
    const response = await fetch('https://www.elbotola.com/');
    const html = await response.text();
    const $ = cheerio.load(html);
    const result = [];

    $('.latest-chrono-content ul li').each((index, element) => {
      const card = {
title: $(element).find('h3').text(),
date: $(element).find('time.timezone').attr('data-value'),
link: $(element).find('a').attr('href')
      };
      result.push(card);
    });

    return result;
  } catch (error) {
    console.error('Error in allelbotola:', error);
    throw error;
  }
}

async function readelbotola(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    $('script').remove();
    $('style').remove();
    const header = $('.article-header');
    const title = header.find('.article-heading h2').text().trim();
    const image = header.find('.article-figure img').attr('src');
    const content = $('.article-content p').text().trim().replace(/\./g, '.\n\n');

    const article = {
      title,
      image,
      content
    };

    return article;
  } catch (error) {
    console.error('Error in readelbotola:', error);
    throw error;
  }
}
midsoune.command = /^(elbotola|elbt)$/i
export default midsoune;
