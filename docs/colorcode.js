function colorcode(){'use strict';
  var n, c, ci, ct, k, m, mi, e, ei, ps, b = document.getElementsByTagName('code'), i = b.length,
    p = {
      s:/{/g, e:/}/g, n:/([0-9]+[A-z-]{0,3})/g, b:/\n/g, html:/&lt;\/|&lt;(?:html|head|div|script|style)/,
      si:/src\s*=/, sr:/^[^\n]*&gt;\n/, split:/&lt;script|&lt;\/script&gt;/g
    }, js = {
      url:/(http|www)[^\s,>'")}\]]+/g, comment:/\/\/[^\n]*|\/\*[^]*?\*\//g, regex:/\/[^/]*\/[gimuy]*/g, color:/#[0-9A-z]{3,6}/g,
      string:/'[^']*'|"[^"]*"/g, window:/window|document|Math|Date|RegExp|Adicat/g,
      number:/true|false/g, statement:/var |function|for| in |if|while|else|return |new /g,
      function:/[A-z]+(?=\()/g, logical:/(&lt;|&gt;|!)={0,2}|={2,3}|(?:\||\?|&amp;)+|:(?=[^,}]*(?:={1}))/g,
      operator:/&[^;\s]+;|[/*=+-]+/g, structure:/[()[\].,;]/g,
    }, html = {
      comment:/&lt;\!--[^]*?--&gt;|\/\*[^]*?\*\//g, string:js.string,
      selector:/(^| |\t)[.#][A-z][A-z_.\s<>:-]+(?={)/gm, color:js.color,
      arg:/[A-z]+\s*=|[A-z]+\s*:/g, tag:/[A-z]+(?= [^&]*&gt;|&gt;)/g
    }, charlen = function(a,b){return a.length > b.length}
  while(i--){
    c = b[i].innerHTML
    c = p.html.test(c) ? c.split(p.split) : [c]
    ci = c.length
    for(ci = c.length; ci--;){
      if(!p.html.test(c[ci]) && !p.si.test(c[ci])){
        e = []
        if(ct = c[ci].match(p.sr)){
          c[ci] = c[ci].replace(ct,'')
          c[ci - 1] = c[ci - 1] + '\n&lt;script' + ct
          c[ci + 1] = '<span class="break">\n</span>&lt;/<span class="tag">script</span>&gt;'
            + '<span class="break">\n</span>' + c[ci + 1]
        }
        for(k in js) if(js.hasOwnProperty(k) && (m = c[ci].match(js[k]))){
          for(m = m.sort(charlen), ei = e.length, mi = m.length; mi--;){
            e[ei++] = '<span class="' + k + '">' + m[mi] + '</span>'
            c[ci] = c[ci].replace(m[mi], ' i' + (ei - 1) + ' ')
          }
        }
        for(ei = e.length; ei--;) c[ci] = c[ci].replace(' i' + ei + ' ', e[ei])
        c[ci] = c[ci].replace(p.b, '<span class="break">\$&</span>')
          .replace(p.n, '<span class="number">\$&</span>')
          .replace(p.s, '<span class="structure">{</span><span class="body">')
          .replace(p.e, '</span><span class="structure bend">}</span>')
      }else{
        if(p.si.test(c[ci])){
          c[ci] = '&lt;script ' + c[ci] + '&lt;/script&gt;'
        }
        e = []
        for(k in html) if(html.hasOwnProperty(k) && (m = c[ci].match(html[k]))){
          for(m = m.sort(charlen), ei = e.length, mi = m.length; mi--;){
            e[ei++] = '<span class="' + k + '">' + m[mi] + '</span>'
            c[ci] = c[ci].replace(m[mi], ' i' + (ei - 1) + ' ')
          }
        }
        for(ei = e.length; ei--;){
          c[ci] = c[ci].replace(' i' + ei + ' ', e[ei])
        }
        c[ci] = c[ci].replace(p.b, '<span class="break">\$&</span>')
          .replace(p.n, '<span class="number">\$&</span>')
      }
    }
    b[i].innerHTML = c.join('')
  }
}
