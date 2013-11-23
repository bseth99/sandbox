
require.config({

   shim: {

     'backbone': {
         deps: ['underscore','jquery'],
         exports: 'Backbone'
     },

     'underscore': {
         exports: '_'
     },

     'jquery': {
         exports: '$'
     },

   },

   waitSeconds: 0

});

require([
   'backbone',
   'underscore',
   'jquery',
   'moment',
   'backbone.computedfields'
], function( Backbone, _, $, moment ) {

   var MomentModel = Backbone.Model.extend({

         defaults: {
            when: null
         },

         computed: {

            when_fmt_short: {
               depends: ['when'],
               get: function ( fields ) {
                  return moment( fields.when ).format( 'MM/DD/YYYY' );
               },
               toJSON: false
            },

            when_fmt_long: {
               depends: ['when'],
               get: function ( fields ) {
                  return moment( fields.when ).format( 'MM/DD/YYYY h:mm:ss a' );
               },
               toJSON: false
            },

            when_fmt_duration_ago: {
               depends: ['when'],
               get: function ( fields ) {
                  return moment( fields.when ).fromNow();
               },
               toJSON: false
            },

            when_fmt_ellapsed_seconds: {
               depends: ['when'],
               get: function ( fields ) {
                  return moment.duration( moment() - moment( fields.when ) ).as('seconds') + ' seconds';
               },
               toJSON: false
            },

         },

         initialize: function () {
            this.computedFields = new Backbone.ComputedFields( this );
            this.timer();
         },

         timer: function() {

            var dur = moment.duration( moment() - moment( this.get( 'when' ) ) ).as('seconds');

            if ( dur > 300 )
               this.set( 'when', ( new Date() ).toISOString() );
            else
               this.trigger( 'change:when' );

            _.delay( _.bind( this.timer, this ), 1000 );

         },


      }),

      TestView = Backbone.View.extend({

         initialize: function() {

            this.model = new MomentModel({ when: ( new Date() ).toISOString() });
            this.template = _.template( $( '#test-template' ).html() );

            this.listenTo( this.model, 'change', this.render );
         },

         render: function() {

            this.$el.html( this.template( this.model.toJSON({ computedFields: true }) ) );

            return this;
         }

      });

   var view = new TestView();

   $( '#output' ).append( view.render().$el )

   $( '#json-norm' ).append( $( '<pre>' ).html( JSON.stringify( view.model.toJSON(), null, 3) ) );
   $( '#json-computed' ).append( $( '<pre>' ).html( JSON.stringify( view.model.toJSON({ computedFields: true }), null, 3) ) );

});
