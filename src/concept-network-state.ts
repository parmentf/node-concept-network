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
