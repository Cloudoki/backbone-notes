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

  return Notes;
});
