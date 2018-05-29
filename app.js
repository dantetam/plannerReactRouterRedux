/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var errorHandler = require('errorhandler');
var logger = require('morgan');

var React = require('react');
var ReactDOMServer = require('react-dom/server');
var assign = require('object-assign');
var _escaperegexp = require('lodash.escaperegexp');

// This should refer to the local React and gets installed via `npm install` in
// the example.
// var reactViews = require('express-react-views');

var DEFAULT_OPTIONS = {
  doctype: '<!DOCTYPE html>',
  beautify: false,
  transformViews: true,
  babel: {
    presets: [
      'react',
      [
        'env',
        {
          targets: {
            node: 'current',
          },
        },
      ],
    ],
  },
};

function createEngine(engineOptions) {
  var registered = false;
  var moduleDetectRegEx;

  engineOptions = assign({}, DEFAULT_OPTIONS, engineOptions || {});

  function renderFile(filename, options, cb) {
    // Defer babel registration until the first request so we can grab the view path.
    if (!moduleDetectRegEx) {
      // Path could contain regexp characters so escape it first.
      // options.settings.views could be a single string or an array
      moduleDetectRegEx = new RegExp(
        []
          .concat(options.settings.views)
          .map(viewPath => '^' + _escaperegexp(viewPath))
          .join('|')
      );
    }

    if (engineOptions.transformViews && !registered) {
      // Passing a RegExp to Babel results in an issue on Windows so we'll just
      // pass the view path.
      require('babel-register')(
        assign({only: options.settings.views}, engineOptions.babel)
      );
      registered = true;
    }

    try {
      var markup = engineOptions.doctype;
      var component = require(filename);
      // Transpiled ES6 may export components as { default: Component }
      component = component.default || component;
      markup += ReactDOMServer.renderToStaticMarkup(
        React.createElement(component, options)
      );
    } catch (e) {
      return cb(e);
    } finally {
      if (options.settings.env === 'development') {
        // Remove all files from the module cache that are in the view folder.
        Object.keys(require.cache).forEach(function(module) {
          if (moduleDetectRegEx.test(require.cache[module].filename)) {
            delete require.cache[module];
          }
        });
      }
    }

    if (engineOptions.beautify) {
      // NOTE: This will screw up some things where whitespace is important, and be
      // subtly different than prod.
      markup = beautifyHTML(markup);
    }

    cb(null, markup);
  }

  return renderFile;
}

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', createEngine);
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

app.locals.something = 'value';
app.locals.qaz = 'qut';

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
