---
layout: post
title:  How Does Modernizr’s Test Suite Work?
author: Modernizr
---

Sometimes, members of the team get asked how we ascertain and verify that the features we detect are accurately detected. It’s not always a simple process, but over time we’ve put together a test suite that helps us out a lot.

Paul has recorded a screencast discussing how this test suite for Modernizr was built. The brief summary: initially built with QUnit, the test suite has coverage over the full API surface area of Modernizr, even using kangax’s <a href="https://github.com/kangax/detect-global">detect-global</a> script to assure no globals are introduced beyond `Modernizr` and `yepnope`. After that it gets interesting—as verifying the results from Modernizr’s detection of the current browser’s features isn’t straightforward. We end up using APIs from both Caniuse.com and GitHub, using projects like Lloyd Hilaiel’s <a href="http://jsonselect.org/">JSONSelect</a>, Lindsey Simon's <a href="https://github.com/tobie/ua-parser">ua-parser</a> (ported to Node by <a href="http://twitter.com/tobie">@tobie</a>), some ES5 polyfills, and some real sexy jQuery Deferred action to elegantly handle a bunch of `$.getScript` calls.

20 minutes of javascript and feature detection action below.

<iframe title="Modernizr's test suite: Behind the Scenes" width="640" height="480" src="https://www.youtube.com/embed/Mbt6h1BFW8g?feature=player_embedded" frameborder="0" allowfullscreen></iframe>
