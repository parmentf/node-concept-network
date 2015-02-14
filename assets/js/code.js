$(function(){ // on dom ready

var ConceptNetwork = require('concept-network').ConceptNetwork;
var ConceptNetworkState = require('concept-network').ConceptNetworkState;

var cn = window.cn = new ConceptNetwork();
var cns = window.cns = new ConceptNetworkState(cn);

var linking = false;
var cySource;

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
      { data: { id: 'b', occ: 1, value: 0 } },
      { data: { id: 'c', occ: 2, value: 0} },
    ],
    edges: [
      { data: { id: 'ab', source: 'a', target: 'b', cooc: 1 } },
      { data: { id: 'bc', source: 'b', target: 'c', cooc: 1 } }
    ]
  },

  ready: function() {
    window.cy = this;

    cy.on('select', 'node', function(e) {
      var data = e.cyTarget.data();

      if (linking) {
        var cnSource = cySource.data('cnId');
        var cyTarget = cy.nodes(':selected')[0];
        var cnTarget = cyTarget.data('cnId');
        var cnLink = cn.addLink(cnSource, cnTarget);
        if (cnLink.coOcc === 1) {
          var link = {
              source: cySource.data('id'),
              target: cyTarget.data('id'),
              cooc: 1,
              id: cySource.data('id') + '_' + cyTarget.data('id')
            };
          cy.add({
            group: 'edges',
            data: link
          });
        }
        else {
          var cyEdge = cy.edges('[source="'+cySource.data('id')+'"][target="'+cyTarget.data('id')+'"]');
          cyEdge.data('cooc',cnLink.coOcc);
        }
        cy.layout({name:'cose'});
        cySource = null;
        linking = false;
        return;
      }
      var html = "<ul>";
      Object.keys(data).forEach(function (key) {
        var value = data[key];
        if (key === 'value') {
          value = Math.round(value);
        }
        html += "<li>" + key+":"+value + "</li>";
      });
      html += "</ul>";
      $('#info').html(html);
      $('#activate-btn').prop('disabled',false);
      $('#del-node-btn').prop('disabled',false);
      $('#add-link-btn').prop('disabled',false);
    });

    cy.on('unselect', 'node', function(e) {
      $('#info').text("");
      $('#activate-btn').prop('disabled',true);
      $('#del-node-btn').prop('disabled',true);
      $('#add-link-btn').prop('disabled',true);
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
      var cyNode = cy.nodes(':selected')[0];
      var cnNode = cn.getNode(cyNode.data('id'));
      cns.activate(cnNode.id);
      cyNode.data('value', 100);
      cyNode.unselect().select();
    });

    $('#add-node-btn').click(function () {
      $('#add-node-window').show();
    });

    $('#create-node-btn').click(function (e) {
      e.preventDefault();
      var nodeLabel = $('#node-label').val();
      var node = cn.addNode(nodeLabel);
      if (node.occ === 1) {
        cy.add({
          group: 'nodes',
          data: {
            id: nodeLabel,
            occ: 1,
            cnId: node.id,
            value: 0
          }
        });
      }
      else {
        cy.$('#' + nodeLabel).data('occ', node.occ);
      }
      $('#add-node-window').hide();
      cy.layout({name:'cose'});
    });

    $('#del-node-btn').click(function () {
      var cyNode = cy.nodes(':selected')[0];
      var cnNode = cn.getNode(cyNode.data('id'));
      cn.removeNode(cnNode.id);
      cy.remove(cyNode);
    });

    $('#add-link-btn').click(function () {
      cySource = cy.nodes(':selected')[0];
      linking  = true;
    });

    // Copy Cytoscape network into ConceptNetwork
    var nodes = cy.nodes();
    for (var i=0; i < nodes.length; i++) {
      var node = cn.addNode(nodes[i].data('id'));
      cns.setActivationValue(node.id, nodes[i].data('value'));
      nodes[i].data('cnId', node.id);
    }
    var edges = cy.edges();
    for (i=0; i < edges.length; i++) {
      var cnSourceId = cy.$('#'+edges[i].data('source')).data('cnId');
      var cnTargetId = cy.$('#'+edges[i].data('target')).data('cnId');
      cn.addLink(cnSourceId, cnTargetId, edges[i].data('cooc'));
    }
  }
};

$('#cy').cytoscape(options);

}); // on dom ready
