import { assoc, inc, mapObjIndexed, path, pipe, propOr, reduce } from 'ramda';
import { cnGetNodeIndex, cnGetLinksFrom, ConceptNetwork } from './concept-network';

interface ConceptNetworkNodeState {
    value: number
    old?: number
    age?: number
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
    const oldNodeState = cns[label];
    return {
        ...cns,
        [label]: { ...oldNodeState, value }
    };
}

/**
 * Propagate the activation values along the links.
 *
 * @export
 * @param {ConceptNetwork} cn
 * @param {ConceptNetworkState} cns
 * @param {{ decay?: number, memoryPerf: number }} [options={ decay: 40, memoryPerf: 100 }]
 * @returns {ConceptNetworkState}
 */
export function cnsPropagate(
    cn: ConceptNetwork,
    cns: ConceptNetworkState,
    options: { decay?: number, memoryPerf: number } = { decay: 40, memoryPerf: 100 }
): ConceptNetworkState {
    const nextAge = pipe(
        propOr(0, 'age'),
        inc
    );
    const addOneYearToAge = (state: ConceptNetworkNodeState) => <ConceptNetworkNodeState>assoc('age', nextAge(state), state);
    const copyValueToOld = (state: ConceptNetworkNodeState) => <ConceptNetworkNodeState>assoc('old', propOr(0, 'value', state), state);
    const initAgeAndOld = pipe(addOneYearToAge, copyValueToOld);
    const cns0 = mapObjIndexed(initAgeAndOld, cns);

    const influenceNb: number[] = [];       // node id -> nb of influence
    const influenceValue : number[] = [];   // node id -> influence value
    cn.node.forEach(node => {
        const label = node.label;
        if (!cns0[label]) return; // Only nodes with an activation value
        const old = cns0[label].old;
        const links = cnGetLinksFrom(cn, label);
        // for all outgoing links
        links.forEach(link => {
            const nodeToId = link.to;
            influenceValue[nodeToId] = influenceValue[nodeToId] || 0
                + 0.5 + old * link.coOcc;
            influenceNb[nodeToId] = influenceNb[nodeToId] || 0 + 1;
        });
    });

    const decay = options.decay || 40;
    const memoryPerf = options.memoryPerf || 100;
    const normalNumberComingLinks = 2;
    const cns1 = reduce((cnst, node) => {
        const label = node.label;
        const state = cns0[label] || { value: 0, old: 0, age: 0};
        const minusAge = 200 / (1 + Math.exp(-state.age / memoryPerf)) - 100;
        const nodeId = cnGetNodeIndex(cn, label);
        const nbIncomings = influenceNb[nodeId];
        const influence = influenceValue[nodeId]
            ? influenceValue[nodeId]
                / Math.log(normalNumberComingLinks + nbIncomings)
                * Math.log(normalNumberComingLinks)
            : 0;
        let value = state.old - decay * state.old / 100 + influence - minusAge;
        value = Math.min(value, 100);
        if (value <= 0) return cnst;
        return { ...cnst, [label]: { ...state, value } };
    }, {}, cn.node);

    return cns1;
}