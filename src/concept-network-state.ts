import { cnGetNode, ConceptNetwork } from './concept-network';

interface ConceptNetworkNodeState {
    value: number
    old?: number
}

export interface ConceptNetworkState {
    [index: string]: ConceptNetworkNodeState
}

/**
 * Set the activation value of the node which `label` is given to 100.
 *
 * @export
 * @param {ConceptNetworkState} cns
 * @param {string} label
 * @returns {ConceptNetworkState}
 */
export function cnsActivate(
    cns: ConceptNetworkState,
    label: string)
    : ConceptNetworkState {
    const newCNS = { ...cns };
    newCNS[label] = { value: 100 };
    return newCNS;
}

/**
 * Get the activation value of a node (which `label` is given)
 *
 * @export
 * @param {ConceptNetworkState} cns
 * @param {string} label
 * @returns {number|undefined}
 */
export function cnsGetActivationValue(cns: ConceptNetworkState, label: string)
    : number|undefined {
    if (!(label in cns)) return undefined;
    const state = cns[label];
    if (!('value' in state)) return undefined;
    return state.value;
}

/**
 * Get the activation value of a node (which `label` is given)
 *
 * @export
 * @param {ConceptNetworkState} cns
 * @param {string} label
 * @returns {number|undefined}
 */
export function cnsGetOldActivationValue(cns: ConceptNetworkState, label: string)
    : number|undefined {
    if (!(label in cns)) return undefined;
    const state = cns[label];
    if (!('old' in state)) return 0;
    return state.old;
}

/**
 * Get the maximum activation value of all nodes which label start with
 * `beginning`.
 *
 * @export
 * @param {ConceptNetworkState} cns
 * @param {string}              [beginning='']
 * @returns {number}
 */
export function cnsGetMaxActivationValue(cns: ConceptNetworkState, beginning: string = ''): number {
    const max = Object.keys(cns)
        .filter(key => key.startsWith(beginning))
        .reduce((max, currentLabel) => Math.max(max, cns[currentLabel].value),
             0);
    return max;
}

/**
 * Return an object associating nodes labels with their activation values, but
 * only for labels starting with `beginning` and activation values greater or
 * equal to `threshold`.
 *
 * @export
 * @param {ConceptNetworkState} cns
 * @param {string} [beginning='']
 * @param {number} [threshold=95]
 * @returns {{ [index: string]: number }}
 */
export function cnsGetActivatedTypedNodes(
    cns: ConceptNetworkState,
    beginning: string = '',
    threshold: number = 95
): { [index: string]: number } {
    const nodes = Object.keys(cns)
        .filter(key => key.startsWith(beginning))
        .filter(label => cns[label] !== undefined)
        .filter(label => cns[label].value >= threshold)
        .reduce((nodes, label) => ({ ...nodes, [label]: cns[label].value }),
            {});
    return nodes;
}

/**
 * Set the activation `value` of a node `label`.
 *
 * @export
 * @param {ConceptNetworkState} cns
 * @param {string} label
 * @param {number} value
 * @returns {ConceptNetworkState}
 */
export function cnsSetActivationValue(
    cns: ConceptNetworkState = {},
    label: string,
    value: number
): ConceptNetworkState {
    return {
        ...cns,
        [label]: { value }
    };
}
