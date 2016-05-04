# Content Layout Control

Content Layout Control is a lightweight framework for WordPress developers who
want to add _bespoke_, _limited_ and _carefully ringfenced_ content layout
features to their themes.

## Using the framework

Content Layout Control must be deliberately built into a theme. A demo theme is coming soon.

The recommended development workflow is to include the repository as a git submodule in your
theme and then build the files there. You will need [npm](https://www.npmjs.com/) and [grunt](http://gruntjs.com/).

```
$ git submodule add https://github.com/NateWr/content-layout-control.git
$ cd content-layout-control
$ npm install
$ grunt build
```

This produces a `dist` directory with the compiled files that should be included in your theme.

I'll prepare package releases that can be dropped in directly if you're not familiar with git submodules, npm or grunt.

## Example Theme

Take a look at the [demo theme](https://github.com/NateWr/clc-demo-theme).
