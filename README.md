**Chase-images**
================
A firefox extension to quickly download check images from Chase.

**Motivation**
--------------
If you're like me, then you love the fact that Chase allows you to access check images online.  Not just checks that you wrote, either.
Checks you deposited, too.  But it irks you that the website is slow and it takes a long time to do it manually.

This extension will automate the process for you.

**Usage**
---------
You can download the XPI file from the releases section.  In Firefox, go to Add-ons, click the gear icon and "Install add-on from file".

Once installed, you need to configure the add-on to choose the destination directory for your images.

Then, log in to Chase and go to your account page, which should look like this:

![Chase account screenshot](https://raw.githubusercontent.com/abjennings/chase-images/master/images/screenshot.png)

click the "Chase" text in the add-on bar:

![Add-on bar screenshot](https://raw.githubusercontent.com/abjennings/chase-images/master/images/button.png)

The extension will take control and download all check images on the visible page.  It downloads both debited check images and deposited check images.  It takes inventory of the destination directory first and skips any images that are already downloaded.

**Todo**
--------
 - Stop if process stalls for 30 seconds and show an error
 - Should the button disappear or be disabled if you're not on the Chase activity page?
 - Abort if "configure directory" error or image otherwise doesn't succeed
 - Add LICENSE file to this repository
