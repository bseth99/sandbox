---
layout: page
title: Using the jQuery UI Widgets Library
group: projects
---
{% include JB/setup %}

The project has various demos designed to explore building pages with jQuery UI widgets.  Most
examine a specific widget and investigate how to leverage the component to build advanced functionality.
In some cases, the widgets are extended or modified to create other solutions.

You can read more about this these tests [on my blog]({{ site.blog_url}}). 

#### Demo Pages  
  
<ul class="pages">
   {% assign pages_list = site.pages %}
   {% assign group = 'jquery-ui' %}
   {% include JB/pages_list %}
</ul>