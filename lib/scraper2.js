import axios from 'axios';
import cheerio from 'cheerio';


async function ttsModel() {
  try {
    const response = await axios.get('https://tiktokvoicegenerator.com');
    const $ = cheerio.load(response.data);

    return $('select#voice option').map(function() {
        return {
            title: $(this).text().trim(),
            id: $(this).attr('value')
        };
    }).get();

  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    return [];
  }
}

async function tiktokTts(text, model) {
  try {
    const modelVoice = model ? model : "en_us_001";
    const {
      status,
      data
    } = await axios.post("https://tiktok-tts.weilnet.workers.dev/api/generation", {
      text: text,
      voice: modelVoice,
    }, {
      headers: {
        "content-type": "application/json",
      },
    });
    return data;
  } catch (err) {
    console.log(err.response.data);
    return err.response.data;
  }
}


export {
  tiktokTts,
  ttsModel,
};