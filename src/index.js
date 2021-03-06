'use strict';

const {SourceNode, SourceMapConsumer} = require('source-map');

function transform(source, map) {
  if (this.cacheable) {
    this.cacheable();
  }
  if (source.indexOf('React.createElement') >= 0) {
    const separator = '\n\n;';
    const appendText = `          
    var __react_jsx__ = require('react');
    var _J$X_ = (__react_jsx__.default || __react_jsx__).createElement;
  `;

    const newSource = source
    // ts and es6 "react"
      .replace(/React\.createElement\(/g, '_J$X_(')
      // transpiled react
      .replace(/_react2\.default\.createElement\(/g, '_J$X_(');

    if (!this.sourceMap || !map) {
      return this.callback(null, [
        appendText,
        newSource,
      ].join(separator));
    }

    const node = new SourceNode(null, null, null, [
      new SourceNode(null, null, this.resourcePath, appendText),
      SourceNode.fromStringWithSourceMap(newSource, new SourceMapConsumer(map)),
    ]).join(separator);

    const result = node.toStringWithSourceMap();
    return this.callback(null, result.code, result.map.toString());
  }
  return this.callback(null, source, map);
}

module.exports = transform;
