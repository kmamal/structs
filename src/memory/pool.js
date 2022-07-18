
const ENTRY_NEXT = 0
const ENTRY_OBJECT = 1
const ENTRY_FIELDS = 2

class Pool {
	constructor ({ create, destroy, move, min, max }) {
		this._create = create
		this._destroy = destroy
		this._move = move

		this._minCapacity = min || 0
		this._maxCapacity = max || Infinity
		this._array = []
		this._first = null
		if (min > 0) {
			this._first = 0
			const end = (min - 1) * ENTRY_FIELDS
			let index = 0
			while (index < end) {
				const next = index + ENTRY_FIELDS
				this._array[index + ENTRY_NEXT] = next
				this._array[index + ENTRY_OBJECT] = this._create()
				index = next
			}
			this._array[index + ENTRY_NEXT] = null
			this._array[index + ENTRY_OBJECT] = this._create()
		}
	}

	alloc () {
		if (this._array.length === this._maxCapacity * ENTRY_FIELDS) {
			throw new Error("out of memory")
		}

		// Grow
		if (this._first === null) {
			const pointer = this._array.length
			const value = this._create()
			this._array[pointer + ENTRY_NEXT] = -1
			this._array[pointer + ENTRY_OBJECT] = value
			return { pointer, value }
		}

		const pointer = this._first
		const next = this._array[pointer + ENTRY_NEXT]
		const value = this._array[pointer + ENTRY_OBJECT]
		this._first = next
		this._array[pointer + ENTRY_NEXT] = -1
		return { pointer, value }
	}

	free (pointer) {
		this._array[pointer + ENTRY_NEXT] = this._first
		this._first = pointer
	}

	defragment () {
		this._first = null

		let prev = null
		const appendFree = (pointer) => {
			if (this._first === null) {
				this._first = pointer
			} else {
				this._array[prev + ENTRY_NEXT] = pointer
			}
			this._array[pointer + ENTRY_NEXT] = null
			prev = pointer
		}

		for (let i = 0; i < this._array.length; i += ENTRY_FIELDS) {
			const next = this._array[i + ENTRY_NEXT]
			if (next !== -1) {
				appendFree(i)
				continue
			}

			if (!this._first) { continue }

			const { pointer, value } = this.alloc()
			appendFree(i)
			this._array[pointer + ENTRY_OBJECT] = value
			this._move && this._move(value, pointer)
		}

		if (this._first) {
			if (this._destroy) {
				for (let i = this._first; i < this._array.length; i += ENTRY_FIELDS) {
					this._destroy(this._array[i + ENTRY_OBJECT])
				}
			}

			this._array.length = this._first
			this._first = null
		}
	}
}

module.exports = { Pool }
