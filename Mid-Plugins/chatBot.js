let handler = m => m;
handler.all = async function (m) {

      if (/^(cc|سس|ss)$/i.test(m.text)) { 
     m.react(`🤖`);
          } 
        
      return !0;
  };

export default handler
