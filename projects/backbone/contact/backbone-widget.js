/*!
 * Copyright (c) 2012 Ben Olson (https://github.com/bseth99/)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 *
 */

(function( $, _, Backbone, undefined ) {

   var Widget = {};

   /**
   * Instead of always normalizing the input elements to match
   * other jQuery UI widgets, just mixin this object to add to
   * the render chain
   *
   */

   Widget.Base = {

      render: function () {

         this.$('input').not('.ui-widget').addClass('ui-corner-all ui-widget ui-widget-content ui-input-text');

         return this;
      }

   };


   /**
   * Mixin list behaviors for a view that provides
   * grid data entry for parent-child collections
   *
   */

   Widget.List = {};

   Widget.List.Base = {

      _listItems: null,
      _listIsSyncing: false,

      $listEl: null,

      /**
      * Main rendering
      *
      * Listen to the collection events to manage the list
      * the view in _listItems is responsible for adding/removing
      * from the collection.  This will raise the event to
      * synchronize the UI portion of the list.
      *
      */

      render: function () {

         this._listItems = {};

         this.$listEl = this.itemContainer ? this.$(this.itemContainer) : this.$el;


         this.listenTo( this.collection, 'sync reset', this.listSync );
         this.listenTo( this.collection, 'add', this.listAdd );
         this.listenTo( this.collection, 'remove', this.listRemove );

         this.listSync();

         return this;
      },

      /**
      * Configure the UI elements for a list
      *
      */

      listSetup: function () {

         this.$('button[action="add"]')
            .css('visibility', 'hidden')
            .last().css('visibility', 'visible');


         var $rms = this.$('button[action="remove"]');

         if ( $rms.length == 1 ) {
            $rms.css('visibility', 'hidden');
         } else {
            $rms.css('visibility', 'visible');
         }

         // Reset any lingering states
         this.$('.ui-state-hover').removeClass('ui-state-hover');
         this.$('.ui-state-focus').removeClass('ui-state-focus');

      },

      /**
      * Respond to collection resets or syncs and rebuid the list
      *
      */

      listSync: function () {

         var list = this.collection.models

         this._listIsSyncing = true;

         _.invoke( this._listItems, 'remove' );
         this._listItems = {};

         for ( var m in list )
            this.listAdd( list[m] );

         this._listIsSyncing = false;

         this.listSetup();

      },

      /**
      * Respond to collection add event by adding a new view to the list
      * and binding it to the model being added
      * @param {Object} model
      */

      listAdd: function ( model ) {

         var v;

         if ( !this._listItems[model.cid] ) {
            v = this._listItems[model.cid] = new this.itemView({ model: model });
            this.$listEl.append(v.render().$el);
         }

         if ( !this._listIsSyncing )
            this.listSetup();
      },

      /**
      * Respond to collection remove event by removing the view associated
      * to the model from the list
      * @param {Object} model
      */

      listRemove: function ( model ) {

         if ( this._listItems[model.cid] ) {
            this._listItems[model.cid].remove();
            delete this._listItems[model.cid];
         }

         if ( !this._listIsSyncing )
            this.listSetup();

      },

      /**
      * Enable/Disable
      * Common location to prevent normal list activities.  Default is to
      * just stop listening.  Override with custom behaviors.
      *
      */

      enable: function () {
         this.delegateEvents();
      },

      disable: function () {
         this.undelegateEvents();
      },

      /**
      * Chain onto Backbone.View.remove and ensure all the child views
      * in the list are removed.
      */

      remove: function () {

         _.invoke( this._listItems, 'remove' );

      }
   };

   /**
   * Extra behavior for lists that have records that can be
   * ordered.  An attribute is expected that can be bound to
   * and managed by this mixin
   *
   */

   Widget.List.Ordered = {

      orderAttr: 'order',
      orderItems: '> *',

      events: {
         'mouseover [action="order"]'           :  'handleSortHoverStart',
         'mouseout [action="order"]'            :  'handleSortHoverEnd',
         'sortupdate'                           :  'handleSortComplete',
      },

      handleSortHoverStart: function ( e ) { $(e.currentTarget).filter('.ui-widget').addClass('ui-state-hover'); },
      handleSortHoverEnd: function ( e ) { $(e.currentTarget).filter('.ui-widget').removeClass('ui-state-hover'); },

      /**
      * Respond to the Sortable's update event.
      *
      * Iterate over each view in the list and use its position relative to
      * its siblings to set the ordering attribute on the associated model
      *
      * This does not appear to trigger a resort on the collection so
      * explicitly do this so downstream processing is working with the
      * right order of the models.
      *
      */

      handleSortComplete: function () {

         var oatr = this.orderAttr;

         _.each( this._listItems, function ( v ) {
               v.model.set(oatr, v.$el.index());
            });

         this.collection.sort({silent: true});
         this.listSetup();
      },

      /**
      * Configure the UI.
      *
      * Show/hide the sort handle and ensure the Sortable
      * widget is initialized on the list.
      *
      */

      listSetup: function () {

         var $ods = this.$('[action="order"]');
/*
         if ( $ods.length == 1 ) {
            $ods.css('visibility', 'hidden');
         } else {
            $ods.css('visibility', 'visible');
         }
*/
         if ( $ods.length == 1 ) {
            if ( this.$listEl.data('ui-sortable') )
               this.$listEl.sortable('destroy');
         } else {
            this.$listEl.sortable({ containment: 'parent', handle: '[action="order"]', tolerance: 'pointer', items: this.orderItems });
         }

      },

      /**
      * Hook into the Widget.List.Base.listAdd function
      *
      * Initialize the order attribute for new rows
      *
      */

      listAdd: function ( model ) {

         model.set( this.orderAttr, model.collection.length-1, {silent: true} );

      },

      /**
      * Hook into the Widget.List.Base.listRemove function
      *
      * Ensure there are no gaps in the order attribute
      *
      */

      listRemove: function ( model ) {

         var oatr = this.orderAttr;

         model.collection.each(function ( m, i ) {
               m.set( oatr, i, {silent: true} );
            });
      },

      enable: function () {
         if ( this.$listEl.data('ui-sortable') )
            this.$listEl.sortable('enable');
      },

      disable: function () {
         if ( this.$listEl.data('ui-sortable') )
            this.$listEl.sortable('disable');
      }

   };


   /**
   * Extra behavior for lists that enables in-place editing and
   * expandable details.
   *
   */

   Widget.List.Actions = {

      actionViews: {},
      actionMode: 'list',
      actionRow: -1,
      actionCancel: 'html',

      listActionStart: function ( mode, row ) {

         var item = this.collection.at(row),
             $el = this._listItems[item.cid].$el;

         if ( !this.actionViews[mode] ) return;

         this.disable();

         this.actionMode = mode;
         this.actionRow = row;

         this._actionView = new (this.actionViews[mode])({ model: item });
         $dt = this._actionView.render().$el;

         $el.replaceWith( $dt );

         _.defer( function ( scope ) { $(scope.actionCancel).one('click', $.proxy( scope, 'listActionEnd' )) }, this );

         $dt.on('click', function( e ) { e.stopPropagation(); });

      },

      listActionEnd: function () {

         var idx = this.actionRow,
             item = this.collection.at(idx),
             $el = this._listItems[item.cid].render().$el;

         this._actionView.$el.replaceWith( $el );

         this.actionMode = 'list';
         this.actionRow = -1;

         this._actionView.remove();
         this._actionView = null;

         this.enable();

         this.listSetup();

      }

   };


   /**
   * Mixin to create hoverable zones.  Configuration enables hoverIntent and
   * immediate hover.
   *
   * Reads the hoverTargets hash on the view to determine which elements to
   * manage hovering.  Each hash key is a selector (use . for the container)
   * the value is another hash with configuration arguments:
   *
   *     intent { boolean } use hoverIntent plugin to delay hover toggle
   *     over { string } class to add when over the selected element(s)
   *     out  { string } class to add when not over the selected element(s).
   *                     This will be the initial class set on the element
   *                     after rendering is complete.
   *
   * Example:
   *
   *      hoverTargets: {
   *            '.'                              :   { intent: true, over: 'mx-border-hover',  out: 'mx-border-default' },
   *            'span[action="order"]'           :   { over: 'mx-icon-hover',    out: 'mx-icon-default' },
   *            'span[action="delete"]'          :   { over: 'mx-icon-hover',    out: 'mx-icon-default' },
   *            'span[action="more"]'            :   { over: 'mx-icon-hover',    out: 'mx-icon-default' }
   *         }
   */

   Widget.Hover = {

      disabled: false,

      render: function () {

         var that = this,
             cfg = { over: $.proxy( this, 'handleToggleHoverTargets' ), timeout: 0 };

         cfg.out = cfg.over;

         this.events = this.events || {};

         _(this.hoverTargets).each(function ( toggle, selector ) {

               cfg.selector = (selector == '.' ? '' : selector);

               if ( toggle.intent ) {
                  that.$el.hoverIntent(cfg);
               } else {
                  that.events['mouseenter ' + cfg.selector] = 'handleToggleHoverTargets';
                  that.events['mouseleave ' + cfg.selector] = 'handleToggleHoverTargets';
               }

               if ( toggle.out ) {
                  if ( selector == '.' )
                     that.$el.addClass( toggle.out );
                  else
                     that.$( selector ).addClass( toggle.out );
               }
            });

         this.delegateEvents();

      },

      enable: function () {
         this.disabled = false;
      },

      disable: function () {
         var that = this;

         this.disabled = true;

         _(this.hoverTargets).each(function ( toggle, selector ) {

               var $el = ( selector == '.' ? that.$el : that.$( selector ) );

               if ( toggle.over )
                  $el.removeClass( toggle.over ).addClass( toggle.out );

            });
      },

      handleToggleHoverTargets: function ( e ) {

         var selector = e.handleObj.selector || '.',
             toggle = this.hoverTargets[selector],
             $el = ( selector == '.' ? this.$el : this.$(selector) );

         if ( !toggle || this.disabled ) return;  // Not in the scope of this handler

         if ( e.type == 'mouseenter' )
            $el.removeClass( toggle.out ).addClass( toggle.over );
         else
            $el.removeClass( toggle.over ).addClass( toggle.out );

      }

   };


   /**
   * Basic list item which will attach add/delete buttons
   * to elements marked up with the correct attribute (action="add" and action="remove")
   *
   */

   Widget.List.Item = {

      render: function () {

         this.$('[action="add"]')
            .button({ icons: { primary: 'ui-icon-plus' }, text: false });

         this.$('[action="remove"]')
            .button({ icons: { primary: 'ui-icon-minus' }, text: false });

         return this;
      },

      events: {
         'click [action="add"]'    :  'handleActionAddClick',
         'click [action="remove"]' :  'handleActionRemoveClick'
      },

      handleActionAddClick: function ( e ) {
         this.model.collection.add([{}]);
      },

      handleActionRemoveClick: function ( e ) {
         this.model.destroy();
      }

   };

   /**
   * Publish the object and setup some base view objects
   * that can be further extended.
   *
   */

   Backbone.View.extend = Base.extend;

   Backbone.Widget = Widget;

   if ( Backbone.FormView )
      Backbone.FormView.mix([Backbone.Widget.Base]);

   // Convienence parent view.
   Backbone.ListView = Backbone.View.extend([Backbone.Widget.List.Base], {});

}(jQuery, _, Backbone));

