// ميزة الترجمة لأي لغة
import {translate} from '@vitalets/google-translate-api';
const midsoune = async (m, {args}) => {
  if (!args || !args[0]) return m.reply(`*دخل اللنص لي بغيتي تترجمو للعربية أو اللغة + النص لي بغيتي تترجمو للغة أخرى\n\nمثال:\n.${command} Hello\n.${command} fr Hello*`);
  let lang = args[0];
  let text = args.slice(1).join(' ');
  const defaultLang = 'ar';
  if ((args[0] || '').length !== 2) {
    lang = defaultLang; 
    text = args.join(' ');
  }
  if (!text && m.quoted && m.quoted.text) text = m.quoted.text;
  try {
    const result = await translate(`${text}`, {to: lang, autoCorrect: true});
    await conn.reply(m.chat, `*${result.text}*`, null);
  } catch {}
};
midsoune.command = /^(ترجم|translate|trans|trad|ترجمة)$/i
export default midsoune
