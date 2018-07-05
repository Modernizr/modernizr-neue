

<a name="what-is-modernizr"></a>
## What is Modernizr?
Modernizr is a small piece of JavaScript code that automatically detects the availability of next-generation web technologies in your user's browsers. Rather than blacklisting entire ranges of browsers based on “<abbr title="User Agent">UA</abbr> sniffing,” Modernizr uses [feature detection](#what-is-feature-detection) to allow you to easily tailor your user's experiences based on the _actual capabilities_ of their browser.

With this knowledge that Modernizr gives you, you can take advantage of these new features in the browsers that can render or utilize them, and still have easy and reliable means of controlling the situation for the browsers that cannot.

<a name="what-is-feature-detection"></a>
## What is feature detection?
In the dark ages of web development, we often had to resort to <abbr title="User Agent">UA</abbr> sniffing in order to determine if their users would be able to make use of _Awesome-New-Feature_&trade;. In practice, that means doing something like the following

```javascript
  if (browser === "the-one-they-make-you-use-at-work") {
    getTheOldLameExperience();
  } else {
    showOffAwesomeNewFeature();
  }
```

Now that _looks_ ok, right? We are using _Awesome-New-Feature_&trade;, and of course it isn't supported in an old crusty browser like that, right? That could very well be the case - today.
But what if the next version of that browser adds support for _Awesome-New-Feature_&trade;? Now you have to go back and audit your code, updating every single place that you are doing this check. That is assuming that you have the time to find out about every feature update for every single browser. Worse still, until you realize that it actually works in the newest version, all of those users back at the office `getTheOldLameExperience`, for no reason whatsoever.

Those users - given a substandard website for apparently no reason - can actually go into their browser and <abbr title="Operating System">OS</abbr> settings and change the name of the browser (or `user-agent` - what we compare against in code when performing a UA sniff) to whatever they would like. At that point - your code is meaningless. You are blocking out users who may actually support all of your features, and possibly letting those in who don't. Nearly everyone gets a broken experience. There has to be a better way!

There is, and it is called `Feature Detection`, and it looks more like this

```javascript
  if (Modernizr.awesomeNewFeature) {
    showOffAwesomeNewFeature();
  } else {
    getTheOldLameExperience();
  }
```

Rather than basing your decisions on whether or not the user is on the `one-they-make-you-use-at-work` browser, and assuming that means they either do or do not have access to _Awesome-New-Feature_&trade;, feature detection actually programmatically checks if _Awesome-New-Feature_&trade; works in the browser, and gives you either a `true` or `false` result. So now as soon as your least favorite browser adds support for _Awesome-New-Feature_&trade;, your code works there - automatically! No more having to update, ever. The code ends up being similar, but much more clear to its actual intention

## Downloading Modernizr

A lot has changed since the last version of Modernizr. There no longer is a single, base `modernizr.js` file. Instead, just head over to the [Download](/download) page as you could have previously, and select the features you want to use in your project. This way we can provide the smallest file possible, which means a faster website for you. Once you have done that, just hit the `Build` button and you’ve got your own custom build of Modernizr, hot off the presses!

You may notice that in addition to the `Build` output, where you have been able to download custom builds one at a time for years now - there are two new options.

#### Command Line Config

Since 3.0, Modernizr also ships its build system as a [node](https://nodejs.org/) module on [npm](https://npmjs.org). That means that you can quickly create multiple builds of Modernizr for different projects, without even having to open a new browser tab.

Once you have [npm installed](https://docs.npmjs.com/getting-started/installing-node), you can install the Modernizr command line tool by running

```
npm install -g modernizr
```

Now you are ready to get your start making your custom build! You can download the configuration file from the build menu (under "Command Line Config"). This will give you a [JSON](http://simple.wikipedia.org/wiki/JSON) file that you will give to the Modernizr module to make your custom build.

```
modernizr -c modernizr-config.json
```

<sub>Note that you will need to give the command line config the file path to the configuration you downloaded from the site. In the above example, we are running the `modernizr` command from the same folder that we downloaded the `modernizr-config.json` file to.</sub>

#### Grunt Config
If you do not want to manually run your build from the command line every time you update your site, you also have the option to download a [Grunt](http://gruntjs.com/) task to do it for you. This configuration file can be used with [grunt-modernizr](https://www.npmjs.com/package/grunt-modernizr) to automatically build your custom version. Just add it to your [Gruntfile](http://gruntjs.com/sample-gruntfile), and you are off to the races.

<sub>Note that you will need to update the provided configuration file with paths to the `devFile` and `outputFile`. More documentation is available for grunt-modernizr [here](https://github.com/modernizr/grunt-modernizr#getting-started)</sub>

#### Configuration Options

In addition to the available options and feature detects, there are a handful of additional configuration options.

`classPrefix` - _default: `""`_

A string that is added before each CSS class.


`enableJSClass` - _default: `true`_

Whether or not to update `.no-js` to `.js` on the root element.


`enableClasses` - _default: `true`_

Whether or not Modernizr should add its CSS classes at all


See the next section for more information on those options

## Using Modernizr with CSS


#### Modernizr's classes

By default, Modernizr sets classes for all of your tests on the root element (`<html>` for websites). This means adding the class for each feature when it is supported, and adding it with a `no-` prefix when it is not (e.g. `.feature` or `.no-feature`). This makes it super simple to add features in via progressive enhancement!

Say you include Modernizr's detection for CSS gradients. Depending on the browser, it will result in either `<html class="cssgradients">` or `<html class="no-cssgradients">`. Now that you know those two states, you can write CSS to cover both cases

```css
.no-cssgradients .header {
  background: url("images/glossybutton.png");
}

.cssgradients .header {
  background-image: linear-gradient(cornflowerblue, rebeccapurple);
}
```

#### classPrefix

If one of Modernizr's class names clashes with one of your preexisting classes, you have the option to add a `classPrefix` inside of [your config](#command-line-config). Consider the [hidden](https://github.com/Modernizr/Modernizr/blob/7b8c0f/feature-detects/dom/hidden.js) detect, which adds a `.hidden` class - something a lot of code bases already use to, well, _hide_ things. If you wanted to use that specific detection, you could use the following as your configuration

```json
{
  "classPrefix": "foo-",
  "feature-detects": ["dom/hidden"]
}
```

This would mean that rather than `<html class="hidden">`, you would get `<html class="foo-hidden">`.


#### no-js
By default, Modernizr will rewrite `<html class="no-js">` to `<html class="js">`. This lets hide certain elements that should only be exposed in environments that execute JavaScript. If you want to disable this change, you can set `enableJSClass` to `false` in [your config](#command-line-config).


#### enableClasses

If you are using a `classPrefix`, such as `supports-`, then you must include that prefix on your `html` element. ie. `supports-no-js` instead of `no-js`.


Finally, if you do not want Modernizr to add any of its classes, you can set `enableClasses` to `false`. This is _does not_ affect the `.no-js` update, so if you do not want that updated either you will need to set `enableJSClass` to `false` in your configuration.


## Using Modernizr with JavaScript

#### The Modernizr object

Modernizr keeps track of the results of all of its feature detections via the `Modernizr` object. That means that for each test, a corresponding property will be added. You just have to test for [truthiness](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) in your code to figure out what you want to do

```javascript
  if (Modernizr.awesomeNewFeature) {
    showOffAwesomeNewFeature();
  } else {
    getTheOldLameExperience();
  }
```

#### Helper methods

Modernizr optionally exposes a number of additional functions, that you can read more about in [Modernizr API](#modernizr-api)

## Modernizr API
