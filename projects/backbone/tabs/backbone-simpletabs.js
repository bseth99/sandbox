(function( $, undefined ) {

   $.widget( "bk.simpletabs", {

         options: {

            forceHash: true,

            // callbacks
            activate: null,
            beforeActivate: null
         },

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

         events: {
            'click li' : function ( event ) {

               var idx = $( event.currentTarget ).index(),

                   oTab = this._getTabInfo(),
                   nTab = this._getTabInfo( idx ),

                   eventData = {
                      oldTab: oTab.tab,
                      oldPanel: oTab.panel,
                      newTab: nTab.tab,
                      newPanel: nTab.panel
                   };

               if ( this.options.forceHash )
                  event.preventDefault();

               if ( oTab.tab.index != nTab.tab.index && this._trigger( 'beforeActivate', event, eventData ) !== false ) {
                  this.active( idx );
                  this._trigger( 'activate', event, nTab );
               }

            },

            'mouseenter a' : function( event ) {
               $( event.currentTarget ).addClass( 'ui-state-hover' );
            },

            'mouseleave a' : function( event ) {
               $( event.currentTarget ).removeClass( 'ui-state-hover' );
            }
         },

         active: function ( tab ) {

            var idx, hash;

            if ( arguments.length > 0 ) {

               idx = 0;

               if ( typeof(tab) == 'string' && tab.length > 0 ) {
                  idx = this.tabs.index( this.tabs.find( '[href=#'+tab+']' ).closest( 'li' ) );
               } else if ( typeof(tab) == 'number' && tab >= 0 ) {
                  idx = tab;
               }

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