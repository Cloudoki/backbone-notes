(function(Backbone, Mustache, Notes) {
  'use strict';

  console.log('NOTES TEST');

  // Creating a model to be the notes parent
  var User = Backbone.Model.extend({
    defaults: {
      name: 'unnamed user'
    },
    urlRoot: '/users' // the model must have a urlRoot assigned
  });
  var user = new User({
    id: 1,
    name: 'John Doe'
  });

  var userNotes = new Notes.CollectionView({
    el: $('#notes'), // where to add the notes to
    parentModel: user, // adding the notes parent
    url: '/mynotes', // URL to get notes from
    editElement: '#editElement', // the element id/class to get the edited text from
  });

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

  // add note when button `Add Note` is pressed
  $('#add').click(function() {
    userNotes.addNote($('#textElement').val());
  });

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
  /*
    // Notes collection test
    var userNotes = new Notes.Collection([], {
        parentModel: user,
        // url: '/mynotes' // custom URL
    });

    userNotes.fetch();
    // GET /users/1/(notes or custom URL), may show Error 404

    console.log('Fetch URL -', userNotes.url());
    // should show in console -> Fetch URL - /users/1/(notes or custom URL)

    // add note to user
    userNotes.add({
        text: 'This is a new note'
    });
    userNotes.at(0).save();
    // POST to endpoint /users/1/(notes or custom URL), may show Error 501

   // edit user note
    userNotes.set({
        id: '2',
        text: 'Note edited'
    });
    userNotes.at(0).save();
    // PUT to endpoint /users/1/(note or custom URL)/2, may show Error 501

    console.log('save URL -', userNotes.at(0).url());
    // should show in console -> save URL - /users/1/(notes or custom URL)/2

    // delete user note
    userNotes.at(0).destroy();
    // DELETE to endpoint /users/1/(notes or custom URL)/2, may show Error 501

    // console.log('Notes -', userNotes);
    */

})(Backbone, Mustache, Notes);
