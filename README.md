# backgroundImage plugin

This is a plugin for [smart-mirror](https://github.com/evancohen/smart-mirror/).

This plugin supports displaying pictures as the background of the smart-mirror page

the pictures/images must be placed in the plugins/backgroundImage folder, but for those who don't want to copy their files or they are on a server, you can use a symbolic link into the backgroundImage folder

you can also combine multiple sources of images.  this folder and that folder, make multiple symbolic links, and define all of them in the smart-mirror config screen section for this plugin

Example background with maintain and Blur

![example with maintain and blur](https://github.com/sdetweil/backgroundImage/blob/master/example_usage.png)
```

## Installing the plugin

To install the plugin, assuming you have smart-mirror installed and running

```
open a terminal window (via ssh, or some other mechanism)
cd ~/smart-mirror/plugins
git clone https://github.com/sdetweil/backgroundImage.git
cd backgroundImage
copy your files to a folder here or
make symbolic links (remember the folder names)
```


## Configuration options
open the smart-mirror config panel, or press submit if already open to detect and load new plugins

expand the selection for #Background Image source configuration in the smart-mirror config panel
(press the * gear icon on the top bar of the smart-mirror remote admin page
  http://smart-mirror_ip:port (default 8080)



#### plugin specific options:

| Option           | Description
|----------------- |-----------
| `cycle rate`     |  how often to change images, in seconds
| `image size`     |  how to display the image
|                  |  `maintain`  use the images aspect ration to insure than ALL of the image is displayed|   
|                  |  note: this may leave areas on the screen that are not covered by an image
|                  |  `fill`  stretch the image to cover the entire screen, this will cause some distortion of the image |
| `shuffle`        |  whether to shuffle the collection of images (`checked`) or as listed in the file system (`unchecked`)
|   | if `checked` all sources will be merged before shuffling the list, <br>if `unchecked` each sources images will be listed in order <br>note: there is no indication which source the image came from during display
| `Background Color`| some hex or decimal nmumber used to fill the area around pictures when in imagesize=maintain mode. (if u don't like black).. <br>a medium gray is #808080 for example.<br> use a color wheel from the internet to find the color values u like
|`Background fill with image`| if checked instead of `Background Color` a blurred version of the same image will be used to fill the unused space.
|`Blur size` |  the siae of the distortion of the background image blur.. the bigger the number the less sharp the surrounding image will be..   8, 16 or 24 seems to be good choices,  this is NOT a selection box, so be careful!
| `Image sources` | an expandable area to define the sources of images. hit the + button to create a n source entry, name and path (relative to the plugin folder) <br> to delete a source, select its tab, and hit the minus sign , <br> You can also change the order of the sources, using drag drop, just select the 4 bar menu item at the top left of the entry and drag it up or down to change its position in th list . in NON shuffle mode, this will change which images are displayed first after each refresh <br>  there is no impact on performance, as only 2 images at a time might be loaded concurrently.
| |   `Name` (required) altho not 'used' currently, some label to help u remember what these images represent
|| `path` the file path to the folder , from the plugin folder <br> for example, if <selected_pics is a folder in the backgroundImage plugin folder, then that is the path
|
| saving configuration |when you are done completing this configuration, press submit to turn on display of the pictures

# final configuration

# smart-mirror v0.27 and up has a dynamic plugin placement feature, with automatic plugin detection

* after completing the configuration above,
you need to add the plugin to the plugin placement info in the `Plugin Page location configuration` section. (if you don't do it now, you can come back to the confg panel at any time to add this.. <br>
------in the meantime the default placement will overlay  the command area)------
* expand the `Plugin Page location configuration` section
* hit the + key for a new entry
* type `backgroundImage` for the plugin name
* select `fullscreen` from the location dropbox
* check the active checkbox
* hit the `Submit` button to save the Configuration


#### Default configuration:

none
