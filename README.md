# Backbone-Notes

Add notes to your Backbone Models

## Requirements

- [backbonejs](http://backbonejs.org/)
- [mustache.js](https://github.com/janl/mustache.js)

## Instalation

- **Script Tag:** `<script type="text/javascript" src="https://github.com/Cloudoki/backbone-notes/blob/master/index.js"></script>`
- **Bower:** `bower install git://github.com/Cloudoki/backbone-notes.git`
- **npm:** `npm install github:Cloudoki/backbone-notes`

## Usage
### Initialize the plugin:

```javascript
// Creating a model to be the notes parent
var User = Backbone.Model.extend({
    defaults: {
      name: 'unnamed user'
    },
    urlRoot: '/users'           // the model must have a urlRoot assigned
});
var user = new User({
    id: 1,
    name: 'John Doe'
});

var userNotes = new Notes.CollectionView({
    el: $('#notes'),             // where to add the notes to
    parentModel: user,           // adding the notes parent
    url: '/mynotes',             // URL to get notes from
    editElement: '#editElement', // the element id/class to get the edited text from
});
```

### Setting Mustache templates for View and Edit:
After initializing the plugin, create 2 Mustache templates: one for viewing the notes and one for the editing of the notes, and set them to the plugin.
```javascript
// Create the templates
var viewTemplate = "<div class=\"title\"><strong>Template Note #{{id}}</strong>" +
    "</div>" +
    "<div class=\"body\">" +
    "<p>" +
    "{{text}}" +
    "</p>" +
    "<button id=\"edit\">edit</button>" +
    "<button id=\"delete\">delete</button>" +
    "</div>";
  var editTemplate = "<div class=\"title\"><strong>Template Edit Note #{{id}}</strong>" +
    "</div>" +
    "<div class=\"body\">" +
    "<textarea id=\"editElement\">" +
    "{{text}}" +
    "</textarea>" +
    "<button id=\"update\">update</button>" +
    "<button id=\"cancel\">cancel</button>" +
    "</div>";

  Notes.ViewTemplate.setTemplate(viewTemplate); // set the view template
  Notes.EditTemplate.setTemplate(editTemplate); // set the edit template
```
In order for the plugin to detect the clicking events for editing, deleting, updating or cancel de edition of a note the templates **must have**:
- Html element with **id="edit"**:   used to show the editing view
- Html element with **id="delete"**: used to delete the note
- Html element with **id="update"**: used to update the note in editing view
- Html element with **id="cancel"**: used to cancel the editing

### Adding a note:
```html
<div id="notes">
    <div id="title"><strong>Make New Note</strong></div>
    <textarea id="textElement"></textarea>
    <br />
    <button id="add">Add Note</button>
</div>
```

```javascript
// add note when button `Add Note` is pressed
$('#add').click(function() {
    userNotes.addNote($('#textElement').val());
});
```

### Listening to notes triggers:
There are 4 events that the plugin triggers:
- **'note:created'**: when a note is created with success
- **'note:deleted'**: when a note is deleted with success
- **'note:saved'**: when a note is edited and update with success
- **'note:aborted'**: when the note editing is cancelled

```javascript
  // listening triggers
userNotes.on('note:created', function() {
    console.log("created triggered");
});
userNotes.on('note:deleted', function() {
    console.log("deleted triggered");
});
userNotes.on('note:aborted', function() {
    console.log("aborted triggered");
});
userNotes.on('note:saved', function() {
    console.log("saved triggered");
});
```
