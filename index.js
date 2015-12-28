(function(root, main) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['backbone'],
      function(Backbone) {
        return main(Backbone);
      });
    // CommonJS
  } else if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
    module.exports = main(require('backbone'));
    // Globals
  } else {
    root.Notes = main(root.Backbone);
  }
})(this, function(Backbone) {
  'use strict';

  var Notes = Object.create(null);

  Notes.Model = Backbone.Model.extend({
    defaults: {
      text: ""
    },

    /**
     * Checks if the note text is a string
     * @return {Object} with the error name and message
     */
    validate: function(attrs, options) {
      if (typeof attrs.text !== 'string') {
        return {
          name: "Invalid parameter:",
          message: "The 'text' must be a string."
        };
      }
    }
  });

  /**
   * Collection of Notes associated with a parent Model
   */
  Notes.Collection = Backbone.Collection.extend({
    model: Notes.Model,
    // initialize parentModel and collection URL
    initialize: function(models, options) {
      this.parentModel = options.parentModel;
      this._url = options.url;
    },
    /**
     * Associate collection URL with the parent Model URL
     * @return {string | undefined}
     */
    url: function() {
      return this.parentModel ? this.parentModel.url() +
        (this._url || '/notes') : undefined;
    }
  });

  Notes.View = Backbone.View.extend({
    template: $('#noteTemplate').html(),
    events: {
      'click #delete': 'removeNote',
      'click #edit': 'editNote'
    },
    /**
     * Render note
     * @return {void}
     */
    render: function() {
      var tmpl = _.template(this.template);
      this.$el.html(tmpl(this.model.toJSON()));
      return this;
    },
    /**
     * Show prompt to allow note edition and save the update
     * @return {void}
     */
    editNote: function() {
      var newText = prompt("Please edit the note", this.model.get('text'));
      if (!newText) return; // don't do anything if cancel is pressed..
      this.model.set('text', newText);
      this.render();
      this.model.save();
    },
    /**
     * Remove the note
     * @return {void}
     */
    removeNote: function() {
      var self = this;
      this.model.destroy({
        success: function(model, response) {
          self.remove();
        }
      });
    }
  });

  Notes.CollectionView = Backbone.View.extend({
    el: $('#notes'),
    initialize: function(models, options) {
      var self = this;
      this.collection = new Notes.Collection([], {
        parentModel: options.parentModel,
        url: options.url
      });
      this.collection.fetch({
        success: function() {
          self.render();
        }
      });

      this.listenTo(this.collection, 'add', this.renderNode);
      this.listenTo(this.collection, 'reset', this.render);
    },
    events: {
      'click #add': 'addNote'
    },
    /**
     * Add note to the note collection
     * @return {void}
     */
    addNote: function() {
      var noteData = {},
        self = this;
      noteData['text'] = $('#text').val();
      this.collection.create(noteData, {
        wait: true, // waits for server to respond with 200 before adding newly
                    // created model to collection
        success: function() {
          self.renderNote();
        }
      });
    },
    /**
     * Render a note by creating a NoteView and appending the element
     * it renders to the collection element
     * @param  {Backbone.model}
     * @return {void}
     */
    renderNote: function(item) {
      var noteView = new Notes.View({
        model: item
      });
      this.$el.append(noteView.render().el);
    },
    /**
     * Render notes collection by rendering each note it contains
     * @return {void}
     */
    render: function() {
      this.collection.each(function(item) {
        this.renderNote(item);
      }, this);
    }
  });

  return Notes;
});
