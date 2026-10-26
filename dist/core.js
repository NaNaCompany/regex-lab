export const LIMITS={text:100000,pattern:1000,replacement:2000,matches:500,output:500000,captures:50};
export function substitute(template,match,text){const captures=match.slice(1),named=match.groups;let expanded=template.length;const chunk=value=>{expanded+=value.length;if(expanded>LIMITS.output)throw new Error('outputLimit');return value;};return template.replace(/\$(\$|&|`|'|<[^>]*>|\d{1,2})/g,(token,key)=>{if(key==='$')return '$';if(key==='&')return chunk(match[0]);if(key==='`')return chunk(text.slice(0,match.index));if(key==="'")return chunk(text.slice(match.index+match[0].length));if(key[0]==='<')return named?chunk(named[key.slice(1,-1)]??''):token;const n=Number(key);if(n>0&&n<=captures.length)return chunk(captures[n-1]??'');if(key.length===2&&Number(key[0])>0&&Number(key[0])<=captures.length)return chunk((captures[Number(key[0])-1]??'')+key[1]);return token;});}
export function runRegex({pattern,text,flags='g',replacement=''}){
 if(typeof pattern!=='string'||typeof text!=='string'||typeof flags!=='string'||typeof replacement!=='string')throw new Error('inputType');
 if(!pattern.length)throw new Error('emptyPattern');
 if(pattern.length>LIMITS.pattern)throw new Error('patternLimit');if(text.length>LIMITS.text)throw new Error('textLimit');if(replacement.length>LIMITS.replacement)throw new Error('replacementLimit');
 if(!/^[gimsuy]*$/.test(flags)||new Set(flags).size!==flags.length)throw new Error('invalidFlags');
 let regex;try{regex=new RegExp(pattern,flags);}catch{throw new Error('invalidPattern');}
 const matches=[];let match,clipped=false,cursor=0,output='',outputLength=0,captureLength=0;
 while((match=regex.exec(text))!==null){if(matches.length>=LIMITS.matches){clipped=true;break;}if(match.length-1>LIMITS.captures)throw new Error('captureLimit');
 captureLength+=match.reduce((sum,value)=>sum+(value?.length??0),0);if(captureLength>LIMITS.output)throw new Error('captureSizeLimit');
 const replacementText=substitute(replacement,match,text),prefix=text.slice(cursor,match.index);outputLength+=prefix.length+replacementText.length;if(outputLength>LIMITS.output)throw new Error('outputLimit');output+=prefix+replacementText;cursor=match.index+match[0].length;
 const named=match.groups?Object.fromEntries(Object.entries(match.groups).map(([k,v])=>[k,v??null])):null;
 matches.push({index:match.index,end:match.index+match[0].length,text:match[0],groups:match.slice(1).map(x=>x??null),named});
 if(!regex.global)break;
 if(match[0]===''){const next=text.codePointAt(regex.lastIndex);regex.lastIndex+=regex.unicode&&next>65535?2:1;}
 }
 outputLength+=text.length-cursor;if(outputLength>LIMITS.output)throw new Error('outputLimit');output+=text.slice(cursor);
 return {matches,clipped,output,flags,textLength:text.length};
}
