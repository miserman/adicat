# adicat
A JavaScript library for simple text processing:
**a**s-needed **di**ctionary-based **cat**egorization

<img src='icon.svg' width='200px'>

## resources
* [introduction](https://miserman.github.io/adicat/)
* [documentation](https://miserman.github.io/adicat/docs/)

## highlighter
The [highlighter](https://miserman.github.io/adicat/highlight/) is meant to help manipulate texts, and assess dictionaries.

#### features
* See which words are being captured by dictionary categories.
  * Toggle categories in the dictionary menu.
  * Set to display counts or percentages in the settings menu.
* Calculate composite categories for, and similarities between texts.
  * Composite categories can be added and edited in the dictionary's load/create/edit menu.
  * Set a stored text for comparison in the saved texts menu.
  * Set the comparison categories and metric in the settings menu.
* Create or import, edit, and export dictionaries.
  * Cycle between stored dictionaries in the dictionary's load/create/edit menu.
* Download the results of text files scored by the selected dictionary.
  * Drag and drop a text file anywhere on the page, or navigate to the process file menu.
  * Specify output values, categories, composites, and comparisons in the other menus.
  * Specify formatting and splitting in the process file menu.

#### example texts
The example texts in the menu are from a series of studies: [osf.io/963gp](https://osf.io/963gp/). These involved manipulating texts in terms of a few function-word categories, which was the original motivation for the highlighter.

## chat
The [chat prototype](https://miserman.github.io/adicat/chat/) is a simple, cue-based chat bot for illustration.

You can chat with the bot, and edit its response set to the included set of cues.

## import scripts
#### the core script is always required
```html
<script type='text/javascript' src='https//miserman.github.io/adicat/core.min.js'></script>
```

#### the highlight and chat scripts add to the Adicat object
```html
<script type='text/javascript' src='https//miserman.github.io/adicat/highlight.min.js'></script>
<script type='text/javascript' src='https//miserman.github.io/adicat/chat.min.js'></script>
```

See the [introduction](https://miserman.github.io/adicat/) for complete implementation examples.
