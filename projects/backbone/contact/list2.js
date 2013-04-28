
App = {};
App.Models = {};
App.Collections = {};
App.Views = {};

Controller = Base.extend([
      Backbone.Events
   ], {

   constructor: function( options ) {

      this.initialize( options );
   },

   initialize: function( options ) {
   }

});

/**
* From http://jdsharp.us/jQuery/minute/calculate-scrollbar-width.php
*/

function scrollbarWidth() {
    var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
    // Append our div, do our calculation and then remove it
    $('body').append(div);
    var w1 = $('div', div).innerWidth();
    div.css('overflow-y', 'scroll');
    var w2 = $('div', div).innerWidth();
    $(div).remove();
    return (w1 - w2);
}



/* TODO: Needs a real home ... */
App.Views.FillHeight = {

   refresh: function () {

      var $rw = this.$('.ui-list-rows').eq(0),
          $pn = $rw.parent(),
          $bf = $rw.prev(),
          bfp = ( $bf.length > 0 ? $bf.position().top + $bf.outerHeight(true) : 0 ),
          $af = $rw.next(),
          afp = ( $af.length > 0 ? $af.outerHeight(true) : 0 );

      $rw.outerHeight( $pn.height() - ( bfp + afp ) );

   }

}


