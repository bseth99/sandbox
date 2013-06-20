/*
HTMLEncode - Encode HTML special characters.
Copyright (c) 2006-2010 Thomas Peri, http://www.tumuski.com/
MIT License
*/

/*jslint white: true, onevar: true, undef: true, nomen: true, eqeqeq: true,
   plusplus: true, bitwise: true, regexp: true, newcap: true, immed: true */

/**
 * HTML-Encode the supplied input
 *
 * Parameters:
 *
 * (String)  source    The text to be encoded.
 *
 * (boolean) display   The output is intended for display.
 *
 *                     If true:
 *                     * Tabs will be expanded to the number of spaces
 *                       indicated by the 'tabs' argument.
 *                     * Line breaks will be converted to <br />.
 *
 *                     If false:
 *                     * Tabs and linebreaks get turned into &#____;
 *                       entities just like all other control characters.
 *
 * (integer) tabs      The number of spaces to expand tabs to.  (Ignored
 *                     when the 'display' parameter evaluates to false.)
 *
 * version 2010-11-08
 */
var htmlEncode = function (source, display, tabs) {
   var i, s, ch, peek, line, result,
      next, endline, push,
      spaces;

   // Stash the next character and advance the pointer
   next = function () {
      peek = source.charAt(i);
      i += 1;
   };

   // Start a new "line" of output, to be joined later by <br />
   endline = function () {
      line = line.join('');
      if (display) {
         // If a line starts or ends with a space, it evaporates in html
         // unless it's an nbsp.
         line = line.replace(/(^ )|( $)/g, '&nbsp;');
      }
      result.push(line);
      line = [];
   };

   // Push a character or its entity onto the current line
   push = function () {
      if (ch < ' ' || ch > '~') {
         line.push('&#' + ch.charCodeAt(0) + ';');
      } else {
         line.push(ch);
      }
   };

   // Use only integer part of tabs, and default to 4
   tabs = (tabs >= 0) ? Math.floor(tabs) : 4;

   result = [];
   line = [];

   i = 0;
   next();
   while (i <= source.length) { // less than or equal, because i is always one ahead
      ch = peek;
      next();

      // HTML special chars.
      switch (ch) {
      case '<':
         line.push('&lt;');
         break;
      case '>':
         line.push('&gt;');
         break;
      case '&':
         line.push('&amp;');
         break;
      case '"':
         line.push('&quot;');
         break;
      case "'":
         line.push('&#39;');
         break;
      default:
         // If the output is intended for display,
         // then end lines on newlines, and replace tabs with spaces.
         if (display) {
            switch (ch) {
            case '\r':
               // If this \r is the beginning of a \r\n, skip over the \n part.
               if (peek === '\n') {
                  next();
               }
               endline();
               break;
            case '\n':
               endline();
               break;
            case '\t':
               // expand tabs
               spaces = tabs - (line.length % tabs);
               for (s = 0; s < spaces; s += 1) {
                  line.push(' ');
               }
               break;
            default:
               // All other characters can be dealt with generically.
               push();
            }
         } else {
            // If the output is not for display,
            // then none of the characters need special treatment.
            push();
         }
      }
   }
   endline();

   // If you can't beat 'em, join 'em.
   result = result.join('<br />');

   if (display) {
      // Break up contiguous blocks of spaces with non-breaking spaces
      result = result.replace(/ {2}/g, ' &nbsp;');
   }

   // tada!
   return result;
};
