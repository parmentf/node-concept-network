interface ConceptNetworkNode {
    label: string,
    occ: number
}

interface ConceptNetwork {
    node?: ConceptNetworkNode[]
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
