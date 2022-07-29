const { test } = require('@kmamal/testing')
const { StringChunkList } = require('./chunk-list')

const equalsString = (t, chunkList, string) => {
	t.equal(chunkList.length, string.length)
	for (let i = -string.length; i <= string.length; i++) {
		t.equal(chunkList.at(i), string.at(i), { i })
		t.equal(chunkList.slice(i), string.slice(i), { i })
	}
	for (let i = -string.length; i <= string.length; i++) {
		for (let j = -string.length; j <= string.length; j++) {
			t.equal(chunkList.slice(i, j), string.slice(i, j), { i, j })
		}
	}
}

test("structs.chunk-list", (t) => {
	const a = new StringChunkList()
	equalsString(t, a, '')

	t.equal(a.shiftN(3), '')
	equalsString(t, a, '')

	a.pushChunk('ab')
	equalsString(t, a, 'ab')

	a.pushChunk('cd')
	equalsString(t, a, 'abcd')

	t.equal(a.shiftN(1), 'a')
	equalsString(t, a, 'bcd')

	t.equal(a.shiftN(1), 'b')
	equalsString(t, a, 'cd')

	a.pushChunk('ef')
	equalsString(t, a, 'cdef')

	t.equal(a.shiftN(3), 'cde')
	equalsString(t, a, 'f')

	t.equal(a.shiftN(3), 'f')
	equalsString(t, a, '')
})
