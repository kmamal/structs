const { test } = require('@kmamal/testing')
const { Heap } = require('./heap')

test("structs.Heap Heapsort", (t) => {
	const a = [ 4, 7, 1, 3, 2, 9, 0, 5, 8, 6 ]
	const expected = [ ...a ]
	expected.sort()

	const heap = new Heap(a.map((x) => [ x, x ]))
	const result = []
	while (heap.size) {
		result.push(heap.pop().value)
	}

	t.equal(result, expected)
})
