"use strict";

var models = require('re-models');
var path = require('path');
var rootLoc = path.dirname(require.resolve('./index.js'));
var confLoc = path.join(rootLoc, 'conf');
var dataLoc = path.join(rootLoc, 'data');
var miscLoc = path.join(rootLoc, 'misc');
var docsLoc = path.join(rootLoc, 'docs');

var confUtil = require('re-conf-util');

module.exports = confUtil.prepareConf(confLoc, dataLoc, 'reflective', [ models ], miscLoc, docsLoc);
