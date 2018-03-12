var input=document.getElementById('input'), values=document.getElementById('values'),
    options={values:'count', blacklist:[], live:'on', nback:5, space:'\u2008'}

function process_span(k){if(options.live==='on'){
	var s=window.getSelection(), r=s.getRangeAt(0), e=r.startContainer.parentNode, n=options.nback, c, ae, pe, i
  if(e.tagName==='BODY'){
    if(input.lastElementChild){
      r.setStartBefore(input.lastElementChild)
      r.setEndAfter(input.lastElementChild)
      r.collapse(false)
    }else input.focus()
    r=s.getRangeAt(0)
    e=r.startContainer.parentNode
  }
	if(e.tagName==='SPAN'){
    if(e.children.length!==0){
      c=new adicat(e.innerText).categorize(patterns.dict,options.blacklist).display()
      ae=e.previousElementSibling
      if(ae){
        if(ae.className!=='blankspace') insertSpace(ae)
        i=c.length
        while(i--){ae.insertAdjacentElement('afterEnd',c[i]);insertSpace(ae)}
        r.setStart(e,0)
        e.parentNode.removeChild(e)
      }
    }else if(!e.history || e.history!==e.innerText){
      c=new adicat(e.innerText).categorize(patterns.dict,options.blacklist)
    	if(c.captured){
    		c=c.display()[0]
    		e.className=c.className
    		e.title=c.title
    		e.history=c.innerText
    	}
		}
		while(n-- && e.previousElementSibling){
      e=e.previousElementSibling
      if(e.tagName==='SPAN'){
        if(e.className==='blankspace'){
          pe=e.previousElementSibling
          if(pe && pe.className==='blankspace') pe.parentNode.removeChild(pe)
        }else if(!e.history || e.history!==e.innerText || /\/\-\s/.test(e.innerText)){
          pe=e.previousElementSibling
          if(pe && pe.className!=='blankspace') insertSpace(e,'beforeBegin')
  				if(e.style) e.style=''
  				c=new adicat(e.innerText).categorize(patterns.dict,options.blacklist).display()
  				if(c.length!==1){
  					ae=e.nextElementSibling
  					e.parentNode.removeChild(e)
  					for(var i=0, n=c.length;i<n;i++){
  						ae.insertAdjacentElement('beforeBegin',c[i])
  						if(i!==n-1) insertSpace(ae)
  					}
  				}else{
  					e.className=c[0].className
  					e.title=c[0].title
  					e.history=c[0].innerText
  				}
  			}
        update_table()
      }
  	}
  }
  s.removeAllRanges()
  s.addRange(r)
}}
function spanner(k){if(options.live==='on'){
	var s=window.getSelection(), r=s.getRangeAt(0), p=r.startContainer.parentNode, e, s
	r.deleteContents()
	if(k.which===13 || k.which===8 || (k.which===32 && input_history===32)){

	}else if((k.which===32 && r.startOffset!==1) || p.tagName!=='SPAN'){
		if(k.which===32){
      insertSpace(p)
      r.setStartAfter(p.nextSibling)
			r.setEndAfter(p.nextSibling)
      r.collapse(false)
			k.preventDefault()
		}else{
      e=document.createElement('span')
  		e.appendChild((c=document.createTextNode('-')))
			r.insertNode(e)
			r.setStartBefore(c)
			r.setEndAfter(c)
		}
		s.removeAllRanges()
		s.addRange(r)
	}
	input_history=k.which
}}
function catch_paste(e){if(options.live==='on'){
	var txt=(e.clipboardData||window.clipboardData).getData('Text')
  if(/\r*\n/.test(txt)){
    setTimeout(input_refresh,0)
    return null
  }
  e.stopPropagation()
	e.preventDefault()
  var s=window.getSelection(), r=s.getRangeAt(0)
	if(input.innerText===''){
    display_text(txt)
    r.setStart(input.lastElementChild,1)
  }else{
    var c=new adicat(txt).categorize(patterns.dict,options.blacklist).display(), n=c.length, t, sp
    r.deleteContents()
    e=r.startContainer.parentNode
    t=e.nextElementSibling
    if((sp=e.className==='blankspace')){
      insertSpace(e)
    }
    if(e.id!=='input'){
      e=input.children[0]
      t=e.nextSibling||e
    }
    while(n--){
      e.insertAdjacentElement('afterEnd',c[n])
      if(n || !sp) insertSpace(e)
    }
    r.setStart(t,0)
    update_table()
  }
  s.removeAllRanges()
  s.addRange(r)
}}
function input_clear(){
  input.innerHTML=''
  values.innerHTML=''
}
function input_refresh(){
  var t=input.innerText, br=/\r*\n/
  input_clear()
  if(br.test(t)){
    var s=window.getSelection(), r=s.getRangeAt(0)
    t=t.split(br)
    for(var n=t.length,i=0;i<n;i++){
      if(t[i]!=='') display_text(t[i],true)
      if(i!==n-1) input.appendChild(document.createElement('br'))
    }
    r.setStartAfter(input.lastElementChild)
    r.setEndAfter(input.lastElementChild)
    s.removeAllRanges()
    s.addRange(r)
    update_table()
    input.focus()
  }else{
    display_text(t)
  }
}
function display_text(text,defer){
	text=text||input.innerText
	if('string'===typeof text){
		var c=new adicat(text).categorize(patterns.dict,options.blacklist).display(), n=c.length, i=0
		for(;i<n;i++){
			input.appendChild(c[i])
			append(input,'span',{innerHTML:options.space,className:'blankspace'})
		}
    if(!defer) update_table()
	}
}
function update_table(){
	if(values.innerHTML===''){
		values.innerHTML="<table><tr class='highlight'></tr><tr></tr></table>"
		var o=values.children[0].children[0].children
		append(o[0],'th',{innerText:'WC',title:'word count'})
		append(o[1],'td',{innerText:0,id:'wc_value'})
	}
	var o=values.children[0].children[0].children, ol=o.length, w=input.children, i=w.length, cat={wc:0}, k, f, cl, c,
      w=input.getElementsByTagName('span'), i=w.length, cat={wc:0}, trim=/^ | $/g
	for(k in patterns.dict){if(patterns.dict.hasOwnProperty(k) && options.blacklist.indexOf(k)===-1) cat[k]=0}
	while(i--){if(w[i].className!=='blankspace'){
    cl=w[i].className.replace(trim,'').split(' ')
		k=cl.length
    cat.wc+=1
		while(k--){
			c=cl[k]
			if(cat.hasOwnProperty(c)) cat[c]+=1
		}
	}}
	for(k in cat){if(cat.hasOwnProperty(k) && k!=='wc'){
		if(options.values==='percent' && cat[k]!==0) cat[k]=Math.round(cat[k]/cat.wc*10000)/100
    if((f=document.getElementById(k+'_value'))){
			f.innerText=cat[k]
      c=cat[k] ? ' '+k+' ' : 'zero'
			document.getElementById(k+'_title').className=c
      f.className=c
		}else{
			if(!o[0].children.length){
				append(o[0],'th',{innerText:'WC',title:'word count'})
				append(o[1],'td',{innerText:0,id:'wc_value'})
			}
			append(o[0],'th',{innerText:k,id:k+'_title',className:cat[k] ? ' '+k+' ' : 'zero'})
			append(o[1],'td',{innerText:cat[k],id:k+'_value',className:cat[k] ? '' : 'zero'})
		}
	}}
	$('wc_value').innerText=cat.wc
}
function select(e){
	var sel=/ select /g, ck=sel.test(e.className)
	var c=ck ? sel : new RegExp('( '+e.innerText+' )','g'), r=ck ? '' : '$1 select ',
			oe=values.children[0].children[0].children[0].children, v=oe.length, d=input.children.length
	while(d--){if(input.children[d].innerText!=='') input.children[d].className=input.children[d].className.replace(sel,'').replace(c,r)}
	while(v--){if(oe[v].className!=='zero') oe[v].className=oe[v].className.replace(sel,' ')}
	if(!ck) e.className+='select '
}
function append(target,type,attributes){
	var e=document.createElement(type), k
	for(k in attributes){if(e[k]==='') e[k]=attributes[k]}
	target.appendChild(e)
}
function insertSpace(e,p){
  var s=document.createElement('span')
  s.className='blankspace'
  s.innerHTML=options.space
  e.insertAdjacentElement(p||'afterEnd',s)
}
