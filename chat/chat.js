'use strict';
Adicat.chat = {
  indStat:false,
  log:{s:'',r:''},
  parts:{
    frame:document.createElement('div'),
    log:document.createElement('div'),
    indicator:document.createElement('p'),
    input:document.createElement('div')
  },
  replies:{},
  parse:function(t){
    Adicat.chat.log={s:'',r:''}
  	t=t.replace(/[\r\n]/g,'').split('')
  	var n=t.length, i=0, op={}, h='', b='', bracket=/^ *\[/, quote=[/\['/,/['"],['"]/g,/']/]
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
  },
  send:function(t){
    t = t || Adicat.chat.parts.input.value
  	var e=document.createElement('div'), ep=document.createElement('p')
  	e.className='outgoing'
  	e.appendChild(ep)
  	ep.innerText=t
  	Adicat.chat.append(e)
  	Adicat.chat.receive(t)
    Adicat.chat.parts.input.value=''
    Adicat.chat.parts.input.focus()
  },
  receive:function(t,r){
  	var e=document.createElement('div'), ep=document.createElement('p'), cc, re, c=new adicat(t).detect()
  	e.className='incoming'
  	e.appendChild(ep)
  	cc=Adicat.which(c.cues)
  	cc=c.string.clean===Adicat.chat.log.s ? 'repeat' : Adicat.chat.replies.hasOwnProperty(cc) ? cc : 'general'
    if(!Adicat.chat.replies[cc]) Adicat.chat.replies[cc]=['']
  	re=r||Adicat.chat.replies[cc].sample()
  	ep.innerText=re===Adicat.chat.log.s ? Adicat.chat.replies[cc].sample() : re
  	Adicat.chat.log={s:ep.innerText,r:c.string.clean}
  	if(ep.innerText!=='') setTimeout(function(){Adicat.chat.typing(e)}, Adicat.rand(20,1) * t.length)
  },
  typing:function(e){
  	if(!Adicat.chat.indStat){
  		Adicat.chat.indStat=true
  		Adicat.chat.parts.indicator.style.display=''
  		setTimeout(function(){
  			Adicat.chat.parts.indicator.style.display='none'
  			Adicat.chat.append(e)
  			Adicat.chat.indStat=false
  		},(Adicat.rand(20,10) * e.innerText.length) * 10)
  	}
  },
  append:function(e){
  	Adicat.chat.parts.log.appendChild(e)
  	if(Adicat.chat.parts.log.style.position==='' && Adicat.chat.parts.log.scrollHeight>Adicat.chat.parts.frame.scrollHeight)
      Adicat.chat.parts.log.style.position='relative'
  	Adicat.chat.parts.frame.scrollTop = Adicat.chat.parts.frame.scrollHeight
  }
}
