# concept-network [![Build Status](https://secure.travis-ci.org/parmentf/node-concept-network.png)](http://travis-ci.org/parmentf/node-concept-network) [![NPM version](https://badge.fury.io/js/concept-network.png)](http://badge.fury.io/js/concept-network)

Concept Network is weighted directed graph, in which activation values are propagated. Written in [Node.js](http://nodejs.org).

## Getting Started
Install the module with: `npm install concept-network`

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

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint, and test your code using [mocha](http://visionmedia.github.com/mocha/).

## Release History

* 2014/08/07: version 0.1.4: fix some error cases with injector
* 2013/01/05: version 0.1.3: add ConceptNetworkState.getMaximumValue() and ConceptNetworkState.getActivatedTypedNodes()
* 2013/01/03: version 0.1.2: add ConceptNetworkState 

Warning: this is a work in progress.

## License
Copyright (c) 2012 François Parmentier  
Licensed under the MIT license.
