(function(Backbone, Notes) {
    'use strict';

    console.log('NOTES TEST');

    var User = Backbone.Model.extend({
        defaults: {
            name: 'unnamed'
        },
        urlRoot: '/users'
    });

    var user = new User({
        id: 1,
        name: 'John Doe'
    });

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

})(Backbone, Notes);
