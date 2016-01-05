# Backbone-Notes

Add notes to your Backbone Models and render them with Mustache Templates

## Requirements

- [backbonejs](http://backbonejs.org/)
- [mustache.js](https://github.com/janl/mustache.js)

## Instalation

- **Script Tag:** `<script type="text/javascript" src="https://github.com/Cloudoki/backbone-notes/blob/master/index.js"></script>`
- **Bower:** `bower install git://github.com/Cloudoki/backbone-notes.git`
- **npm:** `npm install github:Cloudoki/backbone-notes`

## Usage

You will need to provide 3 Mustache templates: one for viewing the notes, one for the editing of the notes and other for the creation. Before you are able to render the notes.

```javascript
  // Create the templates
  Notes.Templates = {
    view: '<div class="note-view">\
            <div class="note-title"><strong>Note {{id}}</strong></div>\
            <div class="note-body">\
              <p class="note-data-text">{{text}}</p>\
              <button class="note-action-edit">edit</button>\
              <button class="note-action-destroy">destroy</button>\
            </div>\
          </div>',
    edit: '<div class="note-edit">\
            <div class="note-title"><strong>Note {{id}}</strong></div>\
            <div class="note-body">\
              <textarea class="note-data-text">{{text}}</textarea>\
              <button class="note-action-save">save</button>\
              <button class="note-action-cancel">cancel</button>\
            </div>\
          </div>',
    create: '<div class="note-create">\
              <div class="note-body">\
                <textarea class="note-data-text"></textarea>\
                <br/>\
                <button class="note-action-create">Add</button>\
              </div>\
            </div>'
}
```

In order for the plugin to detect the clicking events and textarea fields you the following selectors are used, so the those classes are required:

 - `.note-data-text` the edit and view text content elements
 - `.note-action-create` create a new note
 - `.note-action-edit` change to edit mode
 - `.note-action-save` save the changes on edit mode (and go to view mode)
 - `.note-action-cancel` cancel the changes on edit mode (and go to view mode)


Start with the elements for the list and creation

```html
<div id="notes-create"></div>
<div id="notes-list"></div>
```

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

Now you will need to create the notes collection

```javascript
  var userNotesCollection = new Notes.Collection([], {
    // adding the notes parent
    parentModel: user,
    // relative URL to get notes from user's base url that is:
    // users/{user.id}/notes
    url: 'notes',
  });
```

With the notes collection you can initialize the notes list:

```javascript
  var userNotesList = new Notes.Views.List({
    // where to add the notes to
    el: $('#notes-list'),
    collection: userNotesCollection
  });
```

And you can fetch the notes from the server and render the Notes List

```javascript
  // fetch the notes and render them if successful
  userNotesCollection.fetch({
    success: function() {
      userNotesList.render();
    }
  });
```

And you can initialize and render the view for the notes creation associated with the userNotesList view

```javascript
  var userNotesCreate = new Notes.Views.Create({
    // where to create the notes
    el: $('#notes-create'),
    viewList: userNotesList
  });
  userNotesCreate.render();
```

### Listening to the Notes List View events:

There are 4 events that the CollectionView emits:
- **'note:create'**: when a note is created with success
- **'note:destroy'**: when a note is deleted with success
- **'note:save'**: when a note is edited and update with success
- **'note:cancel'**: when the note editing is cancelled

```javascript
  // listening triggers
  userNotesList.on('note:create', function() {
    console.log('note created');
  });
  userNotesList.on('note:destroy', function() {
    console.log('note destroyed');
  });
  userNotesList.on('note:cancel', function() {
    console.log('note cancelled');
  });
  userNotesList.on('note:save', function() {
    console.log('note saved');
  });
```
