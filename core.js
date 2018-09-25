'use strict'
var patterns={
	word_breaks:/\s/g,
	char:/[A-z0-9?><!@#$%^&*()_+|}{":;}'/.,-=\\\][\]]/,
	special:/[[\]()\/\\.?$*^]/g,
	striped:/[^a-z0-9'\s]/g,
	filter:/[$#%^*\r\n\t\-~\\—–→\+=[/({})\]]|\s"(?!\w)|\s\s/g,
	curly_quote:{s:/[‘’]/g,d:/[“”]/g},
	emojis:{
		smile:/\:\)|\:\s\)|\:\-\)/g,smile_rev:/emjhface/g,
		frown:/\:\(|\:\s\(|\:\-\(/g,frown_rev:/emjsface/g
	},
	symbols:{and:/\&/g,at:/\@/g},
	punct:{initials:/[,.](?=\w+[.,])/g,apostrophe:/\.\'s/g,ellipses:/…|\.{3,}|\. +\. +[. ]+/g},
	space:/\s(?=[\s.,?!)}>\]])|^\s|\s$/g,returns:/[\r\n]/g,
	boundary:{sentence:/[?!.:]+\s*/g, clause:/[.,:;?!(\)<>{}[\]]+\s*/g},
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
	dict_proc:false
}, liwc_means={
	'overall':{'ppron':9.95,'ipron':5.26,'article':6.51,'auxverb':8.53,'adverb':5.27,'prep':12.93,'conj':5.9,'negate':1.66,'quant':2.02},
	'blogs':{'ppron':10.66,'ipron':5.53,'article':6,'auxverb':8.75,'adverb':5.88,'prep':12.6,'conj':6.43,'negate':1.81,'quant':2.27},
	'expressive':{'ppron':12.74,'ipron':5.28,'article':5.7,'auxverb':9.25,'adverb':6.02,'prep':14.27,'conj':7.46,'negate':1.69,'quant':2.35},
	'novels':{'ppron':10.35,'ipron':4.79,'article':8.35,'auxverb':7.77,'adverb':4.17,'prep':14.27,'conj':6.28,'negate':1.68,'quant':1.8},
	'natural':{'ppron':13.37,'ipron':7.53,'article':4.34,'auxverb':12.03,'adverb':7.67,'prep':10.29,'conj':6.21,'negate':2.24,'quant':1.93},
	'nytimes':{'ppron':3.56,'ipron':3.84,'article':9.08,'auxverb':5.11,'adverb':2.76,'prep':14.27,'conj':4.85,'negate':0.62,'quant':1.94},
	'twitter':{'ppron':9.02,'ipron':4.6,'article':5.58,'auxverb':8.27,'adverb':5.13,'prep':11.88,'conj':4.19,'negate':1.74,'quant':1.85}
}

function adicat(str){
	if('string'!==typeof str) throw new TypeError('argument must be a string')
	this.string={raw:str,clean:'',striped:''}
	this.chars=str.length
	this._processLevel=0
	this._processTime={meta:-1,token:-1,cue:-1,cat:-1,display:-1}
}

adicat.prototype={
	constructor:adicat,
	tokenize:function(){
		var st=new Date().getTime()
		this.string.clean=this.string.raw
			.replace(patterns.word_breaks,' ')
			.replace(patterns.curly_quote.s,"'")
			.replace(patterns.curly_quote.d,'"')
			.replace(patterns.emojis.smile,' emjhface ')
			.replace(patterns.emojis.frown,' emjsface ')
			.replace(patterns.symbols.and,' and ')
			.replace(patterns.symbols.at,' at ')
			.replace(patterns.punct.apostrophe,"'s")
			.replace(patterns.punct.ellipses,'... ')
			.replace(patterns.space,'')
		this.string.striped=this.string.clean.toLowerCase().replace(patterns.striped,'')
		this.words={
			token:this.string.striped.split(patterns.word_breaks),
			print:this.string.clean
				.replace(patterns.emojis.smile_rev,':)')
				.replace(patterns.emojis.frown_rev,':(')
				.split(patterns.word_breaks)
		}
		this.WC=this.words.token.length
		if(this.WC!==this.words.print.length){
			if(!this._processLevel){
				this._processLevel=.5
				this.string.raw=this.string.raw.replace(/[^A-z0-9?!'",.-;:[({})\]]/g,' ')
				return this.tokenize()
			}else throw 'InputError: the input text is not parsing properly; check for special characters'
		}
		this.string.striped=' '+this.string.striped+' '
		this._processLevel=1
		this._processTime.token=new Date().getTime()-st
		return this
	},
	categorize:function(dict,blacklist){
		blacklist=blacklist||[]
		if(!this._processLevel) this.tokenize()
		if(!dict){
			if(!patterns.dict_proc) patterns.dict=adicat_readDict(patterns.dict)
			dict=patterns.dict
		}else for(var k in dict){if(dict.hasOwnProperty(k)){
				if(dict[k].test){break}else{
					dict=adicat_readDict(dict)
					break
				}
		}}
		var i=0, st=new Date().getTime(), c, cc, cs, t, k, r
		this.words.categories=[]
		this.cats={}
		this.cats_type=this.captured=0
		for(i=this.WC;i--;){
			t=this.words.token[i]
			if(patterns.matches.hasOwnProperty(t)){
				cs=patterns.matches[t]
				for(c=cs.length;c--;){
					cc=cs[c]
					if(blacklist.indexOf(cc)===-1){
						this.cats[cc]=this.cats.hasOwnProperty(cc) ? this.cats[cc]+1 : 1
					}
				}
				this.words.categories[i]=' '+cs.join(' ')+' '
				this.captured+=1
			}else{
				r=false
				for(k in dict){if(dict.hasOwnProperty(k) && blacklist.indexOf(k)===-1){
					if(!this.cats.hasOwnProperty(k)) this.cats[k]=0
					if(dict[k].test(t)){
						if(!patterns.matches[t]) patterns.matches[t]=[]
						this.cats[k]+=1
						patterns.matches[t].push(k)
						r=true
					}
				}}
				this.words.categories[i]=patterns.matches[t]? ' '+patterns.matches[t].join(' ')+' ' : ' none '
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
			for(var k in this.cats){if(this.cats.hasOwnProperty(k)){
				this.cats[k]=this.cats[k]/this.WC*100
				if(round) this.cats[k]=Math.round(this.cats[k]*100)/100
			}}
		}
		return this.cats
	},
	detect:function(cues){
		cues=cues||patterns.cues
		if(!this._processLevel) this.tokenize()
		var st=new Date().getTime(), k
		this.cues={}
		for(k in cues){if(cues.hasOwnProperty(k)){
			this.cues[k]=cues[k].test(this.string.striped)||cues[k].test(this.string.raw)
		}}
		this._processTime.cue=new Date().getTime()-st
		return this
	},
	display:function(sort,bycat){
		var st=new Date().getTime(), i=0, outer=/^ | $/g, inner=/ /g, t='', e, sf
		if(this._processLevel<2) this.categorize()
		this.html=[]
		for(;i<this.WC;i++){
			t=this.words.categories[i]===' ' ? ' none ' : this.words.categories[i]
			this.html[i]=document.createElement('span')
			this.html[i].className=t
			this.html[i].title=t.replace(outer,'').replace(inner,', ')
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
	meta:function(){
		var st=new Date().getTime(), i=0, c, pp={period:/\./g,comma:/,/g,qmark:/\?/g,exclam:/\!/g,quotes:/['"]/g,
		  brackets:/[(\){}<>[\]]/g,organization:/[-—–/:;]/g}
		if(!this._processLevel) this.tokenize()
		this.meta={period:0,comma:0,qmark:0,exclam:0,quotes:0,brackets:0,organization:0,
			sentences:0,WPS:0,clauses:0,WPC:0}
		this.meta.sentences=this.string.clean.split(patterns.boundary.sentence).filter(empty)
		i=this.meta.sentences.length
		while(i--) this.meta.WPS += this.meta.sentences[i].split(patterns.word_breaks).filter(empty).length
		this.meta.sentences=this.meta.sentences.length
		this.meta.WPS=this.meta.WPS / this.meta.sentences
		this.meta.clauses=this.string.clean.split(patterns.boundary.clause).filter(empty)
		i=this.meta.clauses.length
		while(i--) this.meta.WPC += this.meta.clauses[i].split(patterns.word_breaks).filter(empty).length
		this.meta.clauses=this.meta.clauses.length
		this.meta.WPC=this.meta.WPC / this.meta.clauses
		for(c in pp){if(pp.hasOwnProperty(c)){
			this.meta[c]=this.string.clean.match(pp[c])
			this.meta[c]=this.meta[c] ? this.meta[c].length : 0
		}}
		this._processTime.meta=new Date().getTime()-st
		return this
	},
	similarity:function(comp,metric,cats){
		cats=cats||['ppron','ipron','article','adverb','conj','prep','auxverb','negate','quant']
		this.sim=0
		if(!comp||'string'===typeof comp){
			comp=comp && !liwc_means.hasOwnProperty(comp) ? new adicat(comp).categorize().toPercent() : liwc_means[comp||'overall']
		}else if(comp.hasOwnProperty('cats')){
			if(!comp.cats_type) comp.toPercent()
			comp=comp.cats
		}else if(!comp.hasOwnProperty(cats[0])) return this.sim
		if(!this.hasOwnProperty('cats')) this.categorize()
		if(!this.cats_type) this.toPercent()
		var i=cats.length, l=0, c='', cos=metric && /^co/i.test(metric)
		if(cos) this.sim=[0,0,0]
		while(i--){
			c=cats[i]
			if(this.cats.hasOwnProperty(c) && this.cats[c]+comp[c]){
				l++
				if(cos){
					this.sim[0]+=this.cats[c]*comp[c]
					this.sim[1]+=this.cats[c]*this.cats[c]
					this.sim[2]+=comp[c]*comp[c]
				}else{
					this.sim+=Math.abs(this.cats[c]-comp[c])/(this.cats[c]+comp[c])
				}
			}
		}
		if(cos){
			this.sim=Math.round((this.sim[0]/Math.sqrt(this.sim[1])/Math.sqrt(this.sim[2]))*1000)/1000
		}else{
			this.sim=Math.round((1-(this.sim/l))*1000)/1000
		}
		if(isNaN(this.sim)) this.sim=0
		return this.sim
	}
}

// adicat specific utility functions
function adicat_readDict(obj,level){
	var op, s=level?' ':'^', e=level?' ':'$', hf=/^\^|\$$/g, wildcards=level?/ *\* */g:/\^*\*\$*/g,
			t=level?'g':'', open=/(^|[^\\])[[(]/, close=/(^|[^\\])[)\]]/, k, i, p
	for(k in obj){if(obj.hasOwnProperty(k) && !obj[k].test){
		if(!op) op={}
		op[k]=[]
		for(i='string'===typeof obj[k] ? 0 : obj[k].length;i--;){
			if((open.test(obj[k][i])+close.test(obj[k][i]))===1){
				obj[k][i]=obj[k][i].replace(patterns.special,'\\$&')
			}
			op[k][i]=(s+obj[k][i].replace(hf,'')+e).replace(wildcards,'')
		}
		op[k]=new RegExp(op[k].join('|'),t)
	}}
	patterns.dict_proc=true
	return op
}
function adicat_loadDict(n){
	var f=new XMLHttpRequest()
  f.onreadystatechange=function(){if(f.readyState===4 && f.status===200){
      patterns.dict=/^%/.test(f.resonseTest) ? read_dic(f.resonseTest) : JSON.parse(f.responseText)
  }}
  f.open('GET',n,true)
  f.send()
}
function read_dic(f){
	var h=f.replace(/[\r\n]+/g,'\n').split(/%[^\n]*\n/), b=h.splice(2)[0], m={c:[],i:[]}, op={},
	    p={ch:/^[^\d]+|[\t\r\n ]+$/g,cb:/^[\t\r\n ]+|[^\d]+$/g,tr:/\t+/,nd:/[^\d]+/g}, i=0, mi, n, l, s
	h=h[1].match(/\d+[\t ]+[^\n]+/g)
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
		h=l.length
		while(h--) if((mi=m.i.indexOf(l[h]))!==-1) op[m.c[mi]].push(s)
	}
	return op
}
function write_dic(d){
	var k, l, i=1, h=['%'], w={}
	for(k in d){if(d.hasOwnProperty(k)){
		h.push(i+'\t'+k)
		l=d[k].length
		while(l--) w.hasOwnProperty(d[k][l]) ? w[d[k][l]].push(i) : w[d[k][l]]=[i]
		i++
	}}
	h.push('%')
	for(k in w) if(w.hasOwnProperty(k)) h.push(k+'\t'+w[k].join('\t'))
	return h.join('\n')
}

// general untility/compatibility functions
function rand(u,l){l=l||0;return l+Math.floor(Math.random()*u+l)}
function which(obj){for(var k in obj){if(obj.hasOwnProperty(k) && obj[k]){return k}}return false}
function empty(p){return p!==''}
Array.prototype.sample=function(n){
	var r=this.length, set=[], res=[], i=0, t=0
	if(!n||n===1) return this[rand(r)]
	n=Math.min(n,r)
	while(i<n){if(set.indexOf(t=rand(r))===-1){
		set[i]=t
		res[i]=this[t]
		i++
	}}
	return res
}
function addEvent(target,type,fun){
	target.addEventListener
		? target.addEventListener(type,function(e){fun(e)},false)
		: target.attachEvent('on'+type,function(e){fun(e)},false)
}
Array.prototype.unique=function(){
	var n=this.length, l=i=0, op=[]
	for(;l<n;l++){if(op.indexOf(this[l])===-1){op[i]=this[l];i++}}
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
function bench(iter,fun){
	st=new Date().getTime()
	while(iter--){fun.call()}
	return new Date().getTime()-st
}
Array.prototype.sum=function(){var i=this.length, s=0; while(i--){s+=this[i]}return s}
if(!Array.prototype.indexOf) Array.prototype.indexOf=function(a){var i=this.length;while(i--){if(a==this[i])return i}return -1}
