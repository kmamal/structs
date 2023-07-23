const {
	getParent,
	getLeft,
	getRight,
} = require('@kmamal/util/array/tree/binary')
const { sub } = require('@kmamal/util/operators/arithmetic/sub')

class Heap {
	constructor (init = [], options = {}) {
		this._array = Array.from(init, ([ prio, value ], index) => ({ prio, value, index }))
		this._compare = options.compare || sub
		this._heapify()
	}

	get size () { return this._array.length }

	add (prio, value) {
		const index = this._array.length
		const entry = { prio, value, index }
		this._array.push(entry)
		this._bubbleUp(entry)
		return entry
	}

	remove (entry) {
		const last = this._array[this._array.length - 1]
		this._swap(entry, last)
		this._array.pop()
		this._bubbleDown(last)
		return entry
	}

	update (entry, prio) {
		const oldPrio = entry.prio
		entry.prio = prio
		this._compare(prio, oldPrio) < 0
			? this._bubbleUp(entry)
			: this._bubbleDown(entry)
	}

	min () { return this._array[0] }
	pop () {
		return this._array.length !== 0
			? this.remove(this._array[0])
			: undefined
	}

	_bubbleUp (entry) {
		for (;;) {
			const parent = this._array[getParent(entry.index)]
			if (!parent) { break }

			if (this._compare(parent.prio, entry.prio) < 0) { break }

			this._swap(entry, parent)
		}
	}

	_bubbleDown (entry) {
		for (;;) {
			const { index } = entry
			const leftChild = this._array[getLeft(index)]
			if (!leftChild) { break }

			const rightChild = this._array[getRight(index)]
			const minChild = !rightChild || this._compare(leftChild.prio, rightChild.prio) <= 0 ? leftChild : rightChild
			if (this._compare(entry.prio, minChild.prio) < 0) { break }

			this._swap(entry, minChild)
		}
	}

	_swap (a, b) {
		const ai = a.index
		const bi = b.index
		this._array[bi] = a
		this._array[ai] = b
		a.index = bi
		b.index = ai
	}

	_heapify () {
		const first = getParent(this._array.length - 1)
		for (let i = first; i >= 0; i--) {
			const entry = this._array[i]
			this._bubbleDown(entry)
		}
	}
}

module.exports = { Heap }
