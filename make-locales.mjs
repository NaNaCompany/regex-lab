import fs from 'node:fs';
import {languages,translate} from './dist/locales.js';
let source=fs.readFileSync('dist/index.html','utf8').replace(/<nav class="languages"[\s\S]*?<\/nav>/,'');
const labels={ko:'한국어',en:'English',es:'Español',zh:'简体中文',ja:'日本語',de:'Deutsch'};
for(const language of languages){const base=language==='ko'?'':'../';let html=translate(source,language).replace('lang="ko"',`lang="${language}"`);const nav=`<nav class="languages" aria-label="Language">${languages.map(l=>`<a href="${base}${l==='ko'?'':l+'/'}" lang="${l}"${l===language?' aria-current="page"':''}>${labels[l]}</a>`).join('')}</nav>`;html=html.replace('</header>',nav+'</header>');if(language!=='ko')html=html.replace('href="style.css"','href="../style.css"').replace('src="app.js"','src="../app.js"');fs.mkdirSync(language==='ko'?'dist':`dist/${language}`,{recursive:true});fs.writeFileSync(language==='ko'?'dist/index.html':`dist/${language}/index.html`,html);}
console.log('Generated 6 language routes.');
