/*!
 * Copyright (c) 2012 Ben Olson (https://github.com/bseth99/basejs)
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
 * Dependancies: None
 *
 */

(function (undefined) {

   var isArray = function( v ) {
      return (v && Object.prototype.toString.call( v ) === '[object Array]');
   }

   var isObject = function( v ) {
      return (v && typeof v == 'object');
   }

   var isFunction = function( v ) {
      return (v && typeof v == 'function');
   }


   /**
   * Deep copy a source variable to a target variable.
   *
   * @param target { Any }
   * @param source ( Any }
   *
   * Any enumerable type will create a copy of source into target
   * if the intrinsic value in target is not already defined.
   * Arrays and Objects will recursively attempt to copy items from
   * source to target to fill in any missing items.
   *
   */

   var merge = function(target, source) {

      if ( typeof(source) == 'undefined' )
         return target;

      if ( isObject(source) ) {

         target = target || (isArray(source) ? [] : {});

         for ( var p in source ) {

            if ( target[p] && source[p] === target[p] )
               continue;

            target[p] = merge( target[p], source[p] );
         }

      } else {

         if ( source instanceof Date )
            target = new Date(source);
         else
            target = source;

      }

      return target;
   }

   /**
   * Look for collisions and create wrappers to setup "super" chain
   * Enables chaining method automatically or manually via _super()
   *
   * @param target { Object } receiving object.
   *        Everything in source will be copied
   *        to the target object.  Collisions in function names will be wrapped
   *        such that the function in target will be available via the _super method
   *        while the source method is executing.  If auto is true, the target method
   *        will be executed after the source method is complete.  The return value of
   *        source will be used unless its undefined in which case the return from target
   *        will be used.
   *
   * @param source { Object } properties to merge into target
   *
   * @param options { Object } how to handle method and/or property name collisions
   *        Two hash values are allowed:
   *           {
   *              functions:  { Boolean | Object } function name collisions
   *              properties: { Boolean | Object } property name collisions
   *           }
   *
   *        Both options default to true.
   *
   *        For functions, the super chain will be called automatically.
   *        For properties, Arrays and Object hashes will be merged.  The source will override the
   *        target when there is an overlap.
   *
   *        Both options also takes a Hash of keys that can indicate (true/false) if they should
   *        be auto chained / merged
   *
   *        {
   *           functions: { init: true, foo: false, bar: true },
   *           properties: false  -- never merge - just overwrite with source
   *        }
   */

   var chain = function(target, source, options) {

      var options = options || {};

      options = {
            functions: typeof(options.functions) == 'undefined' ? true : options.functions,
            properties: typeof(options.properties) == 'undefined' ? true : options.properties
         };

      for ( var p in source ) {

         // Don't merge things not actually in source (in its prototype chain)
         if ( target[p] && source.hasOwnProperty(p) ) {

            // There is a collision - wrap up the methods in a proxy to
            // add chaining via super()
            if ( isFunction(source[p]) ) {

               if ( p != 'constructor' && target[p] !== source[p] ) {

                  // Break the shared scope and lock in the current method
                  // by wrapping in another function to create a new parent scope
                  target[p] = (function (_base, _call, _continue) {

                        var _super = function () { _base.apply(this, arguments); },
                            _superStop = function () { _continue = false; },
                            _superApply = function ( args ) { _base.apply(this, args); };

                        var _proxy = function () {

                           var _ret, __ret,
                               __super = this._super,
                               __superStop = this._superStop,
                               __superApply = this._superApply;

                           this._super = _super;
                           this._superApply = _superApply;
                           if ( _continue )
                              this._superStop = _superStop;

                           var _ret = _call.apply(this, arguments);

                           if ( _continue ) {
                              __ret = _super.apply(this, arguments);
                              if ( typeof(_ret) == 'undefined') _ret = __ret;
                           }

                           this._super = __super;
                           this._superApply = __superApply;
                           this._superStop = __superStop;

                           return _ret;
                        }

                        return _proxy;

                     })(target[p], source[p], ( options.functions === true || options.functions[p] ));
               }

            } else {

               // Try to merge non-functions (objects/arrays/literals).
               // source wins ties.  This is a deep copy to ensure
               // all references will be unique.
               if ( (isObject(source[p]) || isArray(source[p]) ) && (options.properties || options.properties[p]) )
                  target[p] = merge(merge(null, target[p]), source[p]);
               else
                  target[p] = source[p];

            }

         } else {

            // No collisions detected.  Copy it all across.
            target[p] = source[p];

         }
      }

      return target;
   }


   /**
   * Ensure the provided object is a "class" ( a function with a prototype set ).
   * Objects will be inspected to detemine if a constructor method is defined.
   * If so, it will be used a the function and the object will be set as the
   * prototype.  Otherwise, a generic, empty function will be created.
   *
   * @param k { Function | Object } the object to normalize
   *
   */

   var normalize = function(k) {

      var klass;

      if ( typeof(k) == 'function' ) {

         klass = k;

      } else if ( k.hasOwnProperty('constructor') ) {

         klass = k.constructor;
         klass.prototype = k;

      } else {

         klass = function () { };
         klass.prototype = k;

      }

      return klass;
   }


   /***
   *   Extend a base class (parent) with subclass defintion (child).  Optionally,
   *   merge mixin objects to the final class object.
   *   @params: 2 or more { Function | Object }
   *
   *      first argument is expected to be the parent/base class
   *
   *      last argument is expected to be the child/sub class
   *
   *      extra arguments between the first and last are
   *      assumed to be mixins.  The order is important as it
   *      determines how each function is chained to the next.
   *      the first mixin will be the last one called in the chain.
   */

   var extend = function() {

      var parent, child, proxy,
          csubr, args, len,
          auto, protos, odefs;

      //Must have at least a parent and child
      if (arguments.length < 2 ) return;

      args = [];
      if ( isObject(arguments[0]) || isFunction(arguments[0]) )
         args.push(arguments[0]);

      // Check for mixins array as second argument
      if ( isArray(arguments[1]) ) {
         args = args.concat(arguments[1]);
         args.push(arguments[2]);

         // Check for static properties
         if ( arguments.length == 4 && isObject(arguments[3]) )
            odefs = arguments[3];

      } else {
         args.push(arguments[1]);

         // Check for static properties
         if ( arguments.length == 3 && isObject(arguments[2]) )
            odefs = arguments[2];
      }

      len = args.length;
      odefs = odefs || {};

      // Reorganize the inputs to ensure all the function
      // chains are in the correct order
      // child --> mixinN --> mixin2 ... mixin1 --> parent
      // args[0] = child; args[len-1] = parent, args[1..len-1] = mixins[1..N] (precedence in reverse order)
      proxy = {};
      protos = new Array(len);
      args = [args[len-1], args[0]].concat(args.slice(1,len-1));

      for ( var k=len-1;k>=0;k-- ) {

         norm = normalize(args[k]);
         protos[k] = norm.prototype;
         if ( k == 1 )
            parent = norm;

         if ( typeof(args[k]) == 'function' || args[k].hasOwnProperty('constructor') ) {
            proxy = chain(proxy, { f: norm }, { functions: true } );
         }

      }

      // Create prototype chain from parent to child
      child = function () { proxy.f.apply(this, arguments); };

      csubr = function () { };
      csubr.prototype = parent.prototype;
      child.prototype = new csubr;

      // Attach static helpers
      // Merge with parent
      for ( var s in parent ) {
         if ( parent.hasOwnProperty(s) && !odefs[s] )
            odefs[s] = parent[s];
      }

      child = Factory(child, odefs);

      // Collisions with parent should not chain
      // automatically.  Override parents implementation
      // call _super() to execute parent's version
      auto = {};
      for ( var p in protos[0] ) {
         if ( typeof(protos[0][p]) == 'function' ) {
            auto[p] = !parent.prototype.hasOwnProperty(p);
         }
      }

      // Add mixins.  Also auto-chain collisions
      // call _superStop() to break the chain
      child.mix(protos.slice(2, len), { functions: true });

      // Finally, add child prototypes, only auto-chain
      // collisions with mixins
      child.mix([protos[0]], { functions: auto });

      return child;
   }

   // Define several convienece function to add
   // to new object definitions
   var Helpers = {

      extend: function () {
         return extend.apply(this, [this].concat(Array.prototype.slice.call(arguments)));
      },

      mix: function ( m, auto ) {

         var len = m.length;

         for ( var k=0;k<len;k++ ) {
            this.prototype = chain(this.prototype, m[k], auto);
         }
      }
   };

   var __GUID__ = 0;

   /***
   *
   *  Setup object definition with the static helpers (extend, mix)
   *  and wrap the constructor to ensure it is always called with
   *  "new".  If not, call it with new.  Also, set a unique ID
   *  on the instance to help with debugging.
   *
   *  @param k [ Object | Function ] Definition to setup.
   *
   *     The input will be normalized to a function/prototype.  Used
   *     in extend to setup new children.
   *
   *  @param s [ Object ] Static object methods/properties.
   *
   *     Attach the methods and/pr properties defined in the object
   *     to the new object definition.
   */
   var Factory = function ( k, s ) {

      var Klass = normalize(k),
          Static = s || {},
          P = Klass;

      Klass = (function () {

         var F = function (args) {

            if (!this._guid)
               this._guid = (++__GUID__);

            //console.log('instance checker:'+__GUID__);

            P.apply(this, args);
         }

         F.prototype = P.prototype;

         return function () {

            if ( this instanceof F || this._guid ) {
               F.call(this, arguments);
               return;
            }

            return new F(arguments);
         }

      })();

      Klass.prototype = P.prototype;

      Klass = merge( Klass, merge( Helpers, Static) );

      return Klass;
   }

   // Make the root object definition
   // Exposes extend() to build new object definitions
   //
   window.Base = Factory({});

})();
