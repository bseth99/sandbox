---
layout: default
title: jQuery UI Demo - Custom ColorBox Widget
group: projects
---
{% include JB/setup %}

<h3>{{ page.title }}</h3>
<br/>

ColorBox is a simple jQuery UI based widget to demostrate the how to construct a custom
UI widget from the jQuery UI framework.  Each part progresses to add functionality and
address various issues and ideas about how to extend and work with this framework.
You can read more about this demo [on my blog](http://benknowscode.wordpress.com/category/projects/jquery-ui-widgets/)

#### Demo Pages  
  
<ul class="pages">
   {% assign pages_list = site.pages %}
   {% assign group = 'colorbox' %}
   {% include JB/pages_list %}
</ul>