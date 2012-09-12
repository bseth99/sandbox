/*

Adapted from C code posted at:
http://free.pages.at/easyfilter/bresenham.html
Copyright © Alois Zingl, Vienna, Austria

*/


function plotLine(x0, y0, x1, y1, step)
{
  var step = step || 5,
      ctr = 0,
      dx =  Math.abs(x1-x0),
      sx = x0<x1 ? 1 : -1,
      dy = -Math.abs(y1-y0),
      sy = y0<y1 ? 1 : -1,
      err = dx+dy, e2,
      out = []; /* error value e_xy */

  for(;;){  /* loop */
    if (ctr++%step == 0)
       out.push({x:x0,y:y0});

    if (x0==x1 && y0==y1) break;
    e2 = 2*err;
    if (e2 >= dy) { err += dy; x0 += sx; } /* e_xy+e_x > 0 */
    if (e2 <= dx) { err += dx; y0 += sy; } /* e_xy+e_y < 0 */
  }

  return out;
}

function plotCircle(xm, ym, r, step)
{
   var step = step || 5,
       ctr = 0,
       x = -r,
       y = 0,
       err = 2-2*r, /* II. Quadrant */
       out = {q1: [], q2: [], q3: [], q4: []};
   do {
      if (ctr++%step == 0) {
         out.q1.push({x:xm-x, y:ym+y}); /*   I. Quadrant */
         out.q2.push({x:xm-y, y:ym-x}); /*  II. Quadrant */
         out.q3.push({x:xm+x, y:ym-y}); /* III. Quadrant */
         out.q4.push({x:xm+y, y:ym+x}); /*  IV. Quadrant */
      }
      r = err;
      if (r <= y) err += ++y*2+1;           /* e_xy+e_y < 0 */
      if (r > x || err > y) err += ++x*2+1; /* e_xy+e_x > 0 or no 2nd y-step */
   } while (x < 0);

  return [].concat(out.q1, out.q2, out.q3, out.q4);
}

function plotEllipseRect(x0, y0, x1, y1, step)
{
   var step = step || 5,
       ctr = 0,
       a = Math.abs(x1-x0),
       b = Math.abs(y1-y0),
       b1 = b&1, /* values of diameter */
       dx = 4*(1-a)*b*b,
       dy = 4*(b1+1)*a*a, /* error increment */
       err = dx+dy+b1*a*a,
       e2, /* error of 1.step */
       out = [];

   if (x0 > x1) { x0 = x1; x1 += a; } /* if called with swapped points */
   if (y0 > y1) y0 = y1;        /* .. exchange them */
   y0 += (b+1)/2; y1 = y0-b1;   /* starting pixel */
   a *= 8*a; b1 = 8*b*b;

   do {
      if (ctr++%step == 0) {
          out.push({x:x1, y:y0}); /*   I. Quadrant */
          out.push({x:x0, y:y0}); /*  II. Quadrant */
          out.push({x:x0, y:y1}); /* III. Quadrant */
          out.push({x:x1, y:y1}); /*  IV. Quadrant */
      }
       e2 = 2*err;
       if (e2 <= dy) { y0++; y1--; err += dy += a; }  /* y step */
       if (e2 >= dx || 2*err > dy) { x0++; x1--; err += dx += b1; } /* x step */
   } while (x0 <= x1);

   while (y0-y1 < b) {  /* too early stop of flat ellipses a=1 */
      if (ctr++%step == 0) {
         out.push({x:x0-1, y:y0}); /* -> finish tip of ellipse */
         out.push({x:x1+1, y:y0++});
         out.push({x:x0-1, y:y1});
         out.push({x:x1+1, y:y1--});
      }
   }

   return out;
}

function plotBasicBezier(x0, y0, x1, y1, x2, y2, step)
{
  var step = step || 5,
      ctr = 0,
      sx = x2-x1,
      sy = y2-y1,
      xx = x0-x1,
      yy = y0-y1,
      xy,         /* relative values for checks */
      dx,
      dy,
      err,
      cur = xx*sy-yy*sx,                    /* curvature */
      out = [];

  //assert(xx*sx <= 0 && yy*sy <= 0);  /* sign of gradient must not change */

  if (sx*sx+sy*sy > xx*xx+yy*yy) { /* begin with longer part */
    x2 = x0; x0 = sx+x1; y2 = y0; y0 = sy+y1; cur = -cur;  /* swap P0 P2 */
  }
  if (cur != 0) {                                    /* no straight line */
    xx += sx; xx *= sx = x0 < x2 ? 1 : -1;           /* x step direction */
    yy += sy; yy *= sy = y0 < y2 ? 1 : -1;           /* y step direction */
    xy = 2*xx*yy; xx *= xx; yy *= yy;          /* differences 2nd degree */
    if (cur*sx*sy < 0) {                           /* negated curvature? */
      xx = -xx; yy = -yy; xy = -xy; cur = -cur;
    }
    dx = 4.0*sy*cur*(x1-x0)+xx-xy;             /* differences 1st degree */
    dy = 4.0*sx*cur*(y0-y1)+yy-xy;
    xx += xx; yy += yy; err = dx+dy+xy;                /* error 1st step */
    do {
      if (ctr++%step == 0)
         out.push({x:x0,y:y0});              /* plot curve */
      if (x0 == x2 && y0 == y2) return out;  /* last pixel -> curve finished */
      y1 = 2*err < dx;                  /* save value for test of y step */
      if (2*err > dy) { x0 += sx; dx -= xy; err += dy += yy; } /* x step */
      if (    y1    ) { y0 += sy; dy -= xy; err += dx += xx; } /* y step */
    } while (dy < 0 && dx > 0);   /* gradient negates -> algorithm fails */
  }

  out = out.concat(plotLine(x0,y0,x2,y2,step));  /* plot remaining part to end */

  return out;
}
