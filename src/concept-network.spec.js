import {
    cnAddLink,
    cnAddNode,
    cnDecrementLink,
    cnDecrementNode,
    cnGetLink,
    cnGetLinksFrom,
    cnGetLinksTo,
    cnGetNode,
    cnRemoveLink,
    cnRemoveLinksOfNode,
    cnRemoveNode
} from '../lib/concept-network';

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
                link: []
            });
        });

        it('should remove the links to the removed node', () => {
            expect(cnRemoveNode({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }],
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }],
                link: []
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

        it('should remove one link among others', () => {
            expect(cnRemoveLink({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'a', 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 1, to: 2, coOcc: 1}]
            });
        });
    });

    describe('remove links of node', () => {
        it('should remove link from', () => {
            expect(cnRemoveLinksOfNode({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 2}]
            }, 'a')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: []
            });
        });

        it('should remove link to', () => {
            expect(cnRemoveLinksOfNode({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 2}]
            }, 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: []
            });
        });

        it('should remove link from & to', () => {
            expect(cnRemoveLinksOfNode({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 2}, { from: 2, to: 1, coOcc: 1}]
            }, 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: []
            });
        });

        it('should remove link among others', () => {
            expect(cnRemoveLinksOfNode({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 1, coOcc: 2}, { from: 0, to: 2, coOcc: 1}]
            }, 'b')).toEqual({
                node: [{ label: 'a', occ: 1 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1}]
            });
        });
    });

    describe('decrement link', () => {
        it('should decrement a coOcc value of 2', () => {
            expect(cnDecrementLink({
                node: [{ label: 'a', occ: 3}, { label: 'b', occ: 2}],
                link: [{ from: 0, to: 1, coOcc: 2}]
            }, 'a', 'b')).toEqual({
                node: [{ label: 'a', occ: 3}, { label: 'b', occ: 2}],
                link: [{ from: 0, to: 1, coOcc: 1}]
            });
        });

        it('should remove a link with a coOcc value of 0', () => {
            expect(cnDecrementLink({
                node: [{ label: 'a', occ: 3}, { label: 'b', occ: 2}],
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'a', 'b')).toEqual({
                node: [{ label: 'a', occ: 3}, { label: 'b', occ: 2}],
                link: []
            });
        });

        it('should return same network when no node', () => {
            expect(cnDecrementLink({
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'a', 'b')).toEqual({
                link: [{ from: 0, to: 1, coOcc: 1}]
            });
        });

        it('should return same network when no link', () => {
            expect(cnDecrementLink({
                node: [{ label: 'a', occ: 3}, { label: 'b', occ: 2}],
            }, 'a', 'b')).toEqual({
                node: [{ label: 'a', occ: 3}, { label: 'b', occ: 2}],
            });
        });

        it('should return same network when no link found', () => {
            expect(cnDecrementLink({
                node: [{ label: 'a', occ: 3}, { label: 'b', occ: 2}],
                link: [{ from: 0, to: 1, coOcc: 1}]
            }, 'a', 'c')).toEqual({
                node: [{ label: 'a', occ: 3}, { label: 'b', occ: 2}],
                link: [{ from: 0, to: 1, coOcc: 1}]
            });
        });
    });

    describe('get node', () => {
        it('should get the second node', () => {
            expect(cnGetNode({
                node: [{ label: 'a', occ: 1}, { label: 'b', occ: 2}]
            }, 'b')).toEqual({
                label: 'b',
                occ: 2
            });
        });

        it('should return undefined when node does not exist', () => {
            expect(cnGetNode({
                node: [{ label: 'a', occ: 1}, { label: 'b', occ: 2}]
            }, 'Nonexistent')).toEqual(undefined);
        });

        it('should return undefined when no nodes', () => {
            expect(cnGetNode({
            }, 'Nonexistent')).toEqual(undefined);
        });
    });

    describe('get link', () => {
        it('should get link', () => {
            expect(cnGetLink({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'a', 'b')).toEqual({
                from: 0, to: 1, coOcc: 2
            });
        });

        it('should return undefined when node does not exist', () => {
            expect(cnGetLink({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'a', 'z')).toEqual(undefined);
        });

        it('should return undefined when no nodes', () => {
            expect(cnGetLink({
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'a', 'z')).toEqual(undefined);
        });

        it('should return undefined when no links', () => {
            expect(cnGetLink({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
            }, 'a', 'z')).toEqual(undefined);
        });
    });

    describe('get node from links', () => {
        it('should get all links from node b', () => {
            expect(cnGetLinksFrom({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'b')).toEqual([{ from: 1, to: 2, coOcc: 1}]);
        });

        it('should get all links from node a', () => {
            expect(cnGetLinksFrom({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'a')).toEqual([
                { from: 0, to: 2, coOcc: 1 },
                { from: 0, to: 1, coOcc: 2}
            ]);
        });

        it('should get no links from node c', () => {
            expect(cnGetLinksFrom({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'c')).toEqual([]);
        });

        it('should return no links when no links', () => {
            expect(cnGetLinksFrom({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
            }, 'b')).toEqual([]);
        });

        it('should return no links when no nodes', () => {
            expect(cnGetLinksFrom({
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'b')).toEqual([]);
        });
    });

    describe('get node to links', () => {
        it('should get all links to node b', () => {
            expect(cnGetLinksTo({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'b')).toEqual([{ from: 0, to: 1, coOcc: 2}]);
        });

        it('should get all links to node c', () => {
            expect(cnGetLinksTo({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'c')).toEqual([
                { from: 0, to: 2, coOcc: 1 },
                { from: 1, to: 2, coOcc: 1}
            ]);
        });

        it('should get no links to node a', () => {
            expect(cnGetLinksTo({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'a')).toEqual([]);
        });

        it('should return no links when no links', () => {
            expect(cnGetLinksTo({
                node: [{ label: 'a', occ: 2 }, { label: 'b', occ: 2 }, { label: 'c', occ: 1 }],
            }, 'b')).toEqual([]);
        });

        it('should return no links when no nodes', () => {
            expect(cnGetLinksTo({
                link: [{ from: 0, to: 2, coOcc: 1 }, { from: 0, to: 1, coOcc: 2}, { from: 1, to: 2, coOcc: 1}]
            }, 'b')).toEqual([]);
        });
    });
});
