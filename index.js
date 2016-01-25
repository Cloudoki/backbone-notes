(function (root, main) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'mustache', 'underscore'],
      function (Backbone, Mustache, _) {
        return main(Backbone, Mustache, _);
      });
  // CommonJS
  } else if (typeof module === 'object' && module.exports && require) {
    module.exports = main(require('backbone'), require('mustache'), require('underscore'));
  // Globals
  } else {
    /* eslint-disable no-param-reassign */
    root.Notes = main(root.Backbone, root.Mustache, root._);
    /* eslint-enable no-param-reassign */
  }
})(this, function (Backbone, Mustache, _) {
  'use strict';
  // Base Plugin Object without prototype
  var Notes = Object.create(null);

  /**
   * Base Notes model exposed on the Notes Object to be easily replaced
   */
  Notes.Model = Backbone.Model.extend({
    defaults: {
      text: ''
    }
  });

  // Notes Store as Backbone Collection
  Notes.Collection = Backbone.Collection.extend({
    model: Notes.Model,
    /**
     * Initialization of Collection of Notes associated with a parent Model
     * @param {array | Backbone.Model} models
     * @param {object} options
     * @param {Backbone.Model} options.parentModel
     * @param {string} options.url
     */
    initialize: function (models, options) {
      this.parentModel = options.parentModel;
      this._url = options.url;
    },
    /**
     * Associated collection URL with the parent Model URL
     * @return {string | undefined}
     */
    url: function () {
      return this.parentModel ? this.parentModel.url() + '/' +
        (this._url || 'notes') : (this._url || 'notes');
    }
  });

  Notes.Templates = {
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
          '</div>',
    create: '<div class="note-create">' +
              '<div class="note-body">' +
                '<textarea class="note-data-text" placeholder="{{text}}"></textarea>' +
                '<br/>' +
                '<button class="note-action-create">Add</button>' +
              '</div>' +
            '</div>'
  };

  Notes.Views = Object.create(null);

  /**
   * Single Note view with edit mode and view mode
   *
   * @borrows Notes.Templates.view  mustache template for the view mode
   * @borrows Notes.Templates.edit  mustache template for the edit mode
   *
   * @listens {.note-action-destroy#click} triggers destroy method
   * @listens {.note-action-save#click} triggers save method
   * @listens {.note-action-cancel#click} triggers cancel methods
   *
   * @param {object} options Backbone.View options
   *                         {@link http://backbonejs.org/#View-constructor}
   * @param {object} options.model  this view expects an model
   * @param {object} options.save   options used on the Notes.Model.save method
   *                                {@link http://backbonejs.org/#Model-save}
   * @param {object} options.destroy  options used on the Notes.Model.destroy
   *                                  {@link http://backbonejs.org/#Model-destroy}
   * @returns {Backbone.View}
   */
  Notes.Views.Note = Backbone.View.extend({
    events: {
      'click .note-action-destroy': 'destroy',
      'click .note-action-edit': 'edit',
      'click .note-action-save': 'save',
      'click .note-action-cancel': 'cancel'
    },
    initialize: function (options) {
      var self = this;
      self.options = _.cloneDeep(options) || {};
      this.templates = options.templates;

      // Sets the self.options.save to have a always success property that
      //  will call the save.success if it was provided and
      //  options.destroy.wait is true by default
      self.options.save = _.defaults({
        // on successfull save
        success: function (model) {
          // renders this note to view mode
          self.render();
          /**
           * Indicates that the note was saved
           * @event Notes.Views.Note#note:save
           * @type {Notes.Model}
           */
          self.trigger('note:save', model);

          // if options.save.success was provided call it also
          if (options.save && options.save.success) {
            options.save.success.apply(this, arguments);
          }
        }
      }, options.save, {
        wait: true
      });

      // Sets the self.options.destroy to have a always success property that
      //  will call the destroy.success if it was provided and
      //  options.destroy.wait is true by default
      self.options.destroy = _.defaults({
        success: function (model) {
          self.remove();
          /**
           * Indicates that the note was destroyed
           * @event Notes.Views.Note#note:destroy
           * @type {Notes.Model}
           */
          self.trigger('note:destroy', model);

          // if options.destroy.success was provided call it also
          if (options.destroy && options.destroy.success) {
            options.destroy.success.apply(this, arguments);
          }
        }
      }, options.destroy, {
        wait: true
      });
    },
    /**
     * Render note with view template by default
     *
     * @borrows Notes.Templates.View
     * @param {Mustache.template} template
     * @returns {Notes.Views.Note}
     */
    render: function (tmpl) {
      var template = tmpl || this.templates.view;
      this.$el.html(Mustache.render(template, this.model.toJSON()));
      return this;
    },
    /**
     * Renders the note with the edit template (edit mode) and focus given to
     *   .note-data-text. Saves the current model text to this.oldText be able to
     *   cancel changes
     *
     * @borrows Notes.Templates.edit
     */
    edit: function () {
      this.oldText = this.model.get('text');
      this.render(this.templates.edit);
      this.$('.note-data-text').focus();
    },
    /**
     * Update the model if '.note-text' element's value changed compared
     * this.oldText and re-renders to view mode
     *
     * @fires Notes.Views.Note#note:save
     */
    save: function () {
      var newText = this.$('.note-data-text').val();
      if (newText !== this.oldText) {
        this.model.set('text', newText);
        this.model.save(null, this.options.save);
      }
    },
    /**
     * Cancel edit mode and set the text to this.oldText that was set when
     *   changed from view to edit mode
     *
     * @fires Notes.Views.Note#note:cancel
     */
    cancel: function () {
      this.model.set('text', this.oldText);
      this.render();
      /**
       * Indicates that the note edition was cancel
       * @event Notes.View#note:cancel
       * @type {Notes.Model}
       */
      this.trigger('note:cancel', this.model);
    },
    /**
     * Destroys the note model and removes the view
     *
     * @fires Notes.View#note:destroy
     */
    destroy: function () {
      this.model.destroy(this.options.destroy);
    }
  });
  /**
   * Notes list view, nested view of a collection of NoteViews
   *
   * @param {object} options Backbone.View options
   *                         {@link http://backbonejs.org/#View-constructor}
   * @param {Notes.Collection} options.collection
   *
   * @returns {Backbone.View}
   */
  Notes.Views.List = Backbone.View.extend({
    initialize: function (options) {
      var self = this;
      self.options = options || {};
      this.collection = options.collection;
      this.templates = options.templates || {
        view: Notes.Templates.view,
        edit: Notes.Templates.edit
      };
    },

    /**
     * Render a note by creating a NoteView and appending the element
     * it renders to the collection element and setups listeners to the NoteView
     * events that are propagated to the collection
     *
     * @param  {Backbone.model}
     */
    renderNote: function (item) {
      var self = this;
      var noteView = new Notes.Views.Note({
        model: item,
        templates: this.templates
      });
      // get events triggered from note view and propagate them
      noteView.on('note:destroy', function (model) {
        self.collection.remove(noteView.model);
        self.trigger('note:destroy', model);
      });
      noteView.on('note:cancel', function (model) {
        self.trigger('note:cancel', model);
      });
      noteView.on('note:save', function (model) {
        self.trigger('note:save', model);
      });
      this.$el.append(noteView.render().el);
    },
    /**
     * Renders the element with create template and appends to all the
     * notes in the collection which are also rendered
     *
     * @borrows Notes.Templates.create
     */
    render: function () {
      this.collection.each(function (item) {
        this.renderNote(item);
      }, this);
    }
  });
  /**
   * Creatition view for the creation of notes
   *
   * @borrows Notes.Templates.create  mustache template for the creation
   *
   * @listens {.node-action-create#click} triggers create method
   *
   * @param {object} options Backbone.View options
   *                         {@link http://backbonejs.org/#View-constructor}
   * @param {Notes.Views.List} options.list
   * @param {object} options.data
   * @param {object} options.create options used on the Notes.Collection.create
   *                                {@link http://backbonejs.org/#Collection-create}
   */
  Notes.Views.Create = Backbone.View.extend({
    events: {
      'click .note-action-create': 'create'
    },
    initialize: function (options) {
      var self = this;
      this.options = options || {};
      this.template = options.template || {
        create: Notes.Templates.create
      };
      this.options.data = _.defaults(options.data || {}, {
        text: 'insert note text here'
      });
      this.viewList = options.viewList;
      // sets the self.options.create to have a always success property that
      //  will call the create.success if it was provided and
      //  options.create.wait is true by default
      this.options.create = _.defaults({
        success: function (model) {
          self.viewList.renderNote(model);
          /**
           * Indicates that the note was created
           * @event Notes.Views.Note#note:create
           * @type {Notes.Model}
           */
          self.viewList.trigger('note:create', model);

          // if options.destroy.success was provided call it also
          if (options.create && options.create.success) {
            options.create.success.apply(this, arguments);
          }
        }
      }, options.create, {
        wait: true
      });
    },
    /**
     * Add note to the note collection with text as the value of the element
     *  retrived with selector '.note-data-text'
     */
    create: function () {
      this.viewList.collection.create({
        text: this.$('.note-data-text').val()
      }, this.options.create);
    },
    /**
     * Renders the element with create template and appends to all the
     * notes in the collection which are also rendered
     *
     * @borrows Notes.Templates.create
     */
    render: function (template) {
      this.$el.html(Mustache.render(template || this.template.create,
        this.options.data));
    }
  });
  /**
   * Initializes the a Notes.Collection and the corresponding
   *   list and create view
   * @param {object} options
   * @param {Backbone.Model} options.parentModel
   * @param {string} options.url - (default: 'notes')
   * @param {DOM.Element | object | string} options.listElement - element
   *                       associated with the list view
   *                       {@link http://backbonejs.org/#View-el}
   * @param {DOM.Element | object | string} options.createElement - element
   *                       associated with the create view
   *                       {@link http://backbonejs.org/#View-el)
   * @param {boolean} options.fetch - if true fetchs the Notes.Collection and
   *                                 will render the new list if options.render
   *                                 (default: true)
   * @param {boolean} options.render - if true renders the generated views
   *                                 (default: true)
   * @return {object} instance - returns an instance object with the collection
   *                             and views
   */
  Notes.init = function (options) {
    var opts = _.defaults(options, {
      render: true,
      fetch: true
    });

    var instance = {
      view: {}
    };

    instance.collection = new Notes.Collection([], {
      parentModel: options.parentModel,
      url: options.url,
    });

    if (opts.listElement) {
      instance.view.list = new Notes.Views.List({
        el: opts.listElement,
        collection: instance.collection,
        templates: opts.templates
      });
    }

    if (instance.view.list && opts.createElement) {
      instance.view.create = new Notes.Views.Create({
        el: opts.createElement,
        viewList: instance.view.list,
        template: opts.createTemplate
      });
    }

    if (opts.fetch) {
      instance.collection.fetch({
        success: function () {
          if (instance.view.list && opts.render) {
            instance.view.list.render();
          }
        }
      });
    }

    if (opts.render) {
      if (instance.view.list) instance.view.list.render();
      if (instance.view.create) instance.view.create.render();
    }

    return instance;
  };
  return Notes;
});
