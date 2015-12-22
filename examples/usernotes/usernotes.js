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
        //url: '/mynotes' // custom URL
    });

    //console.log('Before fetch -', userNotes);

    userNotes.fetch();

    //console.log('After fetch all -', userNotes);

    console.log('Fetch URL -', userNotes.url());

    // add note to user
    userNotes.add({
        text: 'This is a new note'
    });
    userNotes.at(0).save();


    // edit user note
    userNotes.set({
        id: "1",
        text: "Note edited"
    });
    userNotes.at(0).save();

    // delete user note
    userNotes.at(0).destroy();

    console.log('save URL -', userNotes.at(0).url());

    console.log('Notes -', userNotes);

})(Backbone, Notes);
