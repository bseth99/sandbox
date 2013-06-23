/*
 * Copyright (c) 2013 Ben Olson (https://github.com/bseth99/)
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
 * Dependancies: jquery, jquery-ui
 *
 */

(function( $, undefined ) {

   $.widget( "bk.simpletabs", {

         options: {

            forceHash: false,

            // callbacks
            activate: null,
            beforeActivate: null
         },

         /**
         *  Setup the widget.  A large chunk recreates jQuery UI buttons since those
         *  widgets don't behave exactly how we need them to for tabs.
         *
         */
         _create: function () {

            this.element.addClass('bk-tabs ui-widget ui-widget-content ui-corner-all');

            this.tabs = this.element.find( 'li' );
            this.panels = this.element.find( 'div' );

            this.element.find('ul')
               .addClass( 'bk-tabs-nav ui-corner-top' )
               .find('a')
                  .addClass( 'ui-button ui-widget ui-state-default ui-button-text-only ui-corner-top' )
                  .each(function () {
                        var $button = $( this );
                        $( '<span>' )
                           .addClass( 'ui-button-text' )
                           .text( $button.text() )
                           .appendTo( $button.empty() )
                     })
                  .eq(0)
                     .addClass( 'ui-state-active' );

            this.panels
               .addClass( 'bk-tabs-panel ui-widget-content' )
               .hide()
               .eq(0)
               .show();

            this.active( location.hash.slice(1) );

            this._on( this.events );
         },

         _destroy: function() {

            this.element.removeClass('bk-tabs ui-widget ui-widget-content ui-corner-all');
            this.element.find('ul').removeClass( 'bk-tabs-nav ui-corner-top' );
            this.panels.removeClass('bk-tabs-panel ui-widget-content');

            this.tabs.find('a')
               .removeClass('ui-button ui-widget ui-state-default ui-button-text-only ui-corner-top')
               .each(function () {
                     var $a = $(this);
                     $a.text($a.children().text());
                  });

            this.panels.show();
         },

         /**
         *  Listen for clicks, trigger events, and use active to change the tab
         *
         */
         events: {
            'click li > a' : function ( event ) {

               var idx = $( event.currentTarget ).closest( 'li' ).index(),

                   oTab = this._getTabInfo(),
                   nTab = this._getTabInfo( idx ),

                   // Make normalized objects for the tab we're leaving
                   // and the tab we're changing to
                   eventData = {
                      oldTab: oTab.tab,
                      oldPanel: oTab.panel,
                      newTab: nTab.tab,
                      newPanel: nTab.panel
                   };

               // Provide a way to cancel it
               if ( oTab.tab.index != nTab.tab.index && this._trigger( 'beforeActivate', event, eventData ) !== false ) {

                  // Use the setting to change the tab
                  this.active( idx );
                  this._trigger( 'activate', event, nTab );
               } else {
                  event.preventDefault();
               }

            },

            'mouseenter li > a' : function( event ) {
               $( event.currentTarget ).addClass( 'ui-state-hover' );
            },

            'mouseleave li > a' : function( event ) {
               $( event.currentTarget ).removeClass( 'ui-state-hover' );
            }
         },

         /**
         *  Get/Set the current tab.  Accepts the index or string match the hash (less #)
         *
         */
         active: function ( tab ) {

            var idx, hash;

            if ( arguments.length > 0 ) {

               idx = 0;

               // Resolve the argument type and find the tab
               if ( typeof(tab) == 'string' && tab.length > 0 ) {
                  idx = this.tabs.index( this.tabs.find( '[href=#'+tab+']' ).closest( 'li' ) );
               } else if ( typeof(tab) == 'number' && tab >= 0 ) {
                  idx = tab;
               }

               idx = idx < 0 ? 0 : idx;

               hash =
                  this.tabs.find( 'a' )
                     .removeClass( 'ui-state-active' )
                     .eq(idx)
                     .addClass( 'ui-state-active' )
                     .attr( 'href' );

               this.panels.hide().eq(idx).show();

               if ( this.options.forceHash ) {

                  if ( location.hash.length == 0 )
                     location.href += hash;
                  else if ( location.hash != hash )
                     location.href = location.href.replace( /#.*$/, hash );

               }


            } else {

               return this._getTabInfo();

            }
         },

         /**
         *  Assemble tab info object from the provided index
         *
         */
         _getTabInfo: function ( idx ) {

            var idx = arguments.length > 0 ? idx : this.tabs.find( 'a.ui-state-active' ).closest( 'li' ).index(),
                tab = this.tabs.eq( idx ).find( 'a' );

            return {
               tab: { index: idx, hash: tab.attr( 'href' ).slice(1), label: tab.text() },
               panel: this.panels.eq( idx )
            }
         }

      });

})( jQuery );