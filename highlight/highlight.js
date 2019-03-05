'use strict';
Adicat.hl = {
  input:document.createElement('div'),
  values:document.createElement('div'),
  kbl:[0,8,13,40,39,38,37],
  input_history:0,
  texts:{current:0, comp:null, last:0},
  options:{
    values:'count', blacklist:[], live:'on', tabulate:false, nback:5, show_zeros:'false', space_character:'\u2008',
    use_dict:'default', sim_cats:['article','prep','adverb','conj','auxverb','ipron','ppron'], sim_metric:'canberra',
    sim_filter:'false', split:'\\n+', sep:',', meta:true, input_encoding:'ascii',
    dict:{
      default:{
        colors:{
          article:'#82c473',prep:'#a378c0',adverb:'#616161',conj:'#9f5c61',auxverb:'#d3d280',ipron:'#6970b2',ppron:'#78c4c2'
      },
      composites:{femcomp:{show:true,formula:'ppron + auxverb + adverb + conj - article - prep'}}}
    }
  },
  output:{},
  colors:{
    '#C95B76':['#C95B76','#C9AA73','#B988B5','#CA6535','#6875FF','#A97A75','#8964B5','#A56874','#BB6875','#C95837'],
    '#C837B4':['#C837B4','#E966A4','#C997C3','#9967D3','#C999E4','#D857B4','#9C67B4','#C93AB3','#9965B3','#8D6794'],
    '#BB66C0':['#BB66C0','#9765BF','#9E36BE','#9786F0','#BA6ABE','#9A6382','#AA76C2','#9E46BD','#9A36BF','#9B34C0'],
    '#B46FCC':['#B46FCC','#6470B8','#3340CC','#B370CF','#73409C','#446FCC','#8450CC','#6340CC','#7442FF','#9472C8'],
    '#47CBC2':['#47CBC2','#85E9C0','#87AAC0','#77E9C2','#77CBFF','#67A5B0','#97C8BD','#67A9F2','#9AC9D0','#59D9C0'],
    '#69D5A6':['#69D5A6','#AD67FF','#9D66FF','#40E866','#3AE566','#8DE966','#6FE466','#ADE36A','#6DB5A9','#3DE969'],
    '#DEE176':['#DEE176','#FECF65','#DECEAA','#DECE69','#CF64FF','#DECF3A','#BE9F69','#DED266','#DBEF68','#DED2A7']
  },
  process_span:function(){if(Adicat.hl.options.live==='on'){
  	var s=window.getSelection(), r=s.getRangeAt(0), e=r.startContainer.parentNode, n=Adicat.hl.options.nback, c, ae, pe, i
    if(e.tagName==='BODY'){
      if(Adicat.hl.input.lastElementChild){
        r.setStartBefore(Adicat.hl.input.lastElementChild)
        r.setEndAfter(Adicat.hl.input.lastElementChild)
        r.collapse(false)
      }else Adicat.hl.input.focus()
      r=s.getRangeAt(0)
      e=r.startContainer.parentNode
    }
  	if(e.tagName==='SPAN'){
      if(e.children.length!==0){
        c=new adicat(e.innerText).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist).display()
        ae=e.previousElementSibling
        if(ae && e.className!=='blankspace'){
          i=c.length
          while(i--){
            Adicat.hl.insertSpace(ae)
            ae.insertAdjacentElement('afterEnd',c[i])
          }
          r.setStart(e,0)
          e.parentNode.removeChild(e)
        }
      }else if(!e.history || e.history!==e.innerText){
        c=new adicat(e.innerText).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist)
      	if(c.captured){
      		c=c.display()[0]
      		e.className=c.className
      		e.title=c.title
      		e.history=c.innerText
      	}else{
          e.className=' none '
      		e.title='none'
      		e.history=e.innerText
        }
  		}
  		while(n-- && e.previousElementSibling){
        e=e.previousElementSibling
        if(e.tagName==='SPAN'){
          if(e.className==='blankspace'){
            pe=e.previousElementSibling
            if(pe && pe.innerText===Adicat.hl.options.space_character){
              pe.parentNode.removeChild(pe)
            }
          }else if(!e.history || e.history!==e.innerText){
    				if(e.style){
              e.className=e.title=''
            }
    				c=new adicat(e.innerText).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist).display()
    				if(c.length!==1){
    					for(i=c.length;i--;){
    						e.insertAdjacentElement('afterEnd',c[i])
                if(i) Adicat.hl.insertSpace(e)
    					}
              e.parentNode.removeChild(e)
    				}else{
    					e.className=c[0].className
    					e.title=c[0].title
    					e.history=c[0].innerText
    				}
    			}
          if(Adicat.hl.options.tabulate) Adicat.hl.update_table()
        }
    	}
    }
    s.removeAllRanges()
    s.addRange(r)
  }},
  spanner:function(k){if(Adicat.hl.options.live==='on'){
  	var s=window.getSelection(), r=s.getRangeAt(0), p=r.startContainer.parentNode, e, c, i, nr
  	r.deleteContents()
  	if(Adicat.hl.kbl.indexOf(k.which)!==-1 || (k.which===32 && Adicat.hl.input_history===32)) return null
    if((k.which===32 && r.startOffset!==0) || p.tagName!=='SPAN'){
  		if(k.which===32){
        if(r.startOffset!==p.innerText.length){
          if(p.tagName==='SPAN'){
            e=new adicat(p.innerText.substring(0,r.startOffset)).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist).display()
            nr=e[e.length-1]
            e=e.concat(new adicat(p.innerText.substring(r.startOffset)).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist).display())
            i=e.length
            if(p.className!=='blankspace') Adicat.hl.insertSpace(p)
            while(i--){
              p.insertAdjacentElement('afterEnd',e[i])
              if(i) Adicat.hl.insertSpace(p)
            }
            r.setStart(nr.nextElementSibling,1)
            if(p.className!=='blankspace') p.parentNode.removeChild(p)
            k.preventDefault()
          }
        }else{
          Adicat.hl.insertSpace(p)
          r.setStartAfter(p.nextSibling)
    			r.setEndAfter(p.nextSibling)
          r.collapse(false)
    			k.preventDefault()
          if(!p.history || p.history!==p.innerText){
            c=new adicat(p.innerText).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist)
            if(c.captured){
              c=c.display()[0]
              p.className=c.className
              p.title=c.title
              p.history=c.innerText
            }else{
              p.className=' none '
              p.title='none'
              p.history=p.innerText
            }
          }
        }
  		}else{
        e=document.createElement('span')
    		e.appendChild(c=document.createTextNode(Adicat.hl.options.space_character))
  			r.insertNode(e)
  			r.setStartBefore(c)
  			r.setEndAfter(c)
  		}
  		s.removeAllRanges()
  		s.addRange(r)
  	}
  	Adicat.hl.input_history=k.which
  }},
  display_text:function(text,add){
  	text=text||Adicat.hl.input.innerText
  	if('string'===typeof text){
      if(!add) Adicat.hl.input.innerText = ''
      text=Adicat.filterOut(text.split(Adicat.patterns.returns),'')
      for(var i=0, n=text.length, wi, wn, c;i<n;i++){
        c=new adicat(text[i]).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist).display()
        wn=c.length
        if(i<n-1){
          c[wn]=document.createElement('div')
          c[wn].appendChild(document.createElement('span'))
          c[wn].firstElementChild.className='blankspace'
          c[wn].firstElementChild.appendChild(document.createElement('br'))
          wn++
        }
    		for(wi=0;wi<wn;wi++){
    			Adicat.hl.input.appendChild(c[wi])
    			if(c[wi].tagName==='SPAN') Adicat.hl.append(Adicat.hl.input,'span',{innerHTML:Adicat.hl.options.space_character,className:'blankspace'})
    		}
      }
      if(!add && Adicat.hl.options.tabulate) Adicat.hl.update_table()
  	}
  },
  update_table:function(){
  	if(Adicat.hl.values.innerHTML===''){
  		Adicat.hl.values.innerHTML="<table><tr class='highlight'></tr><tr></tr></table>"
  		var o=Adicat.hl.values.children[0].children[0].children
  		Adicat.hl.append(o[0],'th',{innerText:'WC',title:'word count'})
  		Adicat.hl.append(o[1],'td',{innerText:0,id:'wc_value'})
  	}
  	var o=Adicat.hl.values.children[0].children[0].children, ol=o.length, w=Adicat.hl.input.children, i=w.length, k, f, cl, c, s,
        w=Adicat.hl.input.getElementsByTagName('span'), i=w.length, cat={wc:0},
        comps=Adicat.hl.options.dict[Adicat.hl.options.use_dict].composites||{},
        wc=document.getElementById('wc_value')
    if(!wc){
      Adicat.hl.values.style.display = 'none'
      document.body.appendChild(Adicat.hl.values)
      wc=document.getElementById('wc_value')
    }
  	for(k in Adicat.patterns.dict) if(Adicat.patterns.dict.hasOwnProperty(k) && Adicat.hl.options.blacklist.indexOf(k)===-1) cat[k]=0
  	while(i--) if(Adicat.patterns.char.test(w[i].innerText)){
      cl=w[i].className.trim().split(' ')
  		k=cl.length
      cat.wc++
  		while(k--){
  			c=cl[k]
  			if(cat.hasOwnProperty(c)) cat[c]++
  		}
  	}
  	for(k in cat) if(cat.hasOwnProperty(k) && k!=='wc'){
  		if(Adicat.hl.options.values==='percent' && cat[k]!==0) cat[k]=Math.round(cat[k]/cat.wc*10000)/100
      Adicat.hl.output[k]=cat[k]
      if((f=document.getElementById(k+'_value'))){
  			f.innerText=cat[k]
        c=cat[k] || Adicat.hl.options.show_zeros==='true' ? ' '+k+' ' : 'zero'
  			document.getElementById(k+'_title').className=c
        f.className=c
  		}else{
  			if(!o[0].children.length){
  				Adicat.hl.append(o[0],'th',{innerText:'WC',title:'word count'})
  				Adicat.hl.append(o[1],'td',{innerText:0,id:'wc_value'})
  			}
        if(o[0].children.length===1){
          if(Adicat.hl.texts.comp > -1 && Adicat.hl.texts.hasOwnProperty(Adicat.hl.texts.comp)){
            Adicat.hl.append(o[0],'th',{innerText:'sim to '+Adicat.hl.texts.comp,title:
              (/^co/i.test(Adicat.hl.options.sim_metric) ? 'Cosine similarity' : 'Inverse Canberra distance')+' to text '+Adicat.hl.texts.comp+'; click to recalculate.'})
            Adicat.hl.texts.comp_values=new adicat(Adicat.hl.texts[Adicat.hl.texts.comp]).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist).toPercent().cats
    				Adicat.hl.append(o[1],'td',{innerText:0,id:'similarity'})
            document.getElementById('similarity').parentElement.parentElement.children[0].children[1].addEventListener('click', Adicat.hl.sim_refresh)
          }
          for(f in comps) if(comps.hasOwnProperty(f) && comps[f].show){
            Adicat.hl.append(o[0],'th',{innerText:f,title:comps[f].formula})
    				Adicat.hl.append(o[1],'td',{innerText:0,id:'comp_'+f})
          }
        }
  			Adicat.hl.append(o[0],'th',{innerText:k,id:k+'_title',className:cat[k] || Adicat.hl.options.show_zeros==='true' ? ' '+k+' ' : 'zero'})
  			Adicat.hl.append(o[1],'td',{innerText:cat[k],id:k+'_value',className:cat[k] || Adicat.hl.options.show_zeros==='true' ? '' : 'zero'})
  		}
  	}
    if(Adicat.hl.texts.comp > -1 && Adicat.hl.texts.comp_values){
      s=document.getElementById('similarity')
      if(s) s.innerText=Math.round(
        new adicat(Adicat.hl.input.innerText)
          .similarity(Adicat.hl.texts.comp_values,Adicat.hl.options.sim_metric,Adicat.hl.options.sim_filter === 'true' ? Adicat.hl.options.sim_cats : false).value
        *1000)/1000
    }
    for(f in comps) if(comps.hasOwnProperty(f) && comps[f].show){
      o=document.getElementById('comp_'+f)
      if(o) o.innerText=Adicat.hl.solve(comps[f].formula)
    }
  	wc.innerText=cat.wc
  },
  solve:function(eq){
  	var mr=/\s|^Math\./g, ch=/[^\.0-9+><*%^()&|\/-]/g, nf=/^\(/, fh=/^[^(]*/, ip=/\([^(]+\)/g,
  	  bs=/\s+/g, bo=/[^+><*^()&%|\/-]+/g, e={}, sp=[], te='', l=0
  	function dict_ops(s){
  		for(var s=s+'', t=s.match(bo), n=t ? t.length : 0, c='', i=0;i<n;i++){
  			c=t[i].replace(bs,'')
        if(c) c=Adicat.hl.output.hasOwnProperty(c) ? Number(Adicat.hl.output[c]) : Number(c)
  			if(isNaN(c)) c=0
  			s=s.replace(t[i],c)
  		}
  		return s
  	}
  	eq=eq.replace(Adicat.patterns.returns,' ')
  	sp=eq.match(ip)
  	if(sp){
  		for(l=sp.length;l--;){
  			e[sp[l]]=sp[l].replace(' ','')
  			te=e[sp[l]].replace(e[sp[l]],dict_ops(e[sp[l]]))
  			eq=eq.replace(sp[l],te)
  		}
  		sp=eq.match(/(^|[^(+><*^&|\/-]*)\([^()]*\)/g)
  		for(l=sp.length;l--;){
  			e[sp[l]]=sp[l].replace(mr,'')
  			if(!nf.test(e[sp[l]])){
  				te=e[sp[l]].match(fh)
  				e[sp[l]]=e[sp[l]].replace(fh,'')
  				if(Math.hasOwnProperty(te)){
  					e[sp[l]]=Math[te](Number(Function('"use strict"; return '+e[sp[l]].replace(ch,''))()))
  					if(isNaN(e[sp[l]])) e[sp[l]]=0
  				}
  			}
  			eq=eq.replace(sp[l],e[sp[l]])
  		}
  	}
  	eq=dict_ops(eq)
  	eq=Math.round(Function('"use strict"; return '+eq.replace(ch,''))()*10000)/10000
  	return isFinite(eq) ? eq : 0
  },
  sim_refresh:function(){
    var s=document.getElementById('similarity')
    if(s){
      Adicat.hl.texts.comp_values=new adicat(Adicat.hl.texts[Adicat.hl.texts.comp]).categorize(Adicat.patterns.dict,Adicat.hl.options.blacklist).toPercent().cats
      s.innerText=Math.round(new adicat(Adicat.hl.input.innerText)
        .similarity(Adicat.hl.texts.comp_values,Adicat.hl.options.sim_metric,Adicat.hl.options.sim_filter === 'true' ? Adicat.hl.options.sim_cats : false).value*1000)/1000
    }
  },
  select:function(e){
  	var ck=e.classList.contains('select'), es=Adicat.hl.input.getElementsByClassName('select'), i
  	for(i=es.length;i--;) es[i].classList.remove('select')
    es=Adicat.hl.values.getElementsByClassName('select')
  	for(i=es.length;i--;) if(es[i].className!=='zero') es[i].classList.remove('select')
  	if(!ck){
      e.classList.add('select')
      es=Adicat.hl.input.getElementsByClassName(e.innerText)
      for(i=es.length;i--;) if(es[i].innerText!=='') es[i].classList.add('select')
    }
  },
  insertSpace:function(e,p){
    var s=document.createElement('span')
    s.className='blankspace'
    s.innerHTML=Adicat.hl.options.space_character
    e.insertAdjacentElement(p||'afterEnd',s)
  },
  append:function(target,type,attributes){
  	var e=document.createElement(type), k
  	for(k in attributes) e[k]=attributes[k]
  	target.appendChild(e)
  }
}
