import axios from 'axios';
let midsoune = async (m, {text}) => {
  if (!text) throw '*اكتب اسم المدينة او البلد الذي تريد ان تعرف مناخه*';
  try {
    let url = `http://api.weatherapi.com/v1/current.json?key=c08fe6375faf4467a7c71635241303&q=${text}&aqi=yes&lang=ar`;

const response = await axios.get(url);
const res = await response
const name = res.data.location.name;
const Weather = res.data.current.condition.text;
const Temperature = res.data.current.temp_c + " درجة"
const time = res.data.location.localtime
const Humidity = res.data.current.humidity + "%"
const Wind = res.data.current.wind_kph + " كيلومتر/الساعة"

    const Country = res.data.location.country;
    let country;
    const countryy = {
        "Morocco": "المغرب", "FR": "فرنسا",
        "ES": "اسبانيا",  "IT": "ايطاليا",
      "SY": "سوريا"
    };
    const countryName = countryy[Country] ? countryy[Country] : Country;

    const wea = `「 📍 」 *الموقع:* ${name}\n「 🗺️ 」 *الدولة:* ${countryName}\n「 🌤️ 」 *الرؤية:* ${Weather}\n「 🌡️ 」 *درجة الحرارة:* ${Temperature}\n「 💦 」 *نسبة الرطوبة:* ${Humidity}\n「 🌬️ 」 *سرعة الرياح:* ${Wind}\n「 📆 」 *التاريخ:* ${time}`;
      m.reply(wea);
      } catch (error) {
        console.error(error);
        m.reply("حدث خطأ أثناء جلب معلومات الطقس.");
      }
    };
midsoune.command = /^(taqs|ta9s|weather|طقس)$/i
export default midsoune

  سكريبت أخر
/*
import axios from 'axios';
let midsoune = async (m, {text}) => {
  if (!text) throw '*اكتب اسم المدينة او البلد الذي تريد ان تعرف مناخه*';
  try {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${text}&lang=ar&units=metric&appid=cb73766baef14a4d2bf9e254babe70c5`;

const response = await axios.get(url);
const res = await response
const name = res.data.name;
const Weather = res.data.weather[0].description;
const Temperature = res.data.main.temp + " درجة"
const Minimum_Temperature = res.data.main.temp_min + " درجة"
const Maximum_Temperature = res.data.main.temp_max + " درجة"
const Humidity = res.data.main.humidity + "%"
const windSpeedKmPerHour = (res.data.wind.speed * 3.6).toFixed(2) + " كيلومتر/الساعة";

    const Country = res.data.sys.country;
    let country;
    const countryy = {
        "MA": "المغرب", "FR": "فرنسا",
        "ES": "اسبانيا",  "IT": "ايطاليا",
      "SY": "سوريا"
    };
    const countryName = countryy[Country] ? countryy[Country] : Country;

    const wea = `「 📍 」 *الموقع:* ${name}\n「 🗺️ 」 *الدولة:* ${countryName}\n「 🌤️ 」 *الرؤية:* ${Weather}\n「 🌡️ 」 *درجة الحرارة:* ${Temperature}\n「 💦 」 *نسبة الرطوبة:* ${Humidity}\n「 🌬️ 」 *سرعة الرياح:* ${Wind}`;
      m.reply(wea);
      } catch (error) {
        console.error(error);
        m.reply("حدث خطأ أثناء جلب معلومات الطقس.");
      }
    };
midsoune.command = /^(taqs|ta9s|weather|طقس)$/i
export default midsoune
*/
