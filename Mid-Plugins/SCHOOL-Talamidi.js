// ميزة تحميل الروس والإمتحانات من موقع تلاميذي
import cheerio from "cheerio";
import fetch from "node-fetch";
let midsoune = async (m, { conn, text, command }) => {
  if (!text) throw "أدخل إسم الدرس التي تريد البحث عنه، أو رابط الدرس لتحميله";
  if (text.startsWith("https://talamidi.com")) {
    try {
      let url = text;
      let res = await downloadBook(url);

      for (const file of res) {
        await conn.sendFile(m.chat, file.fileContent, `${file.title}.pdf`, "", null);
      }
    } catch (e) {
      console.error(e);
      await m.reply("حدث خطأ أثناء تحميل الملفات.");
    }
  }
  else {
    try {
      const res = await searchBook(text);
      const teks = res
        .map((item, index) => {
          return `*العنون:* ${item.title}
*الرابط:* ${decodeURI(item.link)}`;
        })
        .filter((v) => v)
        .join("\n________________________\n");
      await m.reply(teks);
    } catch (e) {
      console.error(e);
      await m.reply("حدث خطأ أثناء البحث.");
    }
  }
};
midsoune.command = /^(talamid|doros|talamidi)$/i;
export default midsoune;

async function searchBook(text, maxResults = 20) {
  try {
    const response = await fetch(
      `https://talamidi.com/?s=${encodeURIComponent(text)}`,
    );
    const html = await response.text();
    const $ = cheerio.load(html);
    const result = [];

    $("article.post").each((index, element) => {
      if (index < maxResults) {
        const title = $(element).find(".entry-header h2 a").text().trim();
        const link = $(element).find(".entry-header h2 a").attr("href");
        result.push({
          title,
          link,
        });
      }
    });

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function downloadBook(url) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const downloadLinks = $("table#t01 tr td:nth-child(2) a")
      .map((i, el) => $(el).attr("href"))
      .get();
    const titles = $("table#t01 tr td:nth-child(1)")
      .map((i, el) => $(el).text().trim())
      .get();
    const downloads = [];
    for (let i = 0; i < downloadLinks.length; i++) {
      const fullDownloadLink = "https://talamidi.com" + downloadLinks[i];
      const downloadResponse = await fetch(fullDownloadLink);

      if (downloadResponse.ok) {
        const fileContent = await downloadResponse.buffer();
        downloads.push({ fileContent, title: titles[i] });
      } else {
        console.error(`فشل تحميل الملف: ${fullDownloadLink}`);
      }
    }
    return downloads;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
