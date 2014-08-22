# [gulpfile.js][]

[gulpfile.js]: https://github.com/thejohnfreeman/gulpfile.js

An attempt to write a single [gulpfile][gulp] suitable for most projects.

[gulp]: http://gulpjs.com/

## Install

```sh
npm install --global gulp
curl https://raw.githubusercontent.com/thejohnfreeman/gulpfile.js/master/gulpfile.js -o gulpfile.js
```

## Use

```sh
gulp [target]
```

## Targets

The default target is `build`, described below. Some targets perform differently
whether or not the `--dev` option (indicating *development build*, as opposed to
*production*) is passed on the command line.

### `copy`

1. Copies everything from the source directory (default `app`) to the
   destination directory (default `dev` for development build, `prod` for
   production).

2. All files ending in 'js', 'html', and 'css' pass through a
   [lodash][lodash-template] template parser. This step is primarily useful for
   conditional compilation:

    ```js
    <% if (dev) { %>
    // This code appears only in development builds.
    <% } else { %>
    // This code appears only in production builds.
    <% } %>
    ```

3. For a development build, symlinks `bower_components` into the destination
   directory.

4. For a production build, `index.html` receives additional
   processing. [usemin][] searches for blocks of file references (either
   `<script>`s or `<link>`s) surrounded by special tags:

   ```html
   <!-- build:type file.ext -->
   <!-- endbuild -->
   ```

   For each such block, it collects the referenced files, passes them through
   specific pipelines depending on the given type, concatenates them at some
   point, and writes the result to the given filename. Three types have been
   declared:

    - `rawjs` minifies with [uglify][], suffixes the filename with a content
      hash using [rev][], and preserves [sourcemaps][] along the way, writing
      them to a separate file with extension `.map`.
    - `js` first adds [Angular][] dependency annotations with [ngAnnotate][]
      before executing the `rawjs` pipeline.
    - `css` adds browser vendor prefixes with [autoprefixer][], minifies with
      [csso][], and suffixes the filename with rev.

[lodash-template]: http://lodash.com/docs#template
[usemin]: https://github.com/zont/gulp-usemin
[uglify]: http://lisperator.net/uglifyjs/
[rev]: https://github.com/sindresorhus/gulp-rev
[sourcemaps]: https://github.com/floridoo/gulp-sourcemaps
[ngAnnotate]: https://github.com/olov/ng-annotate
[autoprefixer]: https://github.com/postcss/autoprefixer
[csso]: https://github.com/css/csso
[Angular]: https://angularjs.org/

### `jshint`

Runs a [JSHint][] check for every JavaScript file changed since the last build.

[JSHint]: http://www.jshint.com/about/

### `wiredep`

Injects dependencies listed in `bower.json` to specially delimited sections in
`index.html` using [wiredep][], e.g.:

```html
<!-- bower:css -->
<!-- endbower -->
```

[wiredep]: https://github.com/taptapship/wiredep

### `bower`

Installs [Bower][] dependencies. Runs before every build.

[Bower]: http://bower.io/

### `serve`

Serves out of the destination directory on a random port, or a specific port if
the `--port` option is used.

### `watch`

Starts a [LiveReload][] server and watches for file changes. If `bower.json`
changes, it automatically runs the `wiredep` target. If a file in the source
directory changes, it will rebuild the destination directory, and then refresh
any browsers connected to the LiveReload server.

[LiveReload]: http://livereload.com/

### `clean`

Removes the `dev`, `prod`, and `bower_components` directories.

