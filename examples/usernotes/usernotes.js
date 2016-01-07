(function(Backbone, Mustache, _, $, Notes) {
  'use strict';

  // setting the required notes templates
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
                <textarea class="note-data-text" placeholder="{{text}}"></textarea>\
                <br/>\
                <button class="note-action-create">Add</button>\
              </div>\
            </div>'
  };
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

  var userNotes = Notes.init({
    parentModel: user,
    listElement: $('#notes-list'),
    createElement: $('#notes-create'),
  })

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

})(Backbone, Mustache, _, $, Notes);
