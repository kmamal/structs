
class DisjointSet {
	constructor (n = 0) {
		this._numGroups = n
		this._entries = new Array(n)
		for (let i = 0; i < n; i++) {
			this._entries[i] = { parentIndex: i, size: 1 }
		}
	}

	size () { return this._entries.length }

	numGroups () { return this._numGroups }

	_findGroup (_index) {
		let index = _index
		let group = this._entries[index]
		while (group.parentIndex !== index) {
			index = group.parentIndex
			const parent = this._entries[index]
			group.parentIndex = parent.parentIndex
			group = parent
		}
		return group
	}

	findGroup (index) {
		return this._findGroup(index).parentIndex
	}

	areConnected (aIndex, bIndex) {
		if (aIndex === bIndex) { return true }
		return this._findGroup(aIndex) === this._findGroup(bIndex)
	}

	merge (aIndex, bIndex) {
		let aGroup = this._findGroup(aIndex)
		let bGroup = this._findGroup(bIndex)
		if (aGroup === bGroup) { return aGroup.parentIndex }

		if (aGroup.size < bGroup.size) {
			[ aGroup, bGroup ] = [ bGroup, aGroup ]
		}

		this._numGroups--
		bGroup.parentIndex = aGroup.parentIndex
		aGroup.size += bGroup.size
		return aGroup.parentIndex
	}
}

module.exports = { DisjointSet }
