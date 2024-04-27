import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

process.env.MODE = 'public'
process.env.antidelete = 'true'
process.env.DATABASE_URL = 'mongodb+srv://midsoune10:midsoune7@cluster0.efae1fu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
process.env.PREFIX = '.' 
process.env.SESSION_ID = 'Midsoune@SeaboardLiquids'

global.owner = [['212621124079', '👑 𝙈𝙞𝙙𝙨𝙤𝙪𝙣𝙚 👑', true]] 
global.baileys = '@whiskeysockets/baileys'
 global.botNumber = '212621124079' 
  global.prems = ['212621124079', '']
  global.mods = ['212697118528','212697118528']
  global.lolkeysapi = 'gatadios'
  global.installationId = ['a1i0G--iafgpxFY-JF2V-SASY_-JcirG7j6TRI8UEQ0d-WNrTbNeNRYSg7-ZGF41']
  global.xyro = 'p3m8UTEawQ'
 global.herapi = 'fee7b0be8faf'


 global.APIs = { 
  nrtm: 'https://fg-nrtm.ddns.net',
  fgmods: 'https://api.fgmods.xyz',
  lol: 'https://api.lolhuman.xyz',
  neoxr: 'https://api.neoxr.my.id',
  akuari: 'https://api.akuari.my.id'
 }

global.APIKeys = { 
  'https://api.fgmods.xyz': 'dEBWvxCY',
  'https://api.lolhuman.xyz': 'gatadios',	
  'https://api-fgmods.ddns.net': 'fg-dylux'
}


global.packname = '𝙈𝙞𝙙𝙨𝙤𝙪𝙣𝙚'
  global.author = '♛ 𝙈𝙞𝙙𝙨𝙤𝙪𝙣𝙚 ♛'
 global.wm = 'MidSoune'
  global.igfg = '♛ 𝙈𝙞𝙙𝙨𝙤𝙪𝙣𝙚 ♛'
  global.wait = ''
  global.eror = '*خطأ في جلب البيانات*'
  global.site = '•'
global.vs = '2.0.24'
global.botName = '𝙈𝙞𝙙𝘽𝙤𝙩'
global.premium = 'true'  

global.rwait = '⏳'
global.dmoji = '🤭'
global.done = '✅'
global.error = '❌' 
global.xmoji = '🔥' 

global.multiplier = 69 
global.maxwarn = '3'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
