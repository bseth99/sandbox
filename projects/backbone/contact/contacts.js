
App.Models.Contact = Backbone.Model.extend({

   defaults: {
      display_name: '',
      organization: '',
      primary_email: '',
      primary_phone: ''
   },

   selector: null,

   match: function ( select ) {

      this.selector = select;

      return (
               select.search_text.length == 0 ||
               ( select.search_text.length > 0 &&
                 _.chain(
                   _.values(
                     _.pick(this.attributes, 'display_name', 'organization', 'primary_phone', 'primary_email')
                    )
                  )
                  .any(
                     function( s ) {
                           return s.toLowerCase().indexOf(select.search_text.toLowerCase()) > -1;
                        }
                     )
                  .value()
               )
              );
   }

});

App.Collections.Contacts = Backbone.Collection.extend({

   model: App.Models.Contact,
   comparator: 'display_name'

});

App.Views.ContactItem = Backbone.View.extend({

   template: null,

   tagName: 'ul',
   className: 'ui-list-item',

   initialize: function ( options ) {
      this.template = _.template($('#contact-item').html());
   },

   render: function () {

      this.$el.html(this.template( this.formattedJSON() ));

      this._super();

      return this;
   },

   formattedJSON: function () {

      var item = this.model,
          select = item.selector,
          data = item.toJSON(),
          check = new RegExp( $.ui.autocomplete.escapeRegex(select.search_text), 'i' );;

      if ( select.search_text.length > 0 ) {

         for ( var d in data ) {

            if ( data[d] && check.test(data[d]) ) {

               data[d] = data[d].replace(
                                    new RegExp(
                                        '(?![^&;]+;)(?!<[^<>]*)(' +
                                        $.ui.autocomplete.escapeRegex(select.search_text) +
                                        ')(?![^<>]*>)(?![^&;]+;)', "gi"),
                                        '<span class="ui-search-highlight">$1</span>');
            }
         }
      }

      return data;
   }

});


App.Views.ContactList = Backbone.ListView.extend({

   template: null,

   tagName: 'div',
   className: 'ui-list-rows',

   itemView: App.Views.ContactItem

});

App.Views.ContactFilter = Backbone.FormView.extend([
      Backbone.Widget.Hover
   ], {

   template: null,

   tagName: 'div',

   hoverTargets: {
      'input'                    :   { over: 'mx-content-hover',  out: 'mx-content-default' }
   },

   initialize: function ( options ) {
      this.template = _.template($('#contact-filter').html());
   },

   render: function () {

      this.$el.html(this.template());

      this._super();

      return this;
   }

});

App.Views.ContactLayout = Backbone.View.extend([
      App.Views.FillHeight
   ],{

   template: null,

   tagName: 'div',
   className: 'ui-list-wrapper ds-contact-list',

   initialize: function ( options ) {

      this.template = _.template($('#contact-list').html());

   },

   render: function () {

      this.$el.html(this.template());

      this._super();

      return this;
   }

});

App.Controller = Controller.extend({

   filter: null,
   source: null,
   selected: null,

   container: null,

   layoutView: null,
   filterForm: null,
   resultList: null,

   initialize: function ( options ) {
      var options = options || {};

      this.container = options.container || 'body';
   },

   start: function () {

      this.source = new App.Collections.Contacts( localData );
      this.selected = new App.Collections.Contacts();
      this.filter = new Backbone.Model({ search_text: '' });

      this.layoutView = new App.Views.ContactLayout();
      this.filterForm = new App.Views.ContactFilter({ model: this.filter });
      this.resultList = new App.Views.ContactList({ collection: this.selected });

      $(this.container).append( this.layoutView.render().$el );
      this.layoutView.$('.ui-list-options').append( this.filterForm.render().$el );
      this.layoutView.$('.ui-list-content').append( this.resultList.render().$el );

      this.listenTo(this.filter, 'change', this.applyFilters);
      this.layoutView.refresh();
   },

   applyFilters: function () {

      var selector = this.filter.toJSON();

      this.selected.reset( this.source.filter(function ( model ) {

            return model.match( selector );

         }));
   }

});

localData = [
         {"display_name": "Neal, Amelia R.","organization":"XYZ Company","primary_email":"pede@nibh.com","primary_phone":"(577) 324-9152"},
         {"display_name": "Cervantes, Colton Z.","organization":"XYZ Company","primary_email":"imperdiet.dictum.magna@SuspendissesagittisNullam.com","primary_phone":"(730) 491-0518"},
         {"display_name": "Thornton, Marvin H.","organization":"XYZ Company","primary_email":"tristique@in.ca","primary_phone":"(530) 962-1617"},
         {"display_name": "Watkins, Leilani C.","organization":"XYZ Company","primary_email":"amet.massa@a.edu","primary_phone":"(368) 554-4860"},
         {"display_name": "Blake, Sawyer Z.","organization":"XYZ Company","primary_email":"sodales@Pellentesquetincidunttempus.edu","primary_phone":"(247) 412-3266"},
         {"display_name": "Fuller, Jennifer W.","organization":"XYZ Company","primary_email":"ullamcorper.Duis.at@ullamcorpernislarcu.org","primary_phone":"(263) 771-8743"},
         {"display_name": "Pollard, Noel K.","organization":"XYZ Company","primary_email":"sagittis.Duis.gravida@Proin.com","primary_phone":"(466) 130-3283"},
         {"display_name": "Clemons, Thomas Y.","organization":"XYZ Company","primary_email":"Integer@sem.org","primary_phone":"(463) 990-6407"},
         {"display_name": "Gilbert, Kimberley D.","organization":"XYZ Company","primary_email":"magna.Cras.convallis@metuseuerat.com","primary_phone":"(845) 785-9757"},
         {"display_name": "Green, Zeus L.","organization":"XYZ Company","primary_email":"Ut.tincidunt@pedeCumsociis.edu","primary_phone":"(894) 870-2892"},
         {"display_name": "Alston, Lesley P.","organization":"XYZ Company","primary_email":"lectus.quis@gravida.edu","primary_phone":"(709) 389-5236"},
         {"display_name": "Perry, Arthur R.","organization":"XYZ Company","primary_email":"orci.lacus.vestibulum@elit.com","primary_phone":"(202) 128-1825"},
         {"display_name": "Holman, Anastasia T.","organization":"XYZ Company","primary_email":"lorem.vehicula.et@sitametconsectetuer.com","primary_phone":"(756) 127-8864"},
         {"display_name": "Howe, Zena W.","organization":"XYZ Company","primary_email":"nisi@Nulla.org","primary_phone":"(925) 386-6531"},
         {"display_name": "Gray, Evan N.","organization":"XYZ Company","primary_email":"nonummy.ac.feugiat@mollis.edu","primary_phone":"(880) 530-9214"},
         {"display_name": "Gates, Galvin D.","organization":"XYZ Company","primary_email":"eu@nislQuisquefringilla.com","primary_phone":"(410) 733-0830"},
         {"display_name": "Hendrix, Anne E.","organization":"XYZ Company","primary_email":"ornare.libero.at@tempor.org","primary_phone":"(348) 482-7943"},
         {"display_name": "Avery, Nerea V.","organization":"XYZ Company","primary_email":"Sed@sedconsequatauctor.org","primary_phone":"(284) 585-9041"},
         {"display_name": "Tillman, Debra V.","organization":"XYZ Company","primary_email":"Nunc.lectus@justonecante.edu","primary_phone":"(961) 408-4886"},
         {"display_name": "Meadows, Mona F.","organization":"XYZ Company","primary_email":"vestibulum.neque.sed@etlaciniavitae.com","primary_phone":"(322) 745-5208"},
         {"display_name": "Yates, Zena A.","organization":"XYZ Company","primary_email":"orci.lacus.vestibulum@Quisque.org","primary_phone":"(975) 832-4608"},
         {"display_name": "Hodges, Eric E.","organization":"XYZ Company","primary_email":"natoque.penatibus@Sedneque.edu","primary_phone":"(984) 164-0737"},
         {"display_name": "Mclaughlin, Tana K.","organization":"XYZ Company","primary_email":"pharetra.Quisque.ac@Intinciduntcongue.org","primary_phone":"(213) 306-7213"},
         {"display_name": "Guerrero, Melvin N.","organization":"XYZ Company","primary_email":"congue.a@orciconsectetuereuismod.ca","primary_phone":"(475) 644-2835"},
         {"display_name": "Blevins, Solomon H.","organization":"XYZ Company","primary_email":"risus@diamlorem.com","primary_phone":"(305) 442-7089"},
         {"display_name": "Marsh, Victor U.","organization":"XYZ Company","primary_email":"eget@idenim.ca","primary_phone":"(816) 375-3065"},
         {"display_name": "Wilson, Mariko X.","organization":"zTech Inc.","primary_email":"habitant.morbi.tristique@tempusrisus.org","primary_phone":"(605) 594-0773"},
         {"display_name": "Nichols, Chandler E.","organization":"zTech Inc.","primary_email":"vulputate@auctornonfeugiat.org","primary_phone":"(465) 922-9100"},
         {"display_name": "Guerrero, Kylynn P.","organization":"zTech Inc.","primary_email":"massa@In.com","primary_phone":"(671) 413-0348"},
         {"display_name": "Phillips, Christen K.","organization":"zTech Inc.","primary_email":"ullamcorper.viverra@anteNuncmauris.org","primary_phone":"(256) 362-6140"},
         {"display_name": "Conrad, Flavia L.","organization":"zTech Inc.","primary_email":"sit.amet.consectetuer@Donecsollicitudin.edu","primary_phone":"(935) 427-1624"},
         {"display_name": "Strong, Lillith B.","organization":"zTech Inc.","primary_email":"vel.est.tempor@diamPellentesquehabitant.edu","primary_phone":"(172) 575-6246"},
         {"display_name": "Santiago, Samantha V.","organization":"zTech Inc.","primary_email":"dictum.cursus.Nunc@dictumcursus.com","primary_phone":"(120) 476-2846"},
         {"display_name": "Johns, Kirby T.","organization":"zTech Inc.","primary_email":"malesuada.ut@rutrumFuscedolor.ca","primary_phone":"(571) 139-8270"},
         {"display_name": "Whitehead, Lacey K.","organization":"zTech Inc.","primary_email":"dictum.placerat@ipsumdolor.edu","primary_phone":"(128) 593-9691"},
         {"display_name": "Wilder, Marcia C.","organization":"zTech Inc.","primary_email":"Donec@a.edu","primary_phone":"(302) 108-9442"},
         {"display_name": "Jensen, Stacy G.","organization":"zTech Inc.","primary_email":"arcu.Vestibulum.ante@quis.org","primary_phone":"(533) 459-3610"},
         {"display_name": "Fox, Tarik C.","organization":"zTech Inc.","primary_email":"ultrices@estcongue.com","primary_phone":"(217) 746-1658"},
         {"display_name": "Wright, Patience O.","organization":"zTech Inc.","primary_email":"ligula@Donecporttitortellus.ca","primary_phone":"(895) 994-3056"},
         {"display_name": "Richard, Ila Y.","organization":"zTech Inc.","primary_email":"mattis.velit@pedeCumsociis.com","primary_phone":"(340) 837-8992"},
         {"display_name": "Lancaster, Ruth E.","organization":"zTech Inc.","primary_email":"diam.vel.arcu@tortorNunccommodo.com","primary_phone":"(294) 868-5554"},
         {"display_name": "Serrano, Cynthia V.","organization":"zTech Inc.","primary_email":"ipsum.Donec@Crasvehiculaaliquet.org","primary_phone":"(626) 554-0714"},
         {"display_name": "Schmidt, Ingrid W.","organization":"zTech Inc.","primary_email":"mauris.a@augue.com","primary_phone":"(299) 741-5278"},
         {"display_name": "Callahan, Amir N.","organization":"zTech Inc.","primary_email":"Integer.in@feugiat.ca","primary_phone":"(616) 760-5473"},
         {"display_name": "Buchanan, Quintessa U.","organization":"zTech Inc.","primary_email":"eu.accumsan.sed@nonmassanon.com","primary_phone":"(917) 697-7431"},
         {"display_name": "Kelley, Lilah D.","organization":"zTech Inc.","primary_email":"eu@ornaretortorat.com","primary_phone":"(847) 684-7547"},
         {"display_name": "Bass, Forrest G.","organization":"Small Tools Co","primary_email":"nulla@Namnullamagna.edu","primary_phone":"(765) 181-5931"},
         {"display_name": "Dyer, Norman L.","organization":"Small Tools Co","primary_email":"Vestibulum.ante@dictum.org","primary_phone":"(681) 164-1873"},
         {"display_name": "May, Russell K.","organization":"Small Tools Co","primary_email":"vitae.mauris@malesuadamalesuadaInteger.ca","primary_phone":"(219) 526-7724"},
         {"display_name": "Hoffman, Tate A.","organization":"Small Tools Co","primary_email":"adipiscing.ligula@tempus.ca","primary_phone":"(688) 416-9511"},
         {"display_name": "Pugh, Julie C.","organization":"Small Tools Co","primary_email":"morbi.tristique@nibh.edu","primary_phone":"(788) 927-3236"},
         {"display_name": "Wooten, Iola Q.","organization":"Small Tools Co","primary_email":"Integer@semeget.ca","primary_phone":"(234) 449-1559"},
         {"display_name": "Oconnor, Lars C.","organization":"Small Tools Co","primary_email":"mi@purusMaecenaslibero.ca","primary_phone":"(750) 114-0858"},
         {"display_name": "Williamson, Ezra T.","organization":"Small Tools Co","primary_email":"sit.amet@tristique.org","primary_phone":"(292) 798-4919"},
         {"display_name": "Farmer, Vladimir S.","organization":"Small Tools Co","primary_email":"sem.mollis@Nuncullamcorpervelit.ca","primary_phone":"(377) 850-8351"},
         {"display_name": "Holcomb, Keiko W.","organization":"Small Tools Co","primary_email":"egestas.ligula.Nullam@ipsum.com","primary_phone":"(192) 282-3581"},
         {"display_name": "Mccall, Hasad E.","organization":"Small Tools Co","primary_email":"pede.ultrices.a@maurissagittisplacerat.ca","primary_phone":"(131) 657-0344"},
         {"display_name": "Terry, Keelie S.","organization":"Small Tools Co","primary_email":"pede.Cras@pede.org","primary_phone":"(302) 126-6439"},
         {"display_name": "Stevens, Germaine W.","organization":"Small Tools Co","primary_email":"nisl.sem@Duis.org","primary_phone":"(701) 256-0218"},
         {"display_name": "Slater, Dahlia O.","organization":"Small Tools Co","primary_email":"enim.Curabitur@Crasegetnisi.edu","primary_phone":"(525) 829-7039"},
         {"display_name": "Gallegos, Britanney S.","organization":"Small Tools Co","primary_email":"Maecenas.malesuada.fringilla@tristiquesenectuset.ca","primary_phone":"(511) 703-5684"},
         {"display_name": "Gregory, Jamal P.","organization":"Small Tools Co","primary_email":"facilisis.magna.tellus@eget.ca","primary_phone":"(159) 450-7291"},
         {"display_name": "Wyatt, Audrey A.","organization":"Small Tools Co","primary_email":"dictum.sapien@posuere.edu","primary_phone":"(577) 322-6822"},
         {"display_name": "Ballard, Yvette C.","organization":"Small Tools Co","primary_email":"consectetuer@auctor.edu","primary_phone":"(113) 924-9291"},
         {"display_name": "Deleon, Hilda H.","organization":"Small Tools Co","primary_email":"arcu.imperdiet.ullamcorper@Phasellus.edu","primary_phone":"(380) 500-5111"},
         {"display_name": "Maddox, Celeste F.","organization":"Small Tools Co","primary_email":"ante@sitamet.ca","primary_phone":"(912) 926-2552"},
         {"display_name": "Pratt, Leigh L.","organization":"Small Tools Co","primary_email":"eros.non.enim@felisullamcorper.org","primary_phone":"(588) 690-1229"},
         {"display_name": "Hobbs, Ralph X.","organization":"Small Tools Co","primary_email":"Praesent.interdum.ligula@velit.ca","primary_phone":"(893) 419-1687"},
         {"display_name": "Cote, Burton K.","organization":"Small Tools Co","primary_email":"eget.metus.In@Donec.edu","primary_phone":"(352) 540-8384"},
         {"display_name": "Mcdaniel, Kirestin I.","organization":"Small Tools Co","primary_email":"dapibus.rutrum@Namnullamagna.org","primary_phone":"(703) 574-7118"},
         {"display_name": "Kerr, Hoyt Y.","organization":"Small Tools Co","primary_email":"et.arcu@Sed.com","primary_phone":"(308) 243-7872"},
         {"display_name": "Morton, Kirestin A.","organization":"Small Tools Co","primary_email":"dignissim@imperdieterat.com","primary_phone":"(856) 130-5375"},
         {"display_name": "Sellers, Kiona Z.","organization":"Small Tools Co","primary_email":"iaculis.lacus.pede@sedtortorInteger.com","primary_phone":"(271) 907-5092"},
         {"display_name": "Riley, Hilel T.","organization":"Small Tools Co","primary_email":"dis@porttitoreros.org","primary_phone":"(580) 236-9348"},
         {"display_name": "Jacobs, Charissa E.","organization":"Small Tools Co","primary_email":"Sed.neque@eu.edu","primary_phone":"(182) 916-7990"},
         {"display_name": "Duran, Finn V.","organization":"Small Tools Co","primary_email":"risus.Donec.egestas@fringillaporttitorvulputate.com","primary_phone":"(598) 970-4946"},
         {"display_name": "Page, Daria W.","organization":"Large Items Ltd","primary_email":"lectus@quam.ca","primary_phone":"(807) 810-0971"},
         {"display_name": "Pope, Serina Q.","organization":"Large Items Ltd","primary_email":"ante@risusDonec.com","primary_phone":"(663) 935-6282"},
         {"display_name": "Cain, Gwendolyn B.","organization":"Large Items Ltd","primary_email":"Maecenas@urnaUttincidunt.com","primary_phone":"(702) 621-2949"},
         {"display_name": "Perez, Indira J.","organization":"Large Items Ltd","primary_email":"Cras@Aliquamgravidamauris.org","primary_phone":"(369) 293-3954"},
         {"display_name": "Mathis, Nash U.","organization":"Large Items Ltd","primary_email":"lorem.sit@dolor.ca","primary_phone":"(238) 622-3627"},
         {"display_name": "Dudley, Herrod M.","organization":"Large Items Ltd","primary_email":"libero.lacus.varius@laoreetipsum.ca","primary_phone":"(727) 364-8485"},
         {"display_name": "Vang, Keaton L.","organization":"Large Items Ltd","primary_email":"posuere.at.velit@amet.org","primary_phone":"(662) 836-1830"},
         {"display_name": "Davidson, Delilah V.","organization":"Large Items Ltd","primary_email":"nunc.risus.varius@Morbivehicula.edu","primary_phone":"(915) 861-7080"},
         {"display_name": "Bruce, Hilary O.","organization":"Large Items Ltd","primary_email":"in.faucibus.orci@blanditNamnulla.edu","primary_phone":"(499) 701-9813"},
         {"display_name": "Horn, Gray M.","organization":"Large Items Ltd","primary_email":"Vestibulum.ut@euismod.edu","primary_phone":"(293) 107-1678"},
         {"display_name": "Marsh, Hanae Y.","organization":"Large Items Ltd","primary_email":"libero.Proin.sed@orciUtsagittis.org","primary_phone":"(143) 277-6202"},
         {"display_name": "Finch, Halla L.","organization":"Large Items Ltd","primary_email":"orci.tincidunt@faucibusleoin.com","primary_phone":"(579) 253-7502"},
         {"display_name": "Lowery, Hayden V.","organization":"Large Items Ltd","primary_email":"et.libero@eget.ca","primary_phone":"(920) 944-2905"},
         {"display_name": "Mcpherson, Marcia X.","organization":"Large Items Ltd","primary_email":"Nullam@Duissitamet.ca","primary_phone":"(294) 228-7026"},
         {"display_name": "Sykes, Cynthia L.","organization":"Large Items Ltd","primary_email":"Mauris@cursusluctus.org","primary_phone":"(945) 901-5828"},
         {"display_name": "Kidd, Nichole V.","organization":"Large Items Ltd","primary_email":"faucibus.ut.nulla@posuere.org","primary_phone":"(277) 449-2804"},
         {"display_name": "Dean, Glenna B.","organization":"Large Items Ltd","primary_email":"viverra@euismodmauris.org","primary_phone":"(875) 162-5409"},
         {"display_name": "Blair, Olga R.","organization":"Large Items Ltd","primary_email":"mollis.dui.in@sitamet.edu","primary_phone":"(350) 494-6062"},
         {"display_name": "Tyson, Mallory Y.","organization":"Large Items Ltd","primary_email":"lorem.fringilla@accumsanconvallis.com","primary_phone":"(707) 894-9637"},
         {"display_name": "Manning, Aileen X.","organization":"Large Items Ltd","primary_email":"Integer@magnaatortor.edu","primary_phone":"(420) 156-0416"},
         {"display_name": "Hogan, Gabriel B.","organization":"","primary_email":"adipiscing@magnaSed.ca","primary_phone":"(726) 467-5110"},
         {"display_name": "Mayer, Zachery Z.","organization":"","primary_email":"ligula.elit.pretium@Praesentinterdumligula.org","primary_phone":"(252) 522-0151"},
         {"display_name": "Dickerson, Bert F.","organization":"","primary_email":"Etiam.gravida@sapien.edu","primary_phone":"(955) 125-6232"},
         {"display_name": "Tillman, Wade U.","organization":"","primary_email":"lectus@fringilla.org","primary_phone":"(377) 898-0135"},
         {"display_name": "Villarreal, Gloria R.","organization":"","primary_email":"blandit@nulla.ca","primary_phone":"(809) 229-0004"},
         {"display_name": "Pruitt, Alexa B.","organization":"","primary_email":"Donec@enimnonnisi.com","primary_phone":"(615) 978-9314"},
         {"display_name": "Long, Louis F.","organization":"","primary_email":"turpis.nec@mus.ca","primary_phone":"(257) 298-9004"},
         {"display_name": "Cline, Rhonda V.","organization":"","primary_email":"mi.enim@nonluctus.edu","primary_phone":"(233) 489-9044"},
         {"display_name": "Vincent, Coby G.","organization":"","primary_email":"magna.sed@turpis.com","primary_phone":"(854) 992-1764"},
         {"display_name": "Caldwell, Britanney L.","organization":"","primary_email":"mi@VivamusrhoncusDonec.com","primary_phone":"(863) 305-1386"},
         {"display_name": "Ramirez, Hedley Y.","organization":"","primary_email":"ac@urnasuscipitnonummy.org","primary_phone":"(133) 411-4416"},
         {"display_name": "Duke, Ainsley P.","organization":"Forever Moving Inc","primary_email":"amet.ante.Vivamus@eu.ca","primary_phone":"(398) 832-6250"},
         {"display_name": "Sargent, Anne R.","organization":"Forever Moving Inc","primary_email":"amet@magna.com","primary_phone":"(387) 457-6147"},
         {"display_name": "Whitney, Delilah O.","organization":"Forever Moving Inc","primary_email":"id.enim@nequesed.edu","primary_phone":"(704) 315-1862"},
         {"display_name": "Baird, Tanner N.","organization":"Forever Moving Inc","primary_email":"dolor@eu.com","primary_phone":"(115) 587-4433"},
         {"display_name": "Roman, Sonya P.","organization":"Forever Moving Inc","primary_email":"mi.eleifend@elementum.ca","primary_phone":"(697) 216-2771"},
         {"display_name": "Ford, Yeo P.","organization":"Forever Moving Inc","primary_email":"arcu@et.com","primary_phone":"(997) 336-0928"},
         {"display_name": "Barker, Abdul V.","organization":"Forever Moving Inc","primary_email":"auctor.vitae@feliseget.edu","primary_phone":"(308) 128-3887"},
         {"display_name": "George, Violet D.","organization":"Forever Moving Inc","primary_email":"eu.arcu.Morbi@necenimNunc.org","primary_phone":"(615) 705-7817"},
         {"display_name": "Abbott, Ivy X.","organization":"Forever Moving Inc","primary_email":"Fusce.aliquet.magna@aliquetPhasellusfermentum.com","primary_phone":"(611) 490-7090"},
         {"display_name": "Alvarez, Xaviera R.","organization":"Forever Moving Inc","primary_email":"enim.consequat@enim.edu","primary_phone":"(800) 984-9720"},
         {"display_name": "Wilson, Kermit J.","organization":"Forever Moving Inc","primary_email":"mollis@Proinvel.edu","primary_phone":"(620) 530-4956"},
         {"display_name": "Suarez, Craig W.","organization":"Forever Moving Inc","primary_email":"tellus@Duisatlacus.ca","primary_phone":"(496) 601-5426"},
         {"display_name": "Santana, Tobias S.","organization":"Forever Moving Inc","primary_email":"arcu.Aliquam@maurisIntegersem.com","primary_phone":"(843) 515-3963"},
         {"display_name": "Morin, Stuart E.","organization":"Forever Moving Inc","primary_email":"Praesent@risusaultricies.org","primary_phone":"(941) 310-0841"},
         {"display_name": "Hughes, Naida O.","organization":"Forever Moving Inc","primary_email":"massa.Vestibulum@sedtortorInteger.edu","primary_phone":"(530) 268-7814"},
         {"display_name": "Banks, Macy D.","organization":"Forever Moving Inc","primary_email":"sed.dolor@turpis.org","primary_phone":"(395) 702-2671"},
         {"display_name": "Rojas, Kyla D.","organization":"Forever Moving Inc","primary_email":"sagittis@ante.ca","primary_phone":"(106) 242-2587"},
         {"display_name": "Ochoa, Robert J.","organization":"Forever Moving Inc","primary_email":"non@eusemPellentesque.org","primary_phone":"(203) 918-7298"},
         {"display_name": "Cook, Ivy Q.","organization":"Forever Moving Inc","primary_email":"Sed.neque@ante.org","primary_phone":"(582) 350-9916"},
         {"display_name": "Wagner, Tanisha H.","organization":"Forever Moving Inc","primary_email":"pharetra@miAliquam.edu","primary_phone":"(564) 558-7139"},
         {"display_name": "Abbott, Imani P.","organization":"Forever Moving Inc","primary_email":"tincidunt.nibh.Phasellus@ornareFuscemollis.com","primary_phone":"(824) 983-9138"},
         {"display_name": "Golden, Rachel Z.","organization":"Forever Moving Inc","primary_email":"vehicula@fringillapurus.org","primary_phone":"(357) 641-6004"},
         {"display_name": "Gaines, Scarlett Y.","organization":"Forever Moving Inc","primary_email":"libero.Proin.sed@lobortisultrices.com","primary_phone":"(765) 242-4465"},
         {"display_name": "Herrera, Talon B.","organization":"Forever Moving Inc","primary_email":"ac@consequatauctornunc.com","primary_phone":"(933) 182-3799"},
         {"display_name": "Melendez, Charde I.","organization":"Forever Moving Inc","primary_email":"primis.in.faucibus@Nuncsedorci.org","primary_phone":"(252) 700-1020"},
         {"display_name": "Wynn, Teagan L.","organization":"Forever Moving Inc","primary_email":"velit.dui.semper@ipsumSuspendissenon.edu","primary_phone":"(139) 921-5507"},
         {"display_name": "Buck, Ila N.","organization":"Forever Moving Inc","primary_email":"Donec.consectetuer@lectuspedeultrices.org","primary_phone":"(847) 156-0953"},
         {"display_name": "Jefferson, Ryan O.","organization":"Forever Moving Inc","primary_email":"a.mi.fringilla@fringillapurus.edu","primary_phone":"(636) 710-8664"},
         {"display_name": "Waller, Ignatius D.","organization":"Forever Moving Inc","primary_email":"neque@erosnectellus.ca","primary_phone":"(539) 177-5363"},
         {"display_name": "Horn, Sigourney J.","organization":"Forever Moving Inc","primary_email":"Sed.pharetra@lorem.edu","primary_phone":"(106) 751-6630"},
         {"display_name": "Nichols, Kylee A.","organization":"","primary_email":"dolor@massaIntegervitae.ca","primary_phone":"(761) 499-8356"},
         {"display_name": "Ratliff, Hayley Q.","organization":"","primary_email":"eu.tempor@ametlorem.com","primary_phone":"(580) 896-4975"},
         {"display_name": "Manning, Nora W.","organization":"ABC Company","primary_email":"sit.amet@loremacrisus.edu","primary_phone":"(942) 671-7169"},
         {"display_name": "Garner, Kirsten F.","organization":"ABC Company","primary_email":"tincidunt.dui@tempusloremfringilla.ca","primary_phone":"(622) 790-3868"},
         {"display_name": "Yates, Reagan Y.","organization":"ABC Company","primary_email":"libero.Integer.in@Aenean.edu","primary_phone":"(403) 198-3139"},
         {"display_name": "Barrera, Yael Y.","organization":"ABC Company","primary_email":"Pellentesque.tincidunt@diam.com","primary_phone":"(361) 949-8463"},
         {"display_name": "Weiss, Marcia M.","organization":"ABC Company","primary_email":"sed.tortor.Integer@ametconsectetueradipiscing.ca","primary_phone":"(731) 131-1264"},
         {"display_name": "Allison, Kaye R.","organization":"ABC Company","primary_email":"dolor.tempus.non@quamCurabiturvel.edu","primary_phone":"(754) 481-3313"},
         {"display_name": "Brooks, Cameran I.","organization":"ABC Company","primary_email":"elementum.dui.quis@nonlobortis.ca","primary_phone":"(600) 345-3139"},
         {"display_name": "Barron, Yeo B.","organization":"ABC Company","primary_email":"non.justo.Proin@dolorvitae.com","primary_phone":"(748) 789-8183"},
         {"display_name": "Rosa, Mallory D.","organization":"ABC Company","primary_email":"ultrices@tincidunt.com","primary_phone":"(895) 294-1928"},
         {"display_name": "Gentry, Katelyn H.","organization":"ABC Company","primary_email":"fringilla@pharetra.org","primary_phone":"(187) 913-7266"},
         {"display_name": "Drake, Joel Y.","organization":"ABC Company","primary_email":"dictum@vehiculaaliquet.edu","primary_phone":"(960) 246-4672"},
         {"display_name": "Ratliff, Rooney X.","organization":"ABC Company","primary_email":"enim.Etiam.imperdiet@etnetus.ca","primary_phone":"(150) 715-9181"},
         {"display_name": "Deleon, Lars G.","organization":"ABC Company","primary_email":"tempor.erat@Cum.com","primary_phone":"(919) 737-4260"},
         {"display_name": "Lawrence, Unity V.","organization":"ABC Company","primary_email":"nunc.est.mollis@Etiambibendumfermentum.com","primary_phone":"(464) 379-4943"},
         {"display_name": "Campos, Eugenia P.","organization":"ABC Company","primary_email":"Sed@ipsumSuspendisse.org","primary_phone":"(349) 948-5276"},
         {"display_name": "Huffman, Chaney X.","organization":"ABC Company","primary_email":"quis.diam@et.ca","primary_phone":"(337) 870-9331"},
         {"display_name": "England, Solomon V.","organization":"ABC Company","primary_email":"natoque@Praesenteunulla.edu","primary_phone":"(664) 426-8129"},
         {"display_name": "Cabrera, Justine S.","organization":"ABC Company","primary_email":"id.blandit.at@cursusdiam.edu","primary_phone":"(655) 974-1558"},
         {"display_name": "Reynolds, Garrison A.","organization":"ABC Company","primary_email":"risus.varius.orci@natoquepenatibus.org","primary_phone":"(119) 304-4729"},
         {"display_name": "Silva, Emma E.","organization":"ABC Company","primary_email":"lacus.Nulla.tincidunt@maurisipsumporta.edu","primary_phone":"(207) 780-5909"},
         {"display_name": "Gilmore, Gretchen R.","organization":"XYZ Company","primary_email":"Cum.sociis@pedeblandit.org","primary_phone":"(113) 316-0354"},
         {"display_name": "Hobbs, Aretha Q.","organization":"XYZ Company","primary_email":"ut@lacusUt.com","primary_phone":"(552) 556-8203"},
         {"display_name": "Ross, Richard Y.","organization":"XYZ Company","primary_email":"gravida.mauris.ut@morbitristique.edu","primary_phone":"(114) 664-0275"},
         {"display_name": "Pennington, Merrill W.","organization":"XYZ Company","primary_email":"Class@massa.ca","primary_phone":"(749) 877-5755"},
         {"display_name": "Saunders, Xaviera J.","organization":"","primary_email":"sed.est.Nunc@mollisPhaselluslibero.com","primary_phone":"(327) 181-5934"},
         {"display_name": "Holcomb, Indira I.","organization":"","primary_email":"vestibulum@cursus.com","primary_phone":"(814) 914-7521"},
         {"display_name": "Flowers, Davis R.","organization":"","primary_email":"parturient.montes@tellusnon.com","primary_phone":"(613) 957-3990"},
         {"display_name": "Knapp, Valentine J.","organization":"","primary_email":"penatibus.et.magnis@lacusvestibulumlorem.ca","primary_phone":"(343) 556-7213"},
         {"display_name": "Ortiz, Ora S.","organization":"","primary_email":"Duis@consequat.com","primary_phone":"(752) 752-2998"},
         {"display_name": "Melendez, Quincy R.","organization":"","primary_email":"Nulla@blandit.org","primary_phone":"(738) 866-5393"},
         {"display_name": "Conway, Galena S.","organization":"","primary_email":"sit@nonummyultriciesornare.com","primary_phone":"(203) 280-7517"},
         {"display_name": "Montgomery, Maite K.","organization":"","primary_email":"Cras.interdum@euismod.org","primary_phone":"(978) 902-0738"},
         {"display_name": "Cabrera, Rama G.","organization":"","primary_email":"nibh.Donec.est@vulputateullamcorper.ca","primary_phone":"(785) 861-4053"},
         {"display_name": "Stewart, TaShya H.","organization":"","primary_email":"ultricies.ligula@sitamet.org","primary_phone":"(488) 942-6175"},
         {"display_name": "Weiss, Ivan X.","organization":"","primary_email":"elit.elit.fermentum@in.org","primary_phone":"(626) 475-2018"},
         {"display_name": "Carson, James I.","organization":"","primary_email":"ut.mi.Duis@Lorem.com","primary_phone":"(545) 399-2880"},
         {"display_name": "Merritt, Sonya T.","organization":"","primary_email":"Donec.elementum@acsem.org","primary_phone":"(915) 190-1391"},
         {"display_name": "Patterson, Kimberly P.","organization":"","primary_email":"quis@pede.edu","primary_phone":"(259) 158-6234"},
         {"display_name": "Fernandez, Melvin B.","organization":"","primary_email":"lorem.ipsum@Donecnon.com","primary_phone":"(788) 693-3544"},
         {"display_name": "Paul, Octavius P.","organization":"","primary_email":"Fusce.mollis.Duis@eratvolutpat.ca","primary_phone":"(450) 897-0025"},
         {"display_name": "Trujillo, Moses A.","organization":"","primary_email":"Nunc.quis@lacusQuisquepurus.org","primary_phone":"(232) 689-2485"},
         {"display_name": "Patrick, Alyssa H.","organization":"","primary_email":"Vestibulum.ante@velitCras.edu","primary_phone":"(232) 489-3830"},
         {"display_name": "Gonzalez, Myra S.","organization":"","primary_email":"arcu.ac.orci@eleifendnuncrisus.org","primary_phone":"(970) 820-5557"},
         {"display_name": "Richards, Urielle Z.","organization":"","primary_email":"arcu@faucibus.ca","primary_phone":"(278) 574-8535"},
         {"display_name": "Rodriquez, Justina D.","organization":"","primary_email":"eu.ultrices@Nunc.org","primary_phone":"(272) 752-4525"},
         {"display_name": "Pate, Ora N.","organization":"","primary_email":"ipsum.sodales.purus@Phasellus.com","primary_phone":"(827) 282-9974"},
         {"display_name": "Bean, Brock F.","organization":"","primary_email":"netus.et@diamPellentesque.com","primary_phone":"(758) 916-6651"},
         {"display_name": "Warner, Xandra L.","organization":"","primary_email":"ipsum.primis.in@euismod.edu","primary_phone":"(590) 331-3552"},
         {"display_name": "Mcdonald, Berk P.","organization":"","primary_email":"enim.Suspendisse.aliquet@veliteu.com","primary_phone":"(159) 668-5167"},
         {"display_name": "Meyers, Gillian W.","organization":"","primary_email":"dictum.ultricies.ligula@utsemNulla.ca","primary_phone":"(255) 676-2343"},
         {"display_name": "Doyle, Rowan R.","organization":"","primary_email":"id.nunc.interdum@enimSed.com","primary_phone":"(515) 299-7783"},
         {"display_name": "Workman, Nola F.","organization":"Outside Path Partners","primary_email":"Sed.eu.nibh@seddolorFusce.com","primary_phone":"(376) 714-0837"},
         {"display_name": "Sweet, Hilda F.","organization":"Outside Path Partners","primary_email":"nisl.elementum.purus@nonsollicitudina.ca","primary_phone":"(776) 503-5320"},
         {"display_name": "Porter, Alfonso I.","organization":"Outside Path Partners","primary_email":"tellus.Aenean@Sedeueros.org","primary_phone":"(414) 798-6175"},
         {"display_name": "Pugh, Uma M.","organization":"Outside Path Partners","primary_email":"Etiam.gravida@a.org","primary_phone":"(669) 869-5030"},
         {"display_name": "Hobbs, Velma Q.","organization":"Outside Path Partners","primary_email":"augue@lacus.com","primary_phone":"(965) 625-4719"},
         {"display_name": "Flores, Sybil O.","organization":"Outside Path Partners","primary_email":"leo.Vivamus@Fuscemollis.org","primary_phone":"(476) 775-1487"},
         {"display_name": "Steele, Julie E.","organization":"Outside Path Partners","primary_email":"aliquet.molestie@nonarcuVivamus.org","primary_phone":"(344) 542-7976"},
         {"display_name": "West, Jacob I.","organization":"Outside Path Partners","primary_email":"In.condimentum.Donec@Donecnonjusto.com","primary_phone":"(579) 444-2687"},
         {"display_name": "Waters, Ivy L.","organization":"Outside Path Partners","primary_email":"adipiscing.non.luctus@pedenonummyut.ca","primary_phone":"(298) 863-7915"},
         {"display_name": "Rosario, Upton A.","organization":"Outside Path Partners","primary_email":"magna.et@Sedpharetrafelis.edu","primary_phone":"(407) 281-1295"}
     ];
