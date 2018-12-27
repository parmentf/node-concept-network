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
