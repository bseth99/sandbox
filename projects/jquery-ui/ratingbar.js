/*!
 * Copyright (c) 2014 Ben Olson (https://github.com/bseth99/)
 * A Simple Rating Bar Widget
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
 */

(function ($) {

var RatingBar = function( element, options ) {

   var $me = $( element ).addClass( 'star-ctr' );

   var $bg, $fg, steps, wd, cc,
       sw, fw, cs, cw, ini;

   $bg = $me.children( 'ul' );
   $fg = $bg.clone().addClass( 'star-fg' ).css( 'width', 0 ).appendTo( $me );
   $bg.addClass( 'star-bg' );

   function initialize() {

      ini = true;

      // How many rating elements
      cc = $bg.children().length;

      steps = Math.floor( +( $me.attr( 'data-steps' ) || 0 ) );

      // Total width of the bar
      wd = $bg.width();

   }

   $me.on( 'mousemove', function( e ) {

      if ( !ini ) initialize();

      var $li, dt, nm, nw, ns, ow, vl;

      // Where is the mouse relative to the left
      // side of the bar?
      ow = dt = e.pageX - $me.offset().left;
      vl = Math.round( ow / wd * cc * 10 ) / 10;

      // steps == 0 means continous mode, so no need to
      // waste time finding a snapping point
      if ( steps > 0 ) {

         $li = $( e.target ).closest( 'li' );
         if ( !$li.length ) return;

         // Find the per element step
         vl = nm = $li.index();
         ow = nw = $li.position().left;
         cw = $li.outerWidth( true ) / steps;

         // Now find any sub-step within an element
         // when the number of steps is larger
         // than the number of elements
         ns = Math.round( ( dt - nw ) / cw );
         ow = nw + ns * cw;

         // The fractional part of the rating
         vl += Math.round( ( ns / steps ) * 10 ) / 10;

      }

      $me.attr( 'data-value', vl );
      $fg.css( 'width', Math.round( ow )+'px' );

   });
}

$.fn.ratingbar = function ( option ) {

   return this.each(function () {

      var $this   = $( this )
      var data    = $this.data( 'osb.ratingbar' )
      var options = typeof option == 'object' && option

      if ( !data ) $this.data( 'osb.ratingbar', ( data = new RatingBar( this, options ) ) )

   })
}

$.fn.ratingbar.Constructor = RatingBar

})(jQuery);

