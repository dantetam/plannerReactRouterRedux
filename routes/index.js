/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('./js/index', {title: 'Express', foo: {bar: 'baz'}});
};
