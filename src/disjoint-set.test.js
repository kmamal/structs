const { test } = require('@kmamal/testing')
const { DisjointSet } = require('./disjoint-set')
const { rand } = require('@kmamal/util/random/rand')

const setEqualsArray = (t, set, array) => {
	t.equal(set.numGroups(), new Set(array).size)

	const n = array.length
	for (let i = 0; i < n; i++) {
		t.equal(set.findGroup(i), array[i])
	}

	for (let i = 0; i < n; i++) {
		for (let j = 0; j < n; j++) {
			t.equal(set.areConnected(i, j), array[i] === array[j])
		}
	}
}

test("structs.disjoint-set", (t) => {
	const N = 10

	const set = new DisjointSet(N)

	const array = new Array(N)
	for (let i = 0; i < N; i++) { array[i] = i }

	while (set.numGroups() > 1) {
		const aIndex = rand(N)
		const bIndex = rand(N)
		const aGroup = array[aIndex]
		const bGroup = array[bIndex]
		if (set.areConnected(aIndex, bIndex)) { continue }

		const parentGroup = set.merge(aIndex, bIndex)
		const childGroup = parentGroup === aGroup ? bGroup : aGroup

		for (let i = 0; i < N; i++) {
			if (array[i] === childGroup) {
				array[i] = parentGroup
			}
		}

		setEqualsArray(t, set, array)
	}
})
