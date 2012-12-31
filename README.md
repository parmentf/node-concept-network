# concept-network [![Build Status](https://secure.travis-ci.org/parmentf/node-concept-network.png)](http://travis-ci.org/parmentf/node-concept-network)

Concept Network is weighted directed graph, in which activation values are propagated. Written in [Node.js](http://nodejs.org).

## Getting Started
Install the module with: `npm install concept-network`

```javascript
var ConceptNetwork = require('concept-network').ConceptNetwork;
var cn = new ConceptNetwork();
var node1 = cn.addNode("ECTOR");
var node2 = cn.addNode("knows");
var node3 = cn.addNode("Achille");
cn.addLink(node1.id, node2.id);
cn.addLink(node2.id, node3.id);
```

## Documentation
_(Coming soon)_

## Examples
_(Coming soon)_

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint, and test your code using [mocha](http://visionmedia.github.com/mocha/).

## Release History
_(Nothing yet)_
Warning: this is a work in progress.

## License
Copyright (c) 2012 François Parmentier  
Licensed under the MIT license.
