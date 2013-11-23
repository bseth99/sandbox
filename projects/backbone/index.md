---
layout: page
title: Building Applications with Backbone
group: projects
---
{% include JB/setup %}

The project has various demos using Backbone to build different proof-of-concepts
that can serve as a foundation for more elaborate applications.

You can read more about this these tests [on my blog]({{ site.blog_url}}/search/label/backbone). 

#### Tables, Sorting, and Analytical Reporting 
 
One of the applications I thought was a good place to use Backbone was a small
reporting app that needed to provide sorting and some analytical capabilities. 
Below is a progression of building a concept from basic templates all the way through
the final demo complete with animated graphs and selectable comparison statistics.

<ul class="pages">
   {% assign pages_list = site.pages %}
   {% assign group = 'backbone-table' %}
   {% include JB/pages_list %}
</ul>


#### Forms and Widgets 
 
At some point in time, editing the data in a model might be desirable.  Using existing
widget libraries like jQuery UI will make it easier to build these screens.  Figuring out
how to integrate them and move data in and out of the form can be challenging.

<ul class="pages">
   {% assign pages_list = site.pages %}
   {% assign group = 'backbone-form' %}
   {% include JB/pages_list %}
   
   <li><a href="computed"></a>Formatting Dates with Moment as Backbone Computed Fields</li>
</ul>
