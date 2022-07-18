const { LeafTree } = require('../leaf-tree')
const { NodeTree } = require('../node-tree')
const { Hashtable: OpenHash } = require('../open-hashtable')
const { Hashtable: ClosedHash } = require('../closed-hashtable')
const { BTree } = require('../b-tree')
const { sub } = require('@kmamal/util/operators')
const { rand } = require('@kmamal/util/random')
const { time } = require('@kmamal/util/function/time')

const hash0 = (a) => a * 199

const hash1 = (a) => a * 2654435761

const hash2 = (a) => {
	const b = ((a >>> 16) ^ a) * 0x45d9f3b
	const c = ((b >>> 16) ^ b) * 0x45d9f3b
	const d = (c >>> 16) ^ c
	return d
}

const maps = [
	new Map(),
	new NodeTree(sub),
	new LeafTree(sub),
	new ClosedHash(hash0),
	new OpenHash(hash0),
	new OpenHash(hash1),
	new OpenHash(hash2),
	new BTree(sub, 16),
	{
	 _obj: Object.create(null),
	 has (k) { return k in this._obj },
	 get (k) { return this._obj[k] },
	 set (k, v) { this._obj[k] = v },
	 delete (k) { delete this._obj[k] },
	},
]

const K = 1000
const V = 10000
const R = 10000000

const measureTime = (map) => time(() => {
	for (let i = 0; i < R; i++) {
		const o = rand(4)
		switch (o) {
			case 0: {
				const key = rand(K)
				const value = rand(V)
				map.set(key, value)
			} break

			case 1: {
				const key = rand(K)
				map.get(key)
			} break

			case 2: {
				const key = rand(K)
				map.has(key)
			} break

			case 3: {
				const key = rand(K)
				map.delete(key)
			} break

				// No default
		}
	}
})

for (let i = 0; i < maps.length; i++) {
	console.log(measureTime(maps[i]))
}
