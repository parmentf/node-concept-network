/*jshint strict:true*/
$(function(){ // on dom ready
"use strict";

var ConceptNetwork = require('concept-network').ConceptNetwork;
var ConceptNetworkState = require('concept-network').ConceptNetworkState;

var cn = window.cn = new ConceptNetwork();
var cns = window.cns = new ConceptNetworkState(cn);

var linking = false;
var cySource;

var displayInfo = function (data) {
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
};

var layoutOptions = {
  name: "cose",
  padding: 10
};

var options = {
  layout: layoutOptions,

  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'width': 'mapData(occ, 1, 10, 50, 100)',
        'shape': 'rectangle',
        'content': 'data(label)',
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
        'border-color': '#333',
        'line-color': 'black',
        'target-arrow-color': 'black'
      }),

  elements: {
    nodes: [
      { data: { id: '1', label: 'a', occ: 1, value: 100 } },
      { data: { id: '2', label: 'b', occ: 1, value: 0 } },
      { data: { id: '3', label: 'c', occ: 2, value: 0} },
    ],
    edges: [
      { data: { id: '1_2', source: 1, target: 2, cooc: 1 } },
      { data: { id: '2_3', source: 2, target: 3, cooc: 1 } }
    ]
  },

  ready: function() {
    window.cy = this;

    if (localStorage && localStorage.ector) {
      $('#load-ector-btn').show();
    }

    $('#load-ector-btn').click(function () {
      var newCN = JSON.parse(localStorage.ector);
      cn.fromIndex = newCN.fromIndex;
      cn.labelIndex = newCN.labelIndex;
      cn.link = newCN.link;
      cn.node = newCN.node;
      cn.nodeLastId = newCN.nodeLastId;
      cn.toIndex = newCN.toIndex;
      cns.nodeState = {};
      // Copy ConceptNetwork into Cytoscape network
      var eles = [];
      for (var nodeId in cn.node) {
        eles.push({
          group: "nodes",
          data : {
            id : nodeId,
            label: cn.node[nodeId].label.slice(1),
            occ  : Number(cn.node[nodeId].occ),
            type : cn.node[nodeId].label.slice(0,1),
            cnId : Number(nodeId)
          }
        });
      }
      for (var linkId in cn.link) {
        eles.push({
          group: "edges",
          data : {
            id     : linkId,
            source : Number(cn.link[linkId].fromId),
            target : Number(cn.link[linkId].toId),
            cooc   : Number(cn.link[linkId].coOcc)
          }
        });
      }
      cy.elements().remove();
      cy.add(eles);
      cy.layout(layoutOptions);
    });

    cy.on('select', 'node', function(e) {
      var data = e.cyTarget.data();

      if (linking) {
        var cnSource = cySource.data('cnId');
        var cyTarget = cy.nodes(':selected')[0];
        var cnTarget = cyTarget.data('cnId');
        var cnLink = cn.addLink(cnSource, cnTarget);
        if (cnLink.coOcc === 1) {
          var link = {
              id: cySource.data('id') + '_' + cyTarget.data('id'),
              source: cySource.data('id'),
              target: cyTarget.data('id'),
              cooc: 1
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
        cySource = null;
        linking = false;
      }
      displayInfo(data);
      $('#activate-btn').prop('disabled',false);
      $('#del-node-btn').prop('disabled',false);
      $('#add-link-btn').prop('disabled',false);
      if (e.cyTarget.locked()) {
        $('#unlock-node-btn').show();
        $('#lock-node-btn').hide();
      }
      else {
        $('#unlock-node-btn').hide();
        $('#lock-node-btn').show();
      }
    });

    cy.on('unselect', 'node', function(e) {
      $('#info').text("");
      $('#activate-btn').prop('disabled',true);
      $('#del-node-btn').prop('disabled',true);
      $('#add-link-btn').prop('disabled',true);
      $('#lock-node-btn').hide();
      $('#unlock-node-btn').hide();
    });

    $('#propagate-btn').click(function () {
      var nodes = cy.nodes();
      var decay = Number($('#decay').val());
      var memoryPerf = Number($('#memoryPerf').val());
      decay = isNaN(decay) ? 60 : decay;
      memoryPerf = isNaN(memoryPerf) ? 500 : memoryPerf;
      var options = {decay: decay, memoryPerf: memoryPerf};
      console.log('options',options);
      cns.propagate(options);
      for (i=0; i < nodes.length; i++) {
        var av = cns.getActivationValue(nodes[i].data('cnId'));
        nodes[i].data('value',av);
      }
    });

    $('#activate-btn').click(function () {
      var cyNode = cy.nodes(':selected')[0];
      var cnLabel = (cyNode.data('type') ? cyNode.data('type') : "") +
                     cyNode.data('label');
      var cnNode = cn.getNode(cnLabel);
      cns.activate(cnNode.id);
      cyNode.data('value', 100);
      cyNode.unselect().select();
    });

    $('#add-node-btn').click(function () {
      $('#add-node-window').show();
      $('#node-label').focus();
    });

    $('#create-node-btn').click(function (e) {
      e.preventDefault();
      var nodeLabel = $('#node-label').val();
      var node = cn.addNode(nodeLabel);
      if (node.occ === 1) {
        cy.add({
          group: 'nodes',
          data: {
            id   : String(cy.nodes().length+1),
            label: nodeLabel,
            occ: 1,
            value: 0,
            cnId: node.id
          }
        });
      }
      else {
        cy.$('#' + nodeLabel).data('occ', node.occ);
      }
      cy.layout(layoutOptions);
      $('#add-node-window').hide();
    });

    $('#activate-btn,#propagate-btn').click(function () {
      var selectedNodes = cy.nodes(':selected');
      if (selectedNodes.length) {
        var selectedNode = selectedNodes[0];
        displayInfo(selectedNode.data());
      }
    });

    $('#del-node-btn').click(function () {
      var cyNode = cy.nodes(':selected')[0];
      var cnLabel = (cyNode.data('type') ? cyNode.data('type') : "") +
                     cyNode.data('label');
      var cnNode = cn.getNode(cnLabel);
      cn.removeNode(cnNode.id);
      cy.remove(cyNode);
    });

    $('#add-link-btn').click(function () {
      cySource = cy.nodes(':selected')[0];
      linking  = true;
    });

    cy.on('select', 'edge', function (e) {
      var cyEdge = e.cyTarget;
      displayInfo(cyEdge.data());
      $('#del-link-btn').prop('disabled', false);
    });

    cy.on('unselect', 'edge', function (e) {
      $('#del-link-btn').prop('disabled', true);
    });

    $('#del-link-btn').click(function () {
      var cyEdge = cy.edges(':selected')[0].data();
      var cnSource = cn.node[cyEdge.source];
      var cnTarget = cn.node[cyEdge.target];
      cn.removeLink(cnSource.id+'_'+cnTarget.id);
      cy.remove(cy.edges(':selected'));
    });

    $('#lock-node-btn').click(function () {
      var node = cy.nodes(':selected')[0];
      node.lock();
      $('#lock-node-btn').hide();
      $('#unlock-node-btn').show();
    });

    $('#unlock-node-btn').click(function () {
      var node = cy.nodes(':selected')[0];
      node.unlock();
      $('#lock-node-btn').show();
      $('#unlock-node-btn').hide();
    });

    $('#layout-btn').click(function () {
      cy.layout(layoutOptions);
    });

    // Copy Cytoscape network into ConceptNetwork
    var nodes = cy.nodes();
    for (var i=0; i < nodes.length; i++) {
      var node = cn.addNode(nodes[i].data('label'));
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
