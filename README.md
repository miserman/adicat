# adicat
A JavaScript library for simple text processing:
**a**s-needed **di**ctionary-based **cat**egorization

## documentation and examples
[miserman.github.io/adicat](https://miserman.github.io/adicat/)

## use in html documents
### include somewhere
```html
<script type='text/javascript' src='//miserman.github.io/adicat/adicat.min.js' async></script>
```

### include in \<script\>
```JavaScript
// just sets up the object to pull from
var text = new adicat('text to process')

// tokenize adds cleaned and split versions of the text
text.tokenize()

// so you could look at versions of separated words
var tokens = text.words.token
```

### detect looks for any match to a set of regular expressions
```JavaScript
// patterns.cues has a little initial set of expressions
text.detect()

// cues is then an object with true/false for each expressions
var cues = text.cues
```

### categorize needs a dictionary
```HTML
<script type='text/javascript' src='//miserman.github.io/adicat/dict/function.js' async></script>
```
### then you can get category frequencies
```JavaScript
// this adds the cats object
text.categorize()

// display will put each word in a span with categories assigned as their class
var word_elements = text.display()
````
