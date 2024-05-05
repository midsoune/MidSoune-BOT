// ميزة إرسال رسالة موحدة لجميع أعضاء المجموعة في الخاص
let handler = async (m, {conn, groupMetadata, text}) => {
if (!text && !m.quoted) return m.reply("أدخل نص الرسالة ?")
    let get = await groupMetadata.participants.filter(v => v.id.endsWith('.net')).map(v => v.id)
    let count = get.length;
    let sentCount = 0;

    for (let i = 0; i < get.length; i++) {
        setTimeout(function() {
            if (text) {
                conn.sendMessage(get[i], {text: text});
            } else if (m.quoted) {
         conn.copyNForward(get[i], m.getQuotedObj(), false);
            } else if (text && m.quoted) {
         conn.sendMessage(get[i], { text: text + "\n" + m.quoted.text });
            }
            count--;
            sentCount++;
            if (count === 0) {
           m.react(done)
            }
        }, i * 1000); // تأخير كل رسالة لمدة 1 ثانية
    }
}
handler.command = ["send", "sift"]
handler.group = true
export default handler
