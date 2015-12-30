(function(root, main) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'mustache'],
      function(Backbone, Mustache) {
        return main(Backbone, Mustache);
      });
    // CommonJS
  } else if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
    module.exports = main(require('backbone'), require('mustache'));
    // Globals
  } else {
    root.Notes = main(root.Backbone, root.Mustache);
  }
})(this, function(Backbone, Mustache) {
  'use strict';

  var Notes = Object.create(null);

  Notes.Model = Backbone.Model.extend({
    defaults: {
      text: ""
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

  Notes.ViewTemplate = {
    template: "<h2>Please add a view template to show here.</h2>",
    /**
     * Set the mustache template for the note view
     * @param {string} tmpl mustache template
     * @return {void}
     */
    setTemplate: function(tmpl) {
      this.template = tmpl || this.template;
    },
    /**
     * Get the mustache template for note view
     * @return {string} mustache template
     */
    getTemplate: function() {
      return this.template;
    }
  };

  Notes.EditTemplate = {
    template: "<h2>Please add a edit template to show here.</h2>",
    /**
     * Set the mustache template for the note editing
     * @param {string} tmpl mustache template
     * @return {void}
     */
    setTemplate: function(tmpl) {
      this.template = tmpl || this.template;
    },
    /**
     * Get the mustache template for note editing
     * @return {string} mustache template
     */
    getTemplate: function() {
      return this.template;
    }
  };

  Notes.View = Backbone.View.extend({
    editElement: '#editnote',
    oldText: '',
    events: {
      'click #delete': 'removeNote',
      'click #edit': 'editNote',
      'click #update': 'updateNote',
      'click #cancel': 'cancelEdit'
    },
    /**
     * Set the element for the editing
     * @param  {object} options Object with need parameters such as editElement
     * @return {void}
     */
    initialize: function(options) {
      this.editElement = options.editElement || this.editElement;
    },
    /**
     * Render note
     * @return {void}
     */
    render: function(tmpl) {
      var tmpl = tmpl || Notes.ViewTemplate.getTemplate();
      this.$el.html(Mustache.render(tmpl, this.model.toJSON()));
      return this;
    },
    /**
     * Show editing view to allow note edition
     * @return {void}
     */
    editNote: function() {
      this.oldText = this.model.get('text');
      this.render(Notes.EditTemplate.getTemplate());
      $(this.editElement).focus();
    },
    /**
     * Update the model if edited and save
     * @return {void}
     */
    updateNote: function() {
      var self = this;
      var newText = $(this.editElement).val();
      if (newText !== this.oldText) {
        this.model.set('text', newText);
        this.model.save({
          wait: true,
          success: function(model, response) {
            self.render();
            self.trigger('note:saved');
          }
        });
      }
    },
    /**
     * Cancel edit mode
     * @return {void}
     */
    cancelEdit: function() {
      this.model.set('text', this.oldText);
      this.render();
      this.trigger('note:aborted');
    },
    /**
     * Remove the note
     * @return {void}
     */
    removeNote: function() {
      var self = this;
      this.model.destroy({
        wait: true,
        success: function(model, response) {
          self.remove();
          self.trigger('note:deleted');
        }
      });
    }
  });

  Notes.CollectionView = Backbone.View.extend({
    el: 'body',
    editElement: '#editnote',
    initialize: function(options) {
      var self = this;
      this.editElement = options.editElement || this.editElement;
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
    /**
     * Add note to the note collection
     * @return {void}
     */
    addNote: function(txt) {
      var self = this;
      var noteData = {};
      noteData['text'] = txt;
      this.collection.create(noteData, {
        wait: true, // waits for server to respond with 200 before adding newly
        // created model to collection
        success: function() {
          self.renderNote();
          self.trigger('note:created');
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
      var self = this;
      var noteView = new Notes.View({
        model: item,
        editElement: this.editElement
      });
      // get events triggered from note view and propagate them
      noteView.on('note:deleted', function() {
        self.collection.remove(noteView.model);
        self.trigger('note:deleted');
      });
      noteView.on('note:aborted', function() {
        self.trigger('note:aborted')
      });
      noteView.on('note:saved', function() {
        self.trigger('note:saved')
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
