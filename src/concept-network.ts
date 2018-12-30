interface ConceptNetworkNode {
    label: string,
    occ: number
}

interface ConceptNetworkLink {
    from: number,
    to: number,
    coOcc: number,
}

interface ConceptNetwork {
    node?: ConceptNetworkNode[],
    link?: ConceptNetworkLink[],
}

/**
 * Create a node in `cn` or increment its occurrence.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string} label
 * @returns {ConceptNetwork} the new ConceptNetwork
 */
export function cnAddNode(cn: ConceptNetwork, label: string): ConceptNetwork {
    const res = Object.assign({}, cn);
    if (res.node) {
        const node = cnGetNode(res, label);
        const nodeIndex = cnGetNodeIndex(res, label);

        if (node) {
            node.occ = node.occ + 1;
            res.node[nodeIndex] = node;
        } else {
            res.node.push({ label, occ: 1 });
        }
    } else {
        res.node = [{
            label,
            occ: 1
        }];
    }

    return res;
}

/**
 * Decrement the `occ` of the node which `label` is given by one.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string} label
 * @returns {ConceptNetwork} the new ConceptNetwork
 */
export function cnDecrementNode(cn: ConceptNetwork, label: string): ConceptNetwork {
    const res = Object.assign({}, cn);
    if (!res.node) {
        return res;
    }
    const node = cnGetNode(res, label);
    const nodeIndex = cnGetNodeIndex(res, label);
    if (node) {
        node.occ = node.occ - 1;
        res.node[nodeIndex] = node;
        if (node.occ === 0) {
            res.node.splice(nodeIndex, 1);
        }
    }
    return res;
}

/**
 * Remove the node which `label` is given (and the links to it)
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string} label
 * @returns {ConceptNetwork} the new ConceptNetwork
 */
export function cnRemoveNode(cn: ConceptNetwork, label: string): ConceptNetwork {
    const res = Object.assign({}, cn);
    if (!res.node) {
        return res;
    }
    const nodeIndex = cnGetNodeIndex(res, label);
    if (nodeIndex === -1) {
        return res;
    }
    // remove links from and to the node
    const res2 = cnRemoveLinksOfNode(res, label);
    // remove the node, but do not shift next nodes' indices
    res2.node[nodeIndex] = undefined;
    // remove all ending undefined
    const nodes = res2.node.reduceRight((nodes: ConceptNetworkNode[], node: ConceptNetworkNode) => {
        if (!node && nodes.length === 0) return [];
        nodes.push(node);
        return nodes;
    }, []);
    res2.node = nodes.reverse();
    return res2;
}

/**
 * Create a link between `from` and `to`, and increment `coOcc` by one.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string} from
 * @param {string} to
 * @returns {ConceptNetwork} the new ConceptNetwork
 */
export function cnAddLink(cn: ConceptNetwork, from: string, to: string): ConceptNetwork {
    const res = Object.assign({}, cn);
    if (!res.node) return res;
    const fromIndex = cnGetNodeIndex(res, from);
    const toIndex = cnGetNodeIndex(res, to);
    if (fromIndex === -1 || toIndex === -1) return res;
    if (!res.link) res.link = [];
    const link = res.link.find(l => l.from === fromIndex && l.to === toIndex);
    if (!link) {
        res.link.push({ from: fromIndex, to: toIndex, coOcc: 1});
    } else {
        link.coOcc = link.coOcc + 1;
    }
    return res;
}

/**
 * Remove the link from `from` to `to`
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string} from label of the outgoing node
 * @param {string} to label of the ingoing node
 * @returns {ConceptNetwork} the new ConceptNetwork
 */
export function cnRemoveLink(cn: ConceptNetwork, from: string, to: string): ConceptNetwork {
    const res = Object.assign({}, cn);
    if (!res.link) return res;
    const fromIndex = cnGetNodeIndex(res, from);
    const toIndex = cnGetNodeIndex(res, to);
    if (fromIndex === -1 || toIndex === -1) return res;
    const linkIndex = cnGetLinkIndex2(res, fromIndex, toIndex);
    if (linkIndex === -1) return res;
    res.link.splice(linkIndex, 1);
    return res;
}

/**
 * Remove all links of the node which `label` is given.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string} label    label of the node which links are to be removed
 * @returns {ConceptNetwork}    new ConceptNetwork
 */
export function cnRemoveLinksOfNode(cn: ConceptNetwork, label: string): ConceptNetwork {
    if (!cn.node || !cn.link) return cn;
    const nodeIndex = cnGetNodeIndex(cn, label);
    const linksIndices = cn.link
        .map(l => l.from === nodeIndex || l.to === nodeIndex)
        .map((found, i) => { if (found) return i; else return; });
    const link = cn.link.filter((l, i) => !linksIndices.includes(i));
    const res = {
        ...cn,
        link,
    }
    return res;
}

/**
 * Decrement the coOcc of the link from `from` to `to` by one.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string}  from label of the from node
 * @param {string}  to   label of the to node
 * @returns {ConceptNetwork}    new ConceptNetwork
 */
export function cnDecrementLink(cn: ConceptNetwork, from: string, to: string): ConceptNetwork {
    if (!cn.node || !cn.link) return cn;
    const fromIndex = cnGetNodeIndex(cn, from);
    const toIndex = cnGetNodeIndex(cn, to);
    const linkIndex = cnGetLinkIndex2(cn, fromIndex, toIndex);
    if (linkIndex === -1) return cn;
    const res = Object.assign({}, cn);
    const link = res.link[linkIndex];
    link.coOcc -= 1;
    if (link.coOcc === 0) res.link.splice(linkIndex, 1);
    return res;
}

/**
 * Get the node matching `label`.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string}  label   label of the node to get
 * @returns {ConceptNetworkNode|undefined}
 */
export function cnGetNode(cn: ConceptNetwork, label: string): ConceptNetworkNode|undefined {
    if (!cn.node) return undefined;
    const node = cn.node.find(n => n.label === label);
    if (!node) return undefined;
    return { ...node };
}

/**
 * Get the link from `from` to `to`.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string}  from   label of the node from
 * @param {string}  to     label of the node to
 * @returns {ConceptNetworkLink|undefined}
 */
export function cnGetLink(cn: ConceptNetwork, from: string, to: string): ConceptNetworkLink|undefined {
    if (!cn.node || !cn.link) return undefined;
    const fromIndex = cnGetNodeIndex(cn, from);
    const toIndex = cnGetNodeIndex(cn, to);
    const link = cn.link.find(l => l.from === fromIndex && l.to === toIndex);
    if (!link) return undefined;
    return { ...link };
}

/**
 * Get the links from `label` node.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string}  label   label of the node from
 * @returns {ConceptNetworkLink[]}
 */
export function cnGetLinksFrom(cn: ConceptNetwork, label: string): ConceptNetworkLink[] {
    if (!cn.node || !cn.link) return [];
    const fromIndex = cnGetNodeIndex(cn, label);
    const links = cn.link.filter(l => l.from === fromIndex);
    return links;
}

/**
 * Get the links to `label` node.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string}  label   label of the node to
 * @returns {ConceptNetworkLink[]}
 */
export function cnGetLinksTo(cn: ConceptNetwork, label: string): ConceptNetworkLink[] {
    if (!cn.node || !cn.link) return [];
    const toIndex = cnGetNodeIndex(cn, label);
    const links = cn.link.filter(l => l.to === toIndex);
    return links;
}

/**
 * Get the index of the node matching `label`.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string}  label   label of the node to get
 * @returns {number}    -1 when not found
 */
export function cnGetNodeIndex(cn: ConceptNetwork, label: string): number {
    if (!cn.node) return -1;
    const nodeIndex = cn.node.findIndex(n => n.label === label);
    return nodeIndex;
}

/**
 * Get the index of the link from `from` to `to`.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {string}  from   label of the node from
 * @param {string}  to     label of the node to
 * @returns {number}       -1 when not found
 */
export function cnGetLinkIndex(cn: ConceptNetwork, from: string, to: string): number {
    if (!cn.node || !cn.link) return -1;
    const fromIndex = cnGetNodeIndex(cn, from);
    const toIndex = cnGetNodeIndex(cn, to);
    const linkIndex = cnGetLinkIndex2(cn, fromIndex, toIndex);
    return linkIndex;
}

/**
 * Get the index of the link from `fromIndex` to `toIndex`.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {number}  fromIndex   label of the node from
 * @param {number}  toIndex     label of the node to
 * @returns {number}            -1 when not found
 */
export function cnGetLinkIndex2(cn: ConceptNetwork, fromIndex: number, toIndex: number): number {
    if (!cn.link) return -1;
    const linkIndex = cn.link.findIndex(l => l.from === fromIndex && l.to === toIndex);
    return linkIndex;
}
