'use strict'
var Adicat = {
	patterns:{
		word_breaks:/\s/g,
		char:/[A-z0-9?><!@#$%^&*()_+|}{":;'/.,-=\\\][\]]/,
		special:/[[\]()\/\\.?$*^]/g,
		stripped:/[^a-z0-9'\s]/g,
		filter:/[$#%^*\r\n\t\-~\\—–→\+=[/({})\]]|\s"(?!\w)|\s\s/g,
		curly_quote:{s:/[‘’]/g,d:/[“”]/g},
		emojis:{
			smile:/(^|\s)(?:[<([{,]+[\s-.,]*[Xx;:8=]+|[Xx;:8=]+[\s-.,]*[>p3)}D\]]+)(?=\s|$)/g,
			smile_rev:/emjhface/g,
			frown:/(^|\s)(?:[>p3)}D\]]+[\s-.,]*[Xx;:8=]+|[Xx;:8=]+[\s-.,]*[<([{q]+)(?=\s|$)/g,
			frown_rev:/emjsface/g
		},
		symbols:{and:/\&/g,at:/\@/g},
		punct:{
			emdash:/—/g,endash:/–/g,initials:/(\.[A-z0-9]+\.(?=[\s.]))/g,apostrophe:/\.\'s/g,ellipses:/…|\.{3,}|\. +\. +[. ]+/g,
			titles:/(?:^|\s)(st|rd|ft|feat|dr|drs|mr|ms|mrs|messrs|jr|prof)\./ig, initial_trim:/\.$/g
		},
		space:/\s(?=[\s.,?!)}>\]])|^\s|\s$|\.—/g,returns:/[\r\n]/g,
		boundary:{sentence:/[?!.]+(?:[^A-z0-9]|$)/g, clause:/[.,:;?!(\)<>{}[\]]+(?:[^A-z0-9]|$)/g},
		cues:{
			question:/\?|\sw+h+a+[t\s]*\s|\sw+h+e+n+\s|\sw+h+o+\s|\show|\sa+[sk]{2}\s|\sh+u+h/,
			greeting:/\sh+i+[yi]*\s|\sh+[ae]+[iy]+\s|\sh+e+l+o+\s|\sy+o+\s|\sw+h+a+t+[']*(?:s|\sis)\s(?:shak|up)/,
			yes:/\sy+[ae]+s+\s|\sy+e+a+h+\s|\ss+u+r+[e\s]+|\su+h+u[hu\s]+\s|\sa+f+i+r+m|\sa+cc+e+p/,
			no:/\sn+o+\s|\sn+o+p+e+\s|\sd+e+c+l+i|\sr+e+j+e+c/,
			sad:/\semjsface\s|\sb+a+d+\s|\ss+a+d+\s|\sf+r+u+s+t+r|\sd+e+p+r+e+s|\st+e+r+i+b+l|\sh+o+r+i+b+l/,
			happy:/\semjhface\s|\sh+a+p+y+\s|\se+x+c+i+t|\sg+oo+d+\s|\sg+r+e+a+t+\s|\se+x+c+e+l+e+n+t|\ss+u+pe+r+\s|\sn+i+c+e+\s/
		},
		matches:{},
		dict:null,
		dict_cats:[],
		dict_proc:false
	},
	liwc_means:{
		'overall':{'ppron':9.95,'ipron':5.26,'article':6.51,'auxverb':8.53,'adverb':5.27,'prep':12.93,'conj':5.9,'negate':1.66,'quant':2.02},
		'blogs':{'ppron':10.66,'ipron':5.53,'article':6,'auxverb':8.75,'adverb':5.88,'prep':12.6,'conj':6.43,'negate':1.81,'quant':2.27},
		'expressive':{'ppron':12.74,'ipron':5.28,'article':5.7,'auxverb':9.25,'adverb':6.02,'prep':14.27,'conj':7.46,'negate':1.69,'quant':2.35},
		'novels':{'ppron':10.35,'ipron':4.79,'article':8.35,'auxverb':7.77,'adverb':4.17,'prep':14.27,'conj':6.28,'negate':1.68,'quant':1.8},
		'natural':{'ppron':13.37,'ipron':7.53,'article':4.34,'auxverb':12.03,'adverb':7.67,'prep':10.29,'conj':6.21,'negate':2.24,'quant':1.93},
		'nytimes':{'ppron':3.56,'ipron':3.84,'article':9.08,'auxverb':5.11,'adverb':2.76,'prep':14.27,'conj':4.85,'negate':0.62,'quant':1.94},
		'twitter':{'ppron':9.02,'ipron':4.6,'article':5.58,'auxverb':8.27,'adverb':5.13,'prep':11.88,'conj':4.19,'negate':1.74,'quant':1.85}
	},
	toRegex:function(obj,level){
		var op, s=level ? '\\s' : '^', e=level ? '\\s' : '$', hf=/^\^|\$$/g, wildcards=level ? /(?=\\s|\s)+\*|\*(?=\\s|\s)+/g : /\^\*|([^)\]])\*\$/g,
				t=level?'g':'', open=/(^|[^\\])[[(]/, close=/(^|[^\\])[)\]]/, sp=/\s/g, wr=level ? '[^\\s]*' : '\$1', isarr, k, i, p
		if(obj && 'object' === typeof obj) isarr = obj.hasOwnProperty('length')
		if(isarr) obj={a:obj}
		for(k in obj) if(obj.hasOwnProperty(k) && !obj[k].test){
			if(!op) op={}
			op[k]=[]
			for(i='string'===typeof obj[k] ? 0 : obj[k].length;i--;){
				if((open.test(obj[k][i])+close.test(obj[k][i]))===1){
					obj[k][i]=obj[k][i].replace(Adicat.patterns.special,'\\$&')
				}
				op[k][i]=(s+obj[k][i].replace(hf,'')+e).replace(wildcards,wr).replace(sp, '\\s')
			}
			op[k]=new RegExp(op[k].join('|'),t)
		}
		Adicat.patterns.dict_proc=true
		return isarr ? op.a : op
	},
	loadDict:function(url){
		var f=new XMLHttpRequest(), k
	  f.onreadystatechange=function(){if(f.readyState===4 && f.status===200){
	      Adicat.patterns.dict=/^%/.test(f.responseText) ? Adicat.read_dic(f.responseText) : JSON.parse(f.responseText)
				if(Adicat.patterns.dict) for(k in Adicat.patterns.dict) if(Adicat.patterns.dict.hasOwnProperty(k)) Adicat.patterns.dict_cats.push(k)
	  }}
	  f.open('GET',url,true)
	  f.send()
	},
	read_dic:function(dic){
		var h=dic.replace(/[\r\n]+/g,'\n').split(/%[^\n]*\n/), b=h.splice(2)[0], m={c:[],i:[]}, op={},
		    p={ch:/^[^\d]+|[\t\r\n\s]+$/g,cb:/^[\t\r\n\s]+|[^\d]+$/g,tr:/\t+/,nd:/[^\d]+/g}, i=0, mi, n, l, s
		h=h[1].match(/\d+[\t\s]+[^\n]+/g)
		if(!h) throw new TypeError('Unrecognized file type')
		n=h.length
		for(;i<n;i++){
			l=h[i].replace(p.ch,'').split(p.tr)
			s=l[0].replace(p.nd,'')
			op[l[1]]=[]
			m.c.push(l[1])
			m.i.push(s)
		}
		b=b.split('\n')
		i=b.length
		while(i--){
			s=b[i].replace(p.cb,'').split(p.tr)
			l=s.splice(1)
			s=s[0]
			for(h=l.length;h--;) if((mi=m.i.indexOf(l[h]))!==-1) op[m.c[mi]].push(s)
		}
		return op
	},
	write_dic:function(obj){
		var k, l, i=1, h=['%'], w={}
		for(k in obj){if(obj.hasOwnProperty(k)){
			h.push(i+'\t'+k)
			l=obj[k].length
			while(l--) w.hasOwnProperty(obj[k][l]) ? w[obj[k][l]].push(i) : w[obj[k][l]]=[i]
			i++
		}}
		h.push('%')
		for(k in w) if(w.hasOwnProperty(k)) h.push(k+'\t'+w[k].join('\t'))
		return h.join('\n')
	},
	dict_export:function(obj,dic,download,filename){
		var e=document.createElement('a')
		if(dic){
			obj=Adicat.write_dic(obj)
		}else{
			obj=JSON.stringify(obj).replace(/^{/,'{\n  ').replace(/}$/,'\n}').replace(/],/g,'],\n  ')
		}
		if(download){
			if('undefined'!==typeof e.download){
				e.setAttribute('href', URL.createObjectURL(new Blob([obj], {type: 'text/plain'})))
				e.setAttribute('download',(filename||'adicat_dictionary').replace(/\.\w+$/,'')+(dic ? '.dic' : '.json'))
				document.body.appendChild(e)
				e.click()
				document.body.removeChild(e)
			}else if(navigator && navigator.msSaveBlob){
				navigator.msSaveBlob(new Blob([obj], {type: 'text/plain'}),
			  	(filename||'adicat_dictionary').replace(/\.\w+$/,'')+(dic ? '.dic' : '.json'))
			}else throw 'Browser does not seem to support downloading.'
		}
		return obj
	},
	bulk_process:function(texts,filename,split,sep,args){
		if(!args) args = {}
		if(!args.hasOwnProperty('dict')) args.dict = Adicat.patterns.dict
		if(Adicat.hasOwnProperty('hl')){
			if(!args.hasOwnProperty('blacklist')) args.blacklist = Adicat.hl.options.blacklist
			if(!args.hasOwnProperty('percent')) args.percent = Adicat.hl.options.values === 'percent'
			if(!args.hasOwnProperty('similarity') && Adicat.hl.texts) args.similarity = Adicat.hl.texts.comp
			if(!args.hasOwnProperty('comps')) args.comps = Adicat.hl.options.dict[Adicat.hl.options.use_dict].composites
			if(!args.hasOwnProperty('meta')) args.meta = Adicat.hl.options.meta
		}
		if(!args.hasOwnProperty('meta')) args.meta = true
		sep = Adicat.hasOwnProperty('hl') ? Adicat.hl.options.sep : ','
		var t = texts, pb = document.getElementById('progbar'), pbm = document.getElementById('progbar_message'), n = t.length, i = 0, c = 0,
		  lim = 1000, h = 'text', b = '\n', k, to, lfun = function(){step()}, sc = /"/g, ck = /[^\s]/, st = new Date().getTime(), ml, f
		if('string' === typeof t){
			ml = t.match(/^"[^]*?"$/gm)
			if(ml) for(var sse = /^"|"$/g, sd = /""/g, i = ml.length; i--;){
				t = t.replace(ml[i], ml[i].replace(Adicat.patterns.returns, ' ').replace(sse, '').replace(sd, '"'))
			}
			t = t.split(split ? new RegExp(split, 'g') : Adicat.patterns.returns)
			n = t.length
		}
		function step(){
			if('undefined' !== typeof t[i]){
				if(t[i] && ck.test(t[i])){
					t[i] = new adicat(t[i]).categorize(args.dict, args.blacklist)
					b = b + '"' + t[i].string.clean.replace(sc, '""') + '"'
					if(args.meta){
						t[i].procmeta()
						to = {characters:t[i].chars, words:t[i].WC, captured:t[i].captured, unique:t[i].unique}
						for(k in t[i].meta) if(t[i].meta.hasOwnProperty(k)) to[k] = t[i].meta[k]
						t[i].meta = to
					}
					if(args.percent) t[i].toPercent()
					if(args.similarity){
						t[i].similarity(Adicat.hl.texts.comp_values,Adicat.hl.options.sim_metric,Adicat.hl.options.sim_filter === 'true' ? Adicat.hl.options.sim_cats : false)
						t[i].cats[Adicat.hl.options.sim_metric+'_to_'+args.similarity] = t[i].sim.value
					}
					if(args.comps) for(f in args.comps) if(args.comps.hasOwnProperty(f) && args.comps[f].show){
						Adicat.hl.output = t[i].cats
					  t[i].cats[f] = Adicat.hl.solve(args.comps[f].formula)
					}
					to = t[i].cats
					if(args.meta) for(k in t[i].meta) if(t[i].meta.hasOwnProperty(k)) to[k] = t[i].meta[k]
					t[i] = to
					for(k in t[i]) if(t[i].hasOwnProperty(k)){
						if(!i || h == 'text') h += sep + k
						b += sep + t[i][k]
					}
				}else b += t[i]
				b += '\n'
			}
			if(n < lim){
				i++ < n ? step() : output()
			}else{
				if(c >= lim || c + lim < n){
					if(pb) pb.style.width = Math.round(Math.min(10000, (i + 1) / n * 10000) / 100) + '%'
					if(pbm) pbm.innerText = pb.style.width
				}
				if(i++ < n){
					if(c++ > lim){
						c = 0
						setTimeout(lfun)
					}else step()
				}else output()
			}
		}
		function output(){
			var e = document.createElement('a'),
			  content = new Blob([h + b], {type: 'text/' + (sep == ',' ? 'csv' : 'plain')})
			if(pbm){
				st = new Date().getTime() - st
				pbm.innerText = st > 1000 ? (Math.round(st / 10) / 100) + ' secs' : st + ' ms'
			}
			if('undefined'!==typeof e.download){
				e.setAttribute('href', URL.createObjectURL(content))
				e.setAttribute('download', (filename||'adicat_' + new Date().getTime()) + (sep == ',' ? '.csv' : '.txt'))
				document.body.appendChild(e)
				e.click()
				document.body.removeChild(e)
			}else if(navigator && navigator.msSaveBlob){
				navigator.msSaveBlob(content, (filename||'adicat_' + new Date().getTime()) + (sep == ',' ? '.csv' : '.txt'))
			}else throw 'Browser does not seem to support downloading.'
		}
		step()
	},
	pnorm:function(x, m, sd){
		m = m || 0
		sd = sd || 1
		if(sd <= 0){
    	return x < m ? 0 : 1
		}else{
		  var z = Math.abs((x - m) / sd), t = 1 / (1 + .2316419 * z), e = .3989423 * Math.exp(-z * z / 2) *
		      t * (.3193815 + t * (-.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
		  return x > 0 ? 1 - e : e
		}
	},
	dnorm:function(x, m, sd){
		m = m || 0
		sd = sd || 1
	  return sd <= 0 ? x < m ? 0 : 1 : Math.exp(-Math.pow(x - m, 2) / (2 * Math.pow(sd, 2))) / (sd * Math.sqrt(2 * Math.PI))
	},
  rand:function(u,l){
		l = l || 0
		return Math.floor(Math.random() * (u - l + 1) + l)
	},
	filterOut:function(arr,remove){
		remove = remove || ''
		var fun = remove.test ? function(e){return !remove.test(e)} : function(e){return e !== remove}
		return arr.filter(fun)
	},
	which:function(obj){
		for(var k in obj) if(obj.hasOwnProperty(k) && obj[k]) return k
		return -1
	},
	bench:function(iter,fun){
		var st=new Date().getTime()
		while(iter--) fun.call()
		return new Date().getTime()-st
	}
}

function adicat(str){
	if('string'!==typeof str) throw new TypeError('argument must be a string')
	this.string={raw:str,clean:'',stripped:''}
	this.chars=str.length
	this._processLevel=0
	this._processTime={meta:-1,token:-1,cue:-1,cat:-1,display:-1}
}

adicat.prototype={
	constructor:adicat,
	tokenize:function(){
		var st=new Date().getTime(), initials, i
		this.string.clean=this.string.raw
			.replace(Adicat.patterns.word_breaks,' ')
			.replace(Adicat.patterns.curly_quote.s,"'")
			.replace(Adicat.patterns.curly_quote.d,'"')
			.replace(Adicat.patterns.emojis.smile,' emjhface ')
			.replace(Adicat.patterns.emojis.frown,' emjsface ')
			.replace(Adicat.patterns.symbols.and,' and ')
			.replace(Adicat.patterns.symbols.at,' at ')
			.replace(Adicat.patterns.punct.apostrophe,"'s")
			.replace(Adicat.patterns.punct.ellipses,'... ')
			.replace(Adicat.patterns.punct.endash,' -- ')
			.replace(Adicat.patterns.punct.emdash,' --- ')
			.replace(Adicat.patterns.punct.titles,'\$&—')
			.replace(Adicat.patterns.space,'')
		if(initials = this.string.clean.match(Adicat.patterns.punct.initials))
		  for(i = initials.length; i--;) this.string.clean = this.string.clean
			  .replace(initials[i], initials[i].replace(Adicat.patterns.punct.initial_trim, ''))
		this.string.stripped=this.string.clean.toLowerCase().replace(Adicat.patterns.stripped,'')
		this.words={
			token:this.string.stripped.split(Adicat.patterns.word_breaks),
			print:this.string.clean
				.replace(Adicat.patterns.emojis.smile_rev,':)')
				.replace(Adicat.patterns.emojis.frown_rev,':(')
				.split(Adicat.patterns.word_breaks)
		}
		this.WC=Adicat.filterOut(this.words.token).length
		if(this.words.token.length!==this.words.print.length){
			if(!this._processLevel){
				this._processLevel=.5
				this.string.raw=this.string.raw.replace(/[^A-z0-9?!'",.-;:[({})\]]/g,' ')
				return this.tokenize()
			}else throw 'InputError: the input text is not parsing properly; check for special characters'
		}
		this.string.stripped=' '+this.string.stripped+' '
		this._processLevel=1
		this._processTime.token=new Date().getTime()-st
		return this
	},
	categorize:function(dict,blacklist){
		blacklist=blacklist||[]
		if(!this._processLevel) this.tokenize()
		if(!dict){
			if(!Adicat.patterns.dict_proc) Adicat.patterns.dict=Adicat.toRegex(Adicat.patterns.dict)
			dict=Adicat.patterns.dict
		}else for(var k in dict){if(dict.hasOwnProperty(k)){
				if(dict[k].test){break}else{
					dict=Adicat.toRegex(dict)
					break
				}
		}}
		var i=this.words.print.length, st=new Date().getTime(), c, cc, cs, t, k, r
		this.words.categories=[]
		this.vector={}
		this.cats={}
		this.cats_type=this.unique=this.captured=0
		while(i--){
			t=this.words.token[i]
			if(this.vector.hasOwnProperty(t)){
				this.vector[t]++
			}else{
				this.vector[t]=1
				this.unique++
			}
			if(Adicat.patterns.matches.hasOwnProperty(t)){
				cs=Adicat.patterns.matches[t]
				for(k in dict) if(dict.hasOwnProperty(k) && blacklist.indexOf(k)===-1){
					if(!this.cats.hasOwnProperty(k)) this.cats[k] = 0
					if(cs.indexOf(k) !== -1) this.cats[k]++
 				}
				this.words.categories[i]=' '+cs.join(' ')+' '
				this.captured+=1
			}else{
				r=false
				for(k in dict) if(dict.hasOwnProperty(k) && blacklist.indexOf(k)===-1){
					if(!this.cats.hasOwnProperty(k)) this.cats[k]=0
					if(dict[k].test(t)){
						if(!Adicat.patterns.matches[t]) Adicat.patterns.matches[t]=[]
						this.cats[k]+=1
						Adicat.patterns.matches[t].push(k)
						r=true
					}
				}
				this.words.categories[i]=Adicat.patterns.matches[t]? ' '+Adicat.patterns.matches[t].join(' ')+' ' : ' none '
				if(r) this.captured+=1
			}
		}
		this._processLevel=2
		this._processTime.cat=new Date().getTime()-st
		return this
	},
	toPercent:function(round){
		if(!this.hasOwnProperty('cats')){this.categorize()}
		if(!this.cats_type){
			this.cats_type=1
			for(var k in this.cats) if(this.cats.hasOwnProperty(k)){
				this.cats[k]=this.WC ? this.cats[k]/this.WC*100 : 0
				if(round) this.cats[k]=Math.round(this.cats[k]*100)/100
			}
		}
		return this
	},
	detect:function(cues){
		cues=cues||Adicat.patterns.cues
		if(!this._processLevel) this.tokenize()
		var st=new Date().getTime(), k
		this.cues={}
		for(k in cues) if(cues.hasOwnProperty(k)){
			if(!cues[k].test) cues[k] = Adicat.toRegex(cues[k], true)
			this.cues[k]=cues[k].test(this.string.stripped)||cues[k].test(this.string.raw)
		}
		this._processTime.cue=new Date().getTime()-st
		return this
	},
	display:function(sort,bycat){
		var st=new Date().getTime(), i=0, inner=/\s/g, t='', e, sf
		if(this._processLevel<2) this.categorize()
		this.html=[]
		for(;i<this.words.print.length;i++){
			if(this.words.categories[i]==='\s'){
				t = ' none '
			}else{
				t = this.words.categories[i].trim().split(' ')
				for(e = t.length; e--;) if(!this.cats.hasOwnProperty(t[e])) t.pop(e)
				t = t.length ? ' ' + t.join(' ') + ' ' : ' none '
			}
			this.html[i]=document.createElement('span')
			this.html[i].className=t
			this.html[i].title=t.trim().replace(inner,', ')
			this.html[i].innerText=this.words.print[i]
		}
		if(sort){
			if(bycat){
				sf=function(a,b){return a.className > b.className ? 1 : -1}
			}else{
				sf=function(a,b){return a.innerText.toUpperCase() > b.innerText.toUpperCase() ? 1 : -1}
			}
			this.html=this.html.sort(sf)
		}
		this._processTime.display=new Date().getTime()-st
		return this.html
	},
	procmeta:function(){
		var st=new Date().getTime(), i=0, t=0, ct=[], terms={}, c, syllables=/a+[eu]*|e+[aiy]*|i+|o+[ui]*|u+|y+[aeiou]*/g,
			apostrophes=/[\u02bc]+|[A-z][\u0027\u0060\u2019]+[A-z]/g, pp={puncts:/(^|\s)[^A-z0-9]|[^A-z0-9](\s|$)/g,numbers:/(^|\s)[0-9]/g,
			periods:/\./g,commas:/,/g,qmarks:/\?/g,exclams:/\!/g,quotes:/(^|\s)['"]+|['"]+(\s|$)/gm,brackets:/[(\){}<>[\]]/g,orgmarks:/[-—–\\/:;]/g}
		if(this._processLevel < 2) this.categorize()
		this.meta={characters:0,syllables:0,sentences:0,WPS:0,clauses:0,WPC:0,sixltr:0,characters_per_word:0,syllables_per_word:0,
			type_token_ratio:0,reading_grade:0,numbers:0,puncts:0,periods:0,commas:0,qmarks:0,exclams:0,quotes:0,apostrophes:0,
			brackets:0,orgmarks:0}
		this.meta.sentences=Adicat.filterOut(this.string.clean.split(Adicat.patterns.boundary.sentence))
		i=this.meta.sentences.length
		while(i--){
			ct=Adicat.filterOut(this.meta.sentences[i]
				.toLowerCase().replace(Adicat.patterns.stripped,'').split(Adicat.patterns.word_breaks))
			t = ct.length
			this.meta.WPS += t
			while(t--){
				if(!terms.hasOwnProperty(ct[t])){
					terms[ct[t]] = ct[t].split(syllables).length - 1
					if(!terms[ct[t]]) terms[ct[t]] = 1
				}
				this.meta.characters += ct[t].length
				if(ct[t].length > 5) this.meta.sixltr += 1
				this.meta.syllables += terms[ct[t]]
			}
		}
		this.meta.sentences=this.meta.sentences.length
		this.meta.WPS=this.meta.sentences ? this.meta.WPS / this.meta.sentences : 0
		if(this.WC){
			this.meta.characters_per_word=this.meta.characters / this.WC
			this.meta.syllables_per_word=this.meta.syllables / this.WC
			this.meta.type_token_ratio=this.unique / this.WC
			if(this.meta.sentences) this.meta.reading_grade=.39*this.WC/this.meta.sentences+11.8*this.meta.syllables/this.WC-15.59
		}
		this.meta.clauses=Adicat.filterOut(this.string.clean.split(Adicat.patterns.boundary.clause))
		i=this.meta.clauses.length
		while(i--) this.meta.WPC += Adicat.filterOut(this.meta.clauses[i]
			.toLowerCase().replace(Adicat.patterns.stripped,'').split(Adicat.patterns.word_breaks)).length
		this.meta.clauses=this.meta.clauses.length
		this.meta.WPC=this.meta.clauses ? this.meta.WPC / this.meta.clauses : 0
		this.meta.apostrophes=Adicat.filterOut(this.string.clean.split(apostrophes)).length - 1
		for(c in pp) if(pp.hasOwnProperty(c)){
			this.meta[c]=this.string.clean.match(pp[c])
			this.meta[c]=this.meta[c] ? this.meta[c].length : 0
		}
		this._processTime.meta=new Date().getTime()-st
		return this
	},
	similarity:function(comp,metric,cats){
		if(!comp) comp = 'overall'
		if(!this.hasOwnProperty('cats')) this.categorize()
		if('string' === typeof cats) cats = /^[Mm]/.test(cats) ? 'meta' : 'vector'
		if('string' === typeof comp){
			if(Adicat.liwc_means.hasOwnProperty(comp)){
				comp = Adicat.liwc_means[comp]
				cats = ['ppron','ipron','article','adverb','conj','prep','auxverb']
			}else{
				comp = cats === 'meta' ? new adicat(comp).procmeta() : new adicat(comp).categorize().toPercent()
			}
		}
		if(!cats){
			cats = 'object' === typeof comp && (comp.hasOwnProperty('WPC') || !(comp.captured || this.captured))
				? comp.hasOwnProperty('WPC') ? 'meta' : 'vector'
				: Adicat.patterns.dict_cats.length ? Adicat.patterns.dict_cats : ['ppron','ipron','article','adverb','conj','prep','auxverb']
		}
		if(!this.cats_type && 'string' !== typeof cats) this.toPercent()
		if(cats === 'meta' && !this.hasOwnProperty('meta')) this.procmeta()
		var v='string'===typeof cats, c='', cos=metric && /^co/i.test(metric), k, i, a = v ? this[cats] : this.cats,
				b = v ? comp.hasOwnProperty(cats) && 'object' === typeof comp[cats] ? comp[cats] : comp : comp, com
		this.sim = {
			value: 0,
			cats: cats,
			comp: b,
			metric: metric
		}
		if(v){
			cats = []
			for(k in a) if(a.hasOwnProperty(k) && cats.indexOf(k) === -1) cats.push(k)
			for(k in b) if(b.hasOwnProperty(k) && cats.indexOf(k) === -1) cats.push(k)
		}
		i = cats.length
		if(cos) this.sim.value=[0,0,0]
		while(i--){
			c=cats[i]
			if(!a.hasOwnProperty(c)) a[c]=0
			if(!b.hasOwnProperty(c)) b[c]=0
			if(cos){
				this.sim.value[0]+=a[c]*b[c]
				this.sim.value[1]+=a[c]*a[c]
				this.sim.value[2]+=b[c]*b[c]
			}else{
				if(a[c]+b[c]) this.sim.value+=Math.abs(a[c]-b[c])/(a[c]+b[c])
			}
		}
		if(cos){
			this.sim.value=this.sim.value[0]/Math.sqrt(this.sim.value[1])/Math.sqrt(this.sim.value[2])
		}else{
			this.sim.value=1-(this.sim.value/cats.length)
		}
		if(isNaN(this.sim.value)) this.sim.value=0
		return this.sim
	}
}

Array.prototype.sample=function(n){
	var r=this.length-1, set=[], res=[], i=0, t=0
	if(!n||n===1) return this[Adicat.rand(r)]
	n=Math.min(n,r)
	while(i<n) if(set.indexOf(t=Adicat.rand(r))===-1){
		set[i]=t
		res[i]=this[t]
		i++
	}
	return res
}
Array.prototype.unique=function(){
	var n=this.length, l=0, i=0, op=[]
	for(;l<n;l++) if(op.indexOf(this[l])===-1){
		op[i]=this[l]
		i++
	}
	return op
}
Array.prototype.grepl=function(p){
	var i=this.length, op=[]
	if(!this[0].test){
		if(!!this[0].search){
			while(i--){op[i]=this[i].search(p)!==-1}
		}else{throw new TypeError('the first value does not have a search or test function')}
	}else{
		while(i--){op[i]=this[i].test(p)}
	}
	return op
}
Array.prototype.nmatch=function(p){
	var i=this.length, s=0
	if(!this[0].test){
		if(!!this[0].search){
			while(i--){s+=this[i].search(p)!==-1}
		}else{throw new TypeError('the first value does not have a search or test function')}
	}else{
		while(i--){s+=this[i].test(p)}
	}
	return s
}
Array.prototype.sum=function(){var i=this.length, s=0; while(i--){s+=this[i]}return s}
if(!Array.prototype.indexOf) Array.prototype.indexOf=function(a){var i=this.length;while(i--){if(a==this[i])return i}return -1}
