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
        const node = res.node.find(n => n.label === label);

        if (node) {
            node.occ = node.occ + 1;
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
    const node = res.node.find(n => n.label === label);
    if (node) {
        node.occ = node.occ - 1;
        if (node.occ === 0) {
            const nodeIndex = res.node.findIndex(n => n.label === label);
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
    const nodeIndex = res.node.findIndex(n => n.label === label);
    if (nodeIndex === -1) {
        return res;
    }
    // TODO: remove links from and to the node
    res.node.splice(nodeIndex, 1);
    return res;
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
    const fromIndex = res.node.findIndex(n => n.label === from);
    const toIndex = res.node.findIndex(n => n.label === to);
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