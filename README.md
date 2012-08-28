
Ben's Sandbox Site
==================

This is the repository for my sandbox site that contains various demos and examples
that don't really fit any main projects I'm working on.  Most of it is a scratch pad that
might roll into a project or be parts I need to test out more.  Generally, my blog 
[BenKnowsCode](http://benknowscode.wordpress.com/) will reference this site.

I wanted to try out Jekyll to create a site on GitHub, so this serves as a test bed for that
experience as well

### Why is the source here?

Good question.  

Answer: I wanted tags to work on pages like they do on posts.  That required some custom
Jekyll plugins to add that functionality.  GitHub disables the plugins on the Pages site
so you can't use the automatic render to generate your site.  Instead, I setup this repo
to hold the source and push the generated content to my Pages repo.  See the _plugins
directory to see the changes I made.  You can also read about the 
[experience on my blog](http://benknowscode.wordpress.com/2012/08/28/using-jekyll-to-create-a-site-on-github).