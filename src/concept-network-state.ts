import { cnGetNode, ConceptNetwork } from './concept-network';

interface ConceptNetworkNodeState {
    activationValue: number
    oldActivationValue?: number
}

interface ConceptNetworkState {
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
    newCNS[label] = { activationValue: 100 };
    return newCNS;
}
