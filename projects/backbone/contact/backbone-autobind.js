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


   /**
   *
   *  The base autobind functionality defines selectors used to find
   *  elements to bind to and how to move values in and out of the
   *  element.
   *
   *  Elements are bound based on a containing element with a "bind"
   *  attribute.  This should correspond to an attribute in the model
   *  being bound.  The selector will find elements inside the container
   *  and then find the closest parent with a bind attribute. The containing
   *  tag does not matter as long as its a parent of the element that will
   *  match the selector that defines the binding.
   *
   *  Each "binder" contains a selector, events to listen
   *  to and get/set methods.  Binders are checked in the order of the
   *  AutoBind.Binders array.  This means that if more than one element
   *  is present inside a container that might match a selector, the
   *  first element to match will be the one bound based on the defined
   *  selector and all other will be ignored.  This implies that more specific
   *  selectors should be first in the array (like jQuery UI widgets)
   *  followed by less specific selectors (like input/select).
   *
   *  Additionally, if a container has several matching elements, all of
   *  them will be bound to the same value.  This means that each container
   *  should be limited to one target element for the binding to avoid
   *  odd side-effects.
   *
   */

   var AutoBind = {};

   AutoBind.Binders = [
      {
         select: ':ui-slider',
         events: ['slidechange', 'slide'],
         set: function($el, val) { $el.slider('value', val); },
         get: function($el) { return $el.slider('value'); }
      },
      {
         select: ':ui-combobox',
         events: ['comboboxselect'],
         set: function($el, val) { $el.combobox('value', val); },
         get: function($el) { return $el.combobox('value'); }
      },
      {
         select: ':ui-buttonset',
         events: ['change'],
         set: function($el, val) {

            $el.find('input').removeProp('checked').filter('[value="'+val+'"]').prop('checked', true);
            $el.buttonset('refresh');

         },
         get: function($el) { return $el.find(':checked').val(); }
      },
      {
         select: 'select',
         events: ['change'],
         set: function($el, val) { $el.find('option').removeProp('selected').filter('[value="'+val+'"]').prop('selected', true); },
         get: function($el) { return $el.children(':selected').val(); }
      },
      {
         select: 'input[type="text"]',
         events: ['keyup', 'change', 'paste', 'cut', 'blur'],
         set: function($el, val) { $el.val(val); },
         get: function($el) { return $el.val(); }
      },
      {
         select: 'span',
         events: [],
         set: function($el, val) { $el.html(val); },
         get: function($el) { return ''; }
      }
   ];

   var bindingHelpers = {};

   AutoBind.registerBindingHelper = function ( name, funcs ) {
      bindingHelpers[name] = funcs;
   };

   AutoBind.Base = {

      _bindingBlock: false,

      render: function () {

         this.bindings = this.bindings || {};
         this.setupBindings();

         return this;
      },

      setupBindings: function () {

         var attr = _.keys(this.model.attributes),
             bound = [],
             that = this;

         if (!this.events)
            this.events = {};

         this.stopListening(this.model);

         _.each(AutoBind.Binders, function ( b ) {
               var $els = that.$(b.select);

               $els.each(function () {
                     var $me = $(this),
                         $bn = $me.is('[bind]') ? $me : $me.closest('[bind]'),
                         bind;

                     // Found a parent with attribute bind and
                     // the bind attribute is in the model and
                     // its not already bound
                     if ( $bn && (bind = $bn.attr('bind')) && $.inArray(bind, attr) > -1 && $.inArray(bind, bound) == -1 ) {

                        if ( !that.bindings[bind]) that.bindings[bind] = {};

                        that.bindings[bind].select = b.select;
                        that.bindings[bind].get = b.get;
                        that.bindings[bind].set = b.set;

                        _.each(b.events, function (event) {
                              that.events[event + ' [bind="'+bind+'"]'] = 'handleBindingEvent';
                           });

                        that.listenTo(that.model, 'change:'+bind, function () { that.getBinding.call(that, bind); });

                        bound.push(bind);
                     }
                  });
            });

         this.delegateEvents();

         if (_.isFunction(this.finalizeBindingSetup)) this.finalizeBindingSetup();
      },

      handleBindingEvent: function ( e ) {

         var $f = $(e.currentTarget),
             bind = $f.attr('bind'),
             group;

         if ( bind )
            this.setBinding( bind );

         if ( this.bindingGroups && this.bindings[bind].group ) {
            group = _.clone( this.bindingGroups[ this.bindings[bind].group ] );
            group.splice( group.indexOf( bind ), 1 );

            for ( var i=0;i<group.length;i++ ) {
               this.setBinding( group[i] );
            }
         }
      },

      setBinding: function ( bind ) {

         var desc = this.bindings[bind],
             $f = this.$('[bind="'+bind+'"]'),
             $v = $f.find(desc.select),
             val, abort, len, i, helper, pipe,
             ui;

         this._bindingBlock = bind;

         if (desc && desc.get && $v) {
            abort = false;
            val = desc.get($v);

            if ( desc.helpers ) {
               len = desc.helpers.length;
               for ( i=0;i<len;i++ ) {

                  pipe = _.flatten(_.pairs(desc.helpers[i]), true);
                  helper = bindingHelpers[pipe[0]];

                  if ( helper && helper.set ) {
                     ui = { $el: $f, bind: bind, value: val, helper: pipe[1] };
                     if ( (val = helper.set.call(this, ui)) === false ) {
                        abort = true;
                        break;
                     }
                  }
               }
            }

            if ( !abort )
               this.model.set(bind, val);
         }

         this._bindingBlock = false;

      },

      getBinding: function ( bind ) {

         if (this._bindingBlock == bind) return;

         var desc = this.bindings[bind],
             $f = this.$('[bind="'+bind+'"]'),
             $v = $f.find(desc.select),
             val, abort, len, i, helper, pipe,
             ui;

         if (desc && desc.get && $v) {
            abort = false;
            val = this.model.get(bind);

            if ( desc.helpers ) {
               len = desc.helpers.length;
               for ( i=len;i>=0;i-- ) {

                  pipe = _.flatten(_.pairs(desc.helpers[i]), true);
                  helper = bindingHelpers[pipe[0]];

                  if ( helper && helper.get ) {
                     ui = { $el: $f, bind: bind, value: val, helper: pipe[1] };
                     if ( (val = helper.get.call(this, ui)) === false ) {
                        abort = true;
                        break;
                     }
                  }
               }
            }

            if ( !abort )
               desc.set($v, val);
         }

      },

      getAllBindings: function () {

         for ( var b in this.bindings )
            this.getBinding(b);

      },

      setAllBindings: function () {

         for ( var b in this.bindings )
            this.setBinding(b);

      }

   };

   /**
   *
   *  Bi-directional formatting of values from the model and back
   *  Enables converting from internal representations of a value
   *  to a user readable value either for display or editing
   *
   *  Assume dates are stored in milliseconds from epoch
   *  Use MomentJS to convert back-and-forth
   *
   */

   AutoBind.Formatters = {

      date: {
            format: function ( val ) { return val ? moment(val).format('MM/DD/YYYY') : val; },

            unformat: function ( val ) {
               var m;

               if ( val === null || val.length == 0 ) {
                  val = '';
               }
               else {
                  m = moment(val, 'MM/DD/YYYY');
                  val = m.isValid() ? m.valueOf() : false;
               }


               return val;
            }
         }
   }

   AutoBind.registerBindingHelper('format', {

      set: function ( ui ) {

         var val = ui.value;

         if ( _.isObject(ui.helper) ) {
            val = ui.helper.unformat(val);
         } else if ( typeof(ui.helper) == 'string' && AutoBind.Formatters[ui.helper] ) {
            val = AutoBind.Formatters[ui.helper].unformat(val);
         }

         return val;
      },

      get: function ( ui ) {

         var val = ui.value;

         if ( _.isObject(ui.helper) ) {
            val = ui.helper.format(val);
         } else if ( typeof(ui.helper) == 'string' && AutoBind.Formatters[ui.helper] ) {
            val = AutoBind.Formatters[ui.helper].format(val);
         }

         return val;
      }

   });


   /**
   *
   *  Live validation of user input.  Only interacts with view-to-model
   *  pipeline.  Built-in handling of augmenting DOM with classes and
   *  appending messages.  The error messages can be styled to meet your needs.
   *
   */

   AutoBind.Validators = {

      phone:    {
            test: function ( val ) { return (val === null || val.length == 0 || (/^\(([0-9]{3})\) ([0-9]{3})\-([0-9]{4})$/.test(val))); },
            message: 'Enter a valid phone number'
         },

      email:    {
            test: function ( val ) { return (val === null || val.length == 0 || (/^(?:[^,]+@[^,/]+\.[^,/]+|)$/.test(val))); },
            message: 'Enter a valid email'
         },

      date:     {
            test: function ( val ) { return (val === null || val.length == 0 || (/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/.test(val) && moment(val, 'MM/DD/YYYY').isValid()) ); },
            message: 'Enter a valid date'
         },

      required: {
            test: function ( val ) { return !(val === null || val.length == 0); },
            message: 'Please enter a value'
         }

   };

   AutoBind.registerBindingHelper('validate', {

      set: function ( ui ) {

         var t = true, fn, run, cmd,
             val = ui.value;

         run = _.isArray(ui.helper) ? _.clone(ui.helper) : [ ui.helper ];

         while ( run.length > 0 && t ) {

            cmd = run.shift();
            if ( typeof(cmd) == 'string' && AutoBind.Validators[cmd] ) {
               cmd = AutoBind.Validators[cmd];
            }

            fn = cmd.test;
            if ( fn ) {
               if ( _.isRegExp(fn) ) {
                  t = fn.test(val);
               } else {
                  t = fn.call(this, val);
               }
            }
         }

         // Default handling
         ui.$el.removeClass('invalid valid');
         ui.$el.children('.message').remove();

         if ( ui.$el.find('input').is(":focus") ) {
            if (t) {
               ui.$el.addClass('valid');
            } else {
               ui.$el.addClass('invalid');
            }
         } else {
            if (!t) {
               ui.$el.addClass('invalid');
               $('<div class="message"><span>'+cmd.message+'</span></div>').appendTo(ui.$el).show();
            }
         }

         return (t ? val : false);
      }

   });

   Backbone.AutoBind = AutoBind;

   Backbone.View.extend = Base.extend;

   // Convienence parent view.
   Backbone.FormView = Backbone.View.extend([Backbone.AutoBind.Base], {});

}(jQuery, _, Backbone));

