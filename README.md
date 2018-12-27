# concept-network [![Build Status](https://img.shields.io/travis/parmentf/node-concept-network.svg?style=flat-square)](http://travis-ci.org/parmentf/node-concept-network) [![codecov coverage](https://img.shields.io/codecov/c/github/parmentf/node-concept-network.svg?style=flat-square)](https://codecov.io/github/parmentf/node-concept-network) [![NPM version](https://img.shields.io/npm/v/concept-network.svg?style=flat-square)](http://badge.fury.io/js/concept-network) [![bitHound Overall Score](https://www.bithound.io/github/parmentf/node-concept-network/badges/score.svg)](https://www.bithound.io/github/parmentf/node-concept-network)

Concept Network is weighted directed graph, in which activation values are propagated. Written in [Node.js](http://nodejs.org).

## Getting Started

Install the module with: `npm install concept-network`

TODO: Update this example

```javascript
var ConceptNetwork = require('concept-network').ConceptNetwork;
var ConceptNetworkState = require('concept-network').ConceptNetworkState;
var cn = new ConceptNetwork();
var cns = new ConceptNetworkState(cn);
var node1 = cn.addNode("ECTOR");
var node2 = cn.addNode("knows");
var node3 = cn.addNode("Achille");
cn.addLink(node1.id, node2.id);
cn.addLink(node2.id, node3.id);
cns.activate(node1.id);
cns.propagate();
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint, and test your code using `npm test`.

## Release History

See also [Releases](https://github.com/parmentf/node-concept-network/releases)

* 2081/12/27: version 1.2.2: Go back to synchronous ConceptNetwork
* 2015/11/28: version 1.2.1: Update dependencies versions
* 2015/02/20: version 1.2.0: Add options to propagate()
* 2015/02/07: version 1.1.0: Make getLink accept two parameters
* 2015/02/07: version 1.0.0: Go to semantic versioning, add increments to addLink and addNode
* 2014/08/07: version 0.1.4: fix some error cases with injector
* 2013/01/05: version 0.1.3: add ConceptNetworkState.getMaximumValue() and ConceptNetworkState.getActivatedTypedNodes()
* 2013/01/03: version 0.1.2: add ConceptNetworkState

Warning: this is a work in progress.

## License

Copyright (c) 2012 François Parmentier
Licensed under the MIT license.
