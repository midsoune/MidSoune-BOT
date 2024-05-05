// ميزة الرد على الرسائل برد معين
let handler = m => m;
handler.all = async function (m) {
console.log(m.chat)
      // مثال للرد بتعبير
      if (/^(cc|سس|ss)$/i.test(m.text)) { 
     conn.react(`🤖`); 
          } 
     //مثال للرد برسالة
      if (/^(سلام)$/i.test(m.text)) { 
     conn.reply(m.chat, 'وعليكم السلام ورحمة الله وبركاته', null); 
          } 

      return !0;
  };

export default handler
