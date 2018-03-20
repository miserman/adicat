var indStat=false, log={s:'',r:''}

function adicat_parse(t){
  log={s:'',r:''}
	t=t.replace(/[\r\n]/g,'').split('')
	var n=t.length, i=0, op={}, h=b='', bracket=/^ *\[/, quote=[/\['/,/['"],['"]/g,/']/]
	while(i<n){
		if(t[i]==='('){
      h=''
      i++
      while(t[i]!==')'){
        h+=t[i]
        i++
      }
      while(t[i]!=='{') i++
      b=''
      i++
      while(t[i]!=='}'){
        b+=t[i]
        i++
      }
      op[h]=bracket.test(b) ? JSON.parse(b.replace(quote[0],'["').replace(quote[1],'","').replace(quote[2],'"]')) : [b]
    }
    i++
	}
	return op
}
function send(t){
	var e=document.createElement('div'), ep=document.createElement('p')
	e.className='outgoing'
	e.appendChild(ep)
	ep.innerText=t
	append(e)
	receive(t)
}
function receive(t,r){
	var e=document.createElement('div'), ep=document.createElement('p'), cc, re
	e.className='incoming'
	e.appendChild(ep)
	c=new adicat(t).detect()
	cc=which(c.cues)
	cc=c.string.clean===log.s ? 'repeat' : replies.hasOwnProperty(cc) ? cc : 'general'
  if(!replies[cc]) replies[cc]=['']
	re=r||replies[cc].sample()
	ep.innerText=re===log.s ? replies[cc].sample() : re
	log={s:ep.innerText,r:c.string.clean}
	if(ep.innerText!=='') setTimeout(function(){typing(e)},rand(.5,.1)*t.length*100)
}
function typing(e){
	if(!indStat){
		indStat=true
		indicator.style.display=''
		setTimeout(function(){
			indicator.style.display='none'
			append(e)
			indStat=false
		},(rand(2,.2))*e.innerText.length*100)
	}
}
function append(e){
	chat.appendChild(e)
	if(chat.style.position==='' && chat.scrollHeight>chat_body.scrollHeight) chat.style.position='relative'
	chat.lastElementChild.scrollIntoView()
}
