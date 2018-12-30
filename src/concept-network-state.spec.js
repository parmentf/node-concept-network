import {
    cnsActivate
} from '../lib/concept-network-state';

describe('ConceptNetworkState', () => {
    describe('activate', () => {
        it('should set the node activation to 100', () => {
            const cns = {};
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { activationValue: 100 }
            });
        });

        it('should return a state even if none was given ', () => {
            const cns = null;
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { activationValue: 100 }
            });
        });

        it('should return all other activation values', () => {
            const cns = { b: { activationValue: 50 } };
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { activationValue: 100 },
                b: { activationValue: 50 }
            });
        });

        it('should replace older activation values', () => {
            const cns = { a: { activationValue: 50 } };
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { activationValue: 100 }
            });
        });

        it('should cap the activation of an activated node', () => {
            const cns = { a: { activationValue: 101 } };
            expect(cnsActivate(cns, 'a')).toEqual({
                a: { activationValue: 100 }
            });
        });
    });
});
