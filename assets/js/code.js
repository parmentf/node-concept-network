$(function(){ // on dom ready

var ConceptNetwork = require('concept-network').ConceptNetwork;
var ConceptNetworkState = require('concept-network').ConceptNetworkState;

var cn = window.cn = new ConceptNetwork();
var cns = window.cns = new ConceptNetworkState(cn);

var options = {
  layout: {
    name: 'cose',
    padding: 10
  },

  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'width': 'mapData(occ, 1, 10, 50, 100)',
        'shape': 'rectangle',
        'content': 'data(id)',
        'text-valign': 'center',
        'text-outline-width': 1,
        'text-outline-color': 'mapData(value, 0,100, grey, red)',
        'background-color': 'mapData(value, 0,100, grey, red)',
        'color': 'white'
      })

    .selector('edge')
      .css({
        'width': 'mapData(cooc, 1, 10, 2, 5)',
        'target-arrow-shape': 'triangle'
      })

    .selector(':selected')
      .css({
        'border-width': 3,
        'border-color': '#333'
      }),

  elements: {
    nodes: [
      { data: { id: 'a', occ: 1, value: 100 } },
      { data: { id: 'b', occ: 1, value: 0 } }
    ],
    edges: [
      { data: { id: 'ab', source: 'a', target: 'b', cooc: 1 } }
    ]
  },

  ready: function() {
    window.cy = this;

    cy.on('select', 'node', function(e) {
      console.log('select node',e.cyTarget.data());
      var data = e.cyTarget.data();
      Object.keys(data).forEach(function (key) {
        var value = data[key];
        if (key === 'value') {
          value = Math.round(value);
        }
        $('#info').append("<li>" + key+":"+value + "</li>");
      });
      $('#activate-btn').prop('disabled',false);
    });

    cy.on('unselect', 'node', function(e) {
      $('#info').text("");
      $('#activate-btn').prop('disabled',true);
    });

    $('#propagate-btn').click(function () {
      var nodes = cy.nodes();
      cns.propagate();
      for (i=0; i < nodes.length; i++) {
        var av = cns.getActivationValue(nodes[i].data('cnId'));
        nodes[i].data('value',av);
      }
    });

    $('#activate-btn').click(function () {
      console.log('activate');
      var cyNode = cy.nodes(':selected')[0];
      var cnNode = cn.getNode(cyNode.data('id'));
      cns.activate(cnNode.id);
      cyNode.data('value', 100);
      cyNode.unselect().select();
    });

    // Add one node, and one edge
    cy.add([
      { group: 'nodes', data: { id: 'c', occ: 2, value: 0} },
      { group: 'edges', data: { id: 'bc', source: 'b', target: 'c', cooc: 1 } }
    ]);

    cy.layout({ name: 'cose' });

    // Copy Cytoscape network into ConceptNetwork
    var nodes = cy.nodes();
    for (var i=0; i < nodes.length; i++) {
      var node = cn.addNode(nodes[i].data('id'));
      cns.setActivationValue(node.id, nodes[i].data('value'));
      nodes[i].data('cnId', node.id);
    }
    var edges = cy.edges();
    for (i=0; i < edges.length; i++) {
      console.log('addLink',edges[i].data('source'), edges[i].data('target'));
      var cnSourceId = cy.$('#'+edges[i].data('source')).data('cnId');
      var cnTargetId = cy.$('#'+edges[i].data('target')).data('cnId');
      console.log(cnSourceId, cnTargetId);
      cn.addLink(cnSourceId, cnTargetId);
    }
  }
};

$('#cy').cytoscape(options);

}); // on dom ready
