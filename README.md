# Backbone-Notes

Add notes to your Backbone Models and render them with Mustache Templates

## Requirements

- [backbonejs](http://backbonejs.org/)
- [mustache.js](https://github.com/janl/mustache.js)

## Instalation

- **Script Tag:** `<script type="text/javascript" src="http://cdn.rawgit.com/Cloudoki/backbone-notes/blob/master/index.js"></script>`
- **Bower:** `bower install git://github.com/Cloudoki/backbone-notes.git`
- **npm:** `npm install github:Cloudoki/backbone-notes`

## Usage

### Containers

You will need to provide the elements for the list and creation views

```html
<div id="notes-create"></div>
<div id="notes-list"></div>
```

### ParentModel

You will also need an parent model for the notes to associate with:

```javascript
// Creating a model to be the notes parent
  var User = Backbone.Model.extend({
    defaults: {
      name: 'unnamed user'
    },
    // the model must have a urlRoot assigned because this model is not
    //  within a collection
    urlRoot: 'users/'
  });

  var user = new User({
    id: 1,
    name: 'John Doe'
  });
```

### Initialization

You may use the `Notes.init` function for standart use of the plugin

```javascript
  var userNotes = Notes.init({
    parentModel: user,
    listElement: $('#notes-list'),
    createElement: $('#notes-create'),
    templates: viewTemplates, // optional
    createTemplate: createTemplate // optional
  })
```

### Using other Templates

The module uses 3 Mustache templates: one for viewing the notes, one for the
editing of the notes and other for the creation. Before you are able to render
the notes.

```javascript
  // Default templates
  var viewTemplates = {
    view: '<div class="note-view">' +
            '<div class="note-title"><strong>Note {{id}}</strong></div>' +
            '<div class="note-body">' +
              '<p class="note-data-text">{{text}}</p>' +
              '<button class="note-action-edit">edit</button>' +
              '<button class="note-action-destroy">destroy</button>' +
            '</div>' +
          '</div>',
    edit: '<div class="note-edit">' +
            '<div class="note-title"><strong>Note {{id}}</strong></div>' +
            '<div class="note-body">' +
              '<textarea class="note-data-text">{{text}}</textarea>' +
              '<button class="note-action-save">save</button>' +
              '<button class="note-action-cancel">cancel</button>' +
            '</div>' +
          '</div>'
  };
  var createTemplate = {
    create: '<div class="note-create">' +
              '<div class="note-body">' +
                '<textarea class="note-data-text" placeholder="{{text}}"></textarea>' +
                '<br/>' +
                '<button class="note-action-create">Add</button>' +
              '</div>' +
            '</div>'
  };
```

In order for the plugin to detect the clicking events and textarea fields
 the following selectors are used, so the those classes are required:

 - `.note-data-text` the edit and view text content elements
 - `.note-action-create` create a new note
 - `.note-action-edit` change to edit mode
 - `.note-action-save` save the changes on edit mode (and go to view mode)
 - `.note-action-cancel` cancel the changes on edit mode (and go to view mode)


### Listening to the Notes List View events:

There are 4 events that the list view emits:
- **'note:create'**: when a note is created with success
- **'note:destroy'**: when a note is deleted with success
- **'note:save'**: when a note is edited and update with success
- **'note:cancel'**: when the note editing is cancelled

```javascript
  // listening triggers
  userNotes.view.list.on('note:create', function() {
    console.log('note created');
  });
  userNotes.view.list.on('note:destroy', function() {
    console.log('note destroyed');
  });
  userNotes.view.list.on('note:cancel', function() {
    console.log('note cancelled');
  });
  userNotes.view.list.on('note:save', function() {
    console.log('note saved');
  });
```
