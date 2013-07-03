Raphaël.js - Radar
=================

twb/raphael-radar is an extended version of
[Raphael-Radar](https://github.com/ono/Raphael-Radar)

ono/raphael-radar is a refactored version of
[Raphael-Radar](https://github.com/tnzk/Raphael-Radar)

![Screen Shot](https://github.com/twb/raphael-radar/raw/master/example/images/screenshot2.png)

The objectives are...

* Add a range score group.
* Enhance customization for charging changes.
* Add relevant ids to SVG elements for CSS styling.
* Update example.
* Make chart responsive to container element.

Please note that there is no compatibility with the original version or the ono updated version.

Example
-------

Raphael-Radar now has the option to maintain all content & style options through the objects passed to radarchart, instead of using a separate 'scores' array or manually manipulating the Raphaël chart.

Style options are maintained through the draw_options object. See `default_draw_options` in raphael-radar.js for defaults. All attributes are passed directly to Raphaël via `attr()` so you can set pretty much whatever attributes you'd like on lines, points and text.

The following chart can be created using the code below it, and you no longer need to edit the lines and points manually.

![Screen Shot](https://github.com/twb/raphael-radar/raw/master/example/images/screenshot2.png)

    
**Note: While the example below works great, I (jsoma) would recommend using the code above or looking at the most recently updated on under /examples in this project**

<!-- Seeing example is always the best way to understand how it works. Here is an
[example](http://o1123.com/raphael-radar/example/index.html). 

I am thinking of making the page nicer and adding an example to handling events
on the chart near future.


TODO
----

* Better example page with code view.
* License information.

-->

Special Thanks to
-----------------

* ![Jonathan Soma](https://github.com/jsoma)
* KURAZEKO Kyohe for original version.
* Yoshihide Tsuda for designing a rich version of sample chart.

