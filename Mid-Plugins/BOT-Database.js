// ميزة للحصول على بيانات Database لمستخدمي البوت

import fs from 'fs';
let midsoune = async (m, {command}) => {
let usersData = JSON.stringify(global.db.data.users, null, 2);
let userData = JSON.stringify(global.db.data.users[m.sender], null, 2);

if (command === 'db' || command === 'user'){ // بيانات مستخدم واحد
    m.reply(userData); 
} else if (command === 'dbs' || command === 'users'){ // إرسال بيانات جميع المستخدمين
    m.reply(usersData);
}}
midsoune.command = /^(dbs|db|users|user)$/i
export default midsoune
