'use strict'
var input=document.getElementById('input'), values=document.getElementById('values'), kbl=[0,8,13,40,39,38,37], options={
  values:'count', blacklist:[], live:'on', nback:5, show_zeros:'false', space_character:'\u2008', use_dict:'default',
  sim_cats:['article','prep','adverb','conj','auxverb','ipron','ppron'], sim_metric:'canberra',dict:{default:{colors:{
      article:'#82c473',prep:'#a378c0',adverb:'#616161',conj:'#9f5c61',auxverb:'#d3d280',ipron:'#6970b2',ppron:'#78c4c2'
    },composites:{femcomp:{show:true,formula:'ppron + auxverb + adverb + conj - article - prep'}}}}
}, output={}, colors={
    '#C95B76':['#C95B76','#C9AA73','#B988B5','#CA6535','#6875FF','#A97A75','#8964B5','#A56874','#BB6875','#C95837'],
    '#C837B4':['#C837B4','#E966A4','#C997C3','#9967D3','#C999E4','#D857B4','#9C67B4','#C93AB3','#9965B3','#8D6794'],
    '#BB66C0':['#BB66C0','#9765BF','#9E36BE','#9786F0','#BA6ABE','#9A6382','#AA76C2','#9E46BD','#9A36BF','#9B34C0'],
    '#B46FCC':['#B46FCC','#6470B8','#3340CC','#B370CF','#73409C','#446FCC','#8450CC','#6340CC','#7442FF','#9472C8'],
    '#47CBC2':['#47CBC2','#85E9C0','#87AAC0','#77E9C2','#77CBFF','#67A5B0','#97C8BD','#67A9F2','#9AC9D0','#59D9C0'],
    '#69D5A6':['#69D5A6','#AD67FF','#9D66FF','#40E866','#3AE566','#8DE966','#6FE466','#ADE36A','#6DB5A9','#3DE969'],
    '#DEE176':['#DEE176','#FECF65','#DECEAA','#DECE69','#CF64FF','#DECF3A','#BE9F69','#DED266','#DBEF68','#DED2A7']
  }

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
    if(e.firstElementChild && e.firstElementChild.tagName!=='SPAN') e.removeChild(e.firstElementChild)
    if(e.children.length!==0){
      c=new adicat(e.innerText).categorize(patterns.dict,options.blacklist).display()
      ae=e.previousElementSibling
      if(ae){
        i=c.length
        while(i--){ae.insertAdjacentElement('afterEnd',c[i]);if(i) insertSpace(ae)}
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
          if(pe && pe.innerText===options.space_character) pe.parentNode.removeChild(pe)
        }else if(!e.history || e.history!==e.innerText){
  				if(e.style) e.style=''
  				c=new adicat(e.innerText).categorize(patterns.dict,options.blacklist).display()
  				if(c.length!==1){
  					ae=e.nextElementSibling
  					e.parentNode.removeChild(e)
  					for(i=0, n=c.length;i<n;i++){
  						ae.insertAdjacentElement('beforeBegin',c[i])
  						if(i!==n-1) insertSpace(c[i])
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
	var s=window.getSelection(), r=s.getRangeAt(0), p=r.startContainer.parentNode, e, c, i, nr
	r.deleteContents()
	if(kbl.indexOf(k.which)!==-1 || (k.which===32 && input_history===32)){

	}else if((k.which===32 && r.startOffset!==0) || p.tagName!=='SPAN'){
		if(k.which===32){
      if(r.startOffset!==p.innerText.length){
        if(p.tagName==='SPAN'){
          e=new adicat(p.innerText.substring(0,r.startOffset)).categorize(patterns.dict,options.blacklist).display()
          nr=e[e.length-1]
          e=e.concat(new adicat(p.innerText.substring(r.startOffset)).categorize(patterns.dict,options.blacklist).display())
          i=e.length
          while(i--){p.insertAdjacentElement('afterEnd',e[i]);insertSpace(p)}
          r.setStart(nr.nextElementSibling,1)
          p.parentNode.removeChild(p)
          k.preventDefault()
        }
      }else{
        insertSpace(p)
        r.setStartAfter(p.nextSibling)
  			r.setEndAfter(p.nextSibling)
        r.collapse(false)
  			k.preventDefault()
      }
		}else{
      e=document.createElement('span')
  		e.appendChild(c=document.createTextNode(options.space_character))
			r.insertNode(e)
			r.setStartBefore(c)
			r.setEndAfter(c)
		}
		s.removeAllRanges()
		s.addRange(r)
	}
  backup(false,true)
	input_history=k.which
}}
function catch_paste(e){if(options.live==='on'){
	var txt=(e.clipboardData||window.clipboardData).getData('Text')
  if(/[\r\n]/.test(txt)){
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
    if(e.id==='input'){
      e=r.startContainer
    }else if(e===input.firstElementChild && !r.startOffset){
      insertSpace(e,'beforeBegin')
      e=input.firstElementChild
    }
    if((sp=e.className==='blankspace')){
      insertSpace(e)
    }
    t=e.nextElementSibling
    while(n--){
      e.insertAdjacentElement('afterEnd',c[n])
      if(n || !sp) insertSpace(e)
    }
    if(t) r.setStart(t,t.className==='blankspace')
    if(input.firstElementChild.className==='blankspace') input.removeChild(input.firstElementChild)
    update_table()
  }
  s.removeAllRanges()
  s.addRange(r)
  r.collapse(false)
}}
function input_clear(m){backup(true);input.innerHTML=values.innerHTML='';if(m){
  texts.current=texts.hasOwnProperty(texts.current) ? ++texts.last : texts.last
  fill_menu()
}}
function input_refresh(){
  var t=input.innerText, br=/\r*\n/, s=window.getSelection(), r=s.getRangeAt(0)
  input_clear()
  if(br.test(t)){
    t=t.split(br)
    for(var n=t.length,i=0;i<n;i++){
      if(t[i]!=='') display_text(t[i],true)
      if(i!==n-1) input.appendChild(document.createElement('br'))
    }
    update_table()
  }else{
    display_text(t)
  }
  r.setStart(input.lastElementChild,1)
  s.removeAllRanges()
  s.addRange(r)
  backup(true)
  input.focus()
}
function display_text(text,defer){
	text=text||input.innerText
	if('string'===typeof text){
		var c=new adicat(text).categorize(patterns.dict,options.blacklist).display(), n=c.length, i=0
		for(;i<n;i++){
			input.appendChild(c[i])
			append(input,'span',{innerHTML:options.space_character,className:'blankspace'})
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
	var o=values.children[0].children[0].children, ol=o.length, w=input.children, i=w.length, k, f, cl, c, s,
      w=input.getElementsByTagName('span'), i=w.length, cat={wc:0}, trim=/^ | $/g, comps=options.dict[options.use_dict].composites||{}
	for(k in patterns.dict){if(patterns.dict.hasOwnProperty(k) && options.blacklist.indexOf(k)===-1) cat[k]=0}
	while(i--){if(patterns.char.test(w[i].innerText)){
    cl=w[i].className.replace(trim,'').split(' ')
		k=cl.length
    cat.wc++
		while(k--){
			c=cl[k]
			if(cat.hasOwnProperty(c)) cat[c]++
		}
	}}
	for(k in cat){if(cat.hasOwnProperty(k) && k!=='wc'){
		if(options.values==='percent' && cat[k]!==0) cat[k]=Math.round(cat[k]/cat.wc*10000)/100
    output[k]=cat[k]
    if((f=document.getElementById(k+'_value'))){
			f.innerText=cat[k]
      c=cat[k] || options.show_zeros==='true' ? ' '+k+' ' : 'zero'
			document.getElementById(k+'_title').className=c
      f.className=c
		}else{
			if(!o[0].children.length){
				append(o[0],'th',{innerText:'WC',title:'word count'})
				append(o[1],'td',{innerText:0,id:'wc_value'})
			}
      if(o[0].children.length===1){
        if(texts.comp && texts.hasOwnProperty(texts.comp)){
          append(o[0],'th',{innerText:'sim to '+texts.comp,title:
            (/^co/i.test(options.sim_metric) ? 'Cosine similarity' : 'Inverse Canberra distance')+' to text '+texts.comp+'.'})
          texts.comp_values=new adicat(texts[texts.comp]).categorize().toPercent()
  				append(o[1],'td',{innerText:0,id:'similarity'})
        }
        for(f in comps){if(comps.hasOwnProperty(f) && comps[f].show){
          append(o[0],'th',{innerText:f,title:'composite category'})
  				append(o[1],'td',{innerText:0,id:'comp_'+f})
        }}
      }
			append(o[0],'th',{innerText:k,id:k+'_title',className:cat[k] || options.show_zeros==='true' ? ' '+k+' ' : 'zero'})
			append(o[1],'td',{innerText:cat[k],id:k+'_value',className:cat[k] || options.show_zeros==='true' ? '' : 'zero'})
		}
	}}
  if(texts.comp && texts.comp_values){
    s=$('similarity')
    if(s) s.innerText=new adicat(input.innerText).similarity(texts.comp_values,options.sim_metric,options.sim_cats)
  }
  for(f in comps) if(comps.hasOwnProperty(f) && comps[f].show){
    o=$('comp_'+f)
    if(o) o.innerText=solve(comps[f].formula)
  }
	$('wc_value').innerText=cat.wc
}
function select(e){
	var sel=/ select /g, ck=sel.test(e.className), c=ck ? sel : new RegExp('( '+e.innerText+' )','g'), r=ck ? '' : '$1 select ',
			oe=values.children[0].children[0].children[0].children, v=oe.length, d=input.children.length
	while(d--) if(input.children[d].innerText!=='') input.children[d].className=input.children[d].className.replace(sel,'').replace(c,r)
	while(v--) if(oe[v].className!=='zero') oe[v].className=oe[v].className.replace(sel,' ')
	if(!ck) e.className+='select '
}
function append(target,type,attributes){
	var e=document.createElement(type), k
	for(k in attributes) e[k]=attributes[k]
	target.appendChild(e)
}
function insertSpace(e,p){
  var s=document.createElement('span')
  s.className='blankspace'
  s.innerHTML=options.space_character
  e.insertAdjacentElement(p||'afterEnd',s)
}
