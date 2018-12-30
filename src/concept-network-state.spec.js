import {
    cnsActivate,
    cnsGetActivationValue,
    cnsGetActivatedTypedNodes,
    cnsGetMaxActivationValue,
    cnsGetOldActivationValue
} from '../lib/concept-network-state';

describe('ConceptNetworkState', () => {
    describe('activate', () => {
        it('should set the node activation to 100', () => {
            const cns = {};
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { value: 100 }
            });
        });

        it('should return a state even if none was given ', () => {
            const cns = null;
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { value: 100 }
            });
        });

        it('should return all other activation values', () => {
            const cns = { b: { value: 50 } };
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { value: 100 },
                b: { value: 50 }
            });
        });

        it('should replace older activation values', () => {
            const cns = { a: { value: 50 } };
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { value: 100 }
            });
        });

        it('should cap the activation of an activated node', () => {
            const cns = { a: { value: 101 } };
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { value: 100 }
            });
        });
    });

    describe('getters', () => {
        describe('activation value', () => {
            it('should get a zero activation value', () => {
                const cns = { a: { value: 0 }};
                expect(cnsGetActivationValue(cns, 'a')).toEqual(0);
            });

            it('should get a 100 activation value', () => {
                const cns = { a: { value: 100 }};
                expect(cnsGetActivationValue(cns, 'a')).toEqual(100);
            });

            it('should get undefined for a non-existing node', () => {
                const cns = { a: { value: 0 }};
                expect(cnsGetActivationValue(cns, 'b')).toEqual(undefined);
            });

            it('should get undefined for a non-existing activation value', () => {
                const cns = { a: { old: 2 } };
                expect(cnsGetActivationValue(cns, 'a')).toEqual(undefined);
            });
        });

        describe('old activation value', () => {
            it('should get a zero activation value by default', () => {
                const cns = { a: { value: 100 }};
                expect(cnsGetOldActivationValue(cns, 'a')).toEqual(0);
            });

            it('should get the old activation value', () => {
                const cns = { a: { old: 50, value: 0 }};
                expect(cnsGetOldActivationValue(cns, 'a')).toEqual(50);
            });

            it('should return undefined for a non-existing old value', () => {
                const cns = { a: { value: 59 }};
                expect(cnsGetOldActivationValue(cns, 'z')).toEqual(undefined);
            });
        });

        describe('get maximum activation value', () => {
            it('should return 0 when no node activated', () => {
                expect(cnsGetMaxActivationValue({})).toEqual(0);
            });

            it('should get the maximum activation value', () => {
                expect(cnsGetMaxActivationValue({
                    a: { value: 10 },
                    b: { value: 20 }
                })).toEqual(20);
            });

            it('should get tne maximum activation value for s tokens', () => {
                expect(cnsGetMaxActivationValue({
                    sa: { value: 10 },
                    sb: { value: 20 },
                    ta: { value: 30 }
                }, 's')).toEqual(20);
            });
        });

        describe('get activated typed nodes', () => {
            it('should return an empty object when no node is activated', () => {
                expect(cnsGetActivatedTypedNodes({ a: { value: 50 }}))
                    .toEqual({});
            });

            it('should return one-node-object when one node is activated', () => {
                expect(cnsGetActivatedTypedNodes({ a: { value: 100 }}))
                    .toEqual({ a: 100 });
            });

            it('should return two-nodes-object with two activated nodes', () => {
                expect(cnsGetActivatedTypedNodes({ a: { value: 100 }, b: { value: 95 }}))
                    .toEqual({ a: 100, b: 95 });
            });

            it('should return one-node-object of type s', () => {
                expect(cnsGetActivatedTypedNodes({ a: { value: 100 }, sb: { value: 95 }}, 's'))
                    .toEqual({ sb: 95 });
            });

            it('should return one-node-object where threshold = 96', () => {
                expect(cnsGetActivatedTypedNodes({ a: { value: 100, sb: { value: 95 }}}, '', 96))
                    .toEqual({ a: 100 });
            });
        });
    });
});
