import { cnAddLink, cnAddNode, cnDecrementNode, cnRemoveLink, cnRemoveNode } from '../lib/concept-network';

describe('Concept Network', () => {
    describe('add node', () => {
        it('should return an object', () => {
            const resultingCN = cnAddNode({}, 'Chuck Norris');
            expect(resultingCN).toEqual({
                node: [{
                    label: 'Chuck Norris',
                    occ: 1,
                }]
            });
        });

        it('should work with nodes', () => {
            expect(cnAddNode({ node: [{ label: 'A', occ: 1 }]}, 'Chuck Norris'))
                .toEqual({
                    node: [{
                        label: 'A', occ: 1
                    }, {
                        label: 'Chuck Norris', occ: 1
                    }]
                });
        });

        it('should increment occ', () => {
            expect(cnAddNode({ node: [{ label: 'A', occ: 1}]}, 'A'))
                .toEqual({
                    node: [{
                        label: 'A', occ: 2
                    }]
                });
        });
    });

    describe('decrement node', () => {
        it('should decrement a node with occ of 3', () => {
            expect(cnDecrementNode({
                node: [{ label: 'Chuck Norris', occ: 3 }]
            }, 'Chuck Norris'))
                .toEqual({
                    node: [{ label: 'Chuck Norris', occ: 2 }]
                });
        });

        it('should remove a node with an occ of 1', () => {
            expect(cnDecrementNode({
                node: [{ label: 'World', occ: 1 }]
            }, 'World'))
                .toEqual({
                    node: []
                });
        });

        it('should return the network when the node does not exist', () => {
            expect(cnDecrementNode({
                node: [{ label: 'World', occ: 1}]
            }, 'Foo'))
                .toEqual({
                    node: [{ label: 'World', occ: 1}]
                });
        });

        it('should return the network when no node exist', () => {
            expect(cnDecrementNode({}, 'Bar')).toEqual({});
        });
    });

    describe('remove node', () =>  {
        it('should remove even a node with occ value of 2', () => {
            expect(cnRemoveNode({
                node: [{ label: 'a', occ: 2 }]
            }, 'a')).toEqual({
                node: []
            });
        });

        it('should remove the links from the removed node', () => {
            expect(cnRemoveNode({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'a')).toEqual({
                node: [undefined, { label: 'b', occ: 2 }],
            });
        });

        it.skip('should remove the links to the removed node', () => {
            expect(cnRemoveNode({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, undefined],
            });
        });

        it('should return same concept when no node', () => {
            expect(cnRemoveNode({}, 'a')).toEqual({});
        });

        it('should return same concept when node does not exist', () => {
            expect(cnRemoveNode({
                node: [{ label: 'a', occ: 1 }]
            }, 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }],
            });
        });
    });

    describe('add link', () => {
        it('should create the link', () => {
            expect(cnAddLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 1 }]
            }, 'a', 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            });
        });

        it('should increment coOcc', () => {
            expect(cnAddLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'a', 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 2}]
            });
        });

        it('should return same object when to node not found', () => {
            expect(cnAddLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'a', 'c')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            });
        });

        it('should return same object when from node not found', () => {
            expect(cnAddLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'c', 'a')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            });
        });

        it('should return same object when no nodes', () => {
            expect(cnAddLink({}, 'a', 'b')).toEqual({});
        })
    });

    describe('remove link', () => {
        it('should remove the link', () => {
            expect(cnRemoveLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
                link: [{ from: 0, to: 1, coOcc: 2}]
            }, 'a', 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
                link: []
            });
        });

        it('should return same network when no link', () => {
            expect(cnRemoveLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
            }, 'a', 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
            });
        });

        it('should return same network when link does not exist', () => {
            expect(cnRemoveLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
                link: [{ from: 0, to: 1, coOcc: 2}]
            }, 'a', 'c')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
                link: [{ from: 0, to: 1, coOcc: 2}]
            });
        });

        it('should return same network when link could exist but does not', () => {
            expect(cnRemoveLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 2}]
            }, 'a', 'c')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 2}]
            });
        });
    });

    // describe('decrement link');
});
