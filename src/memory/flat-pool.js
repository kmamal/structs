
const ENTRY_NEXT = 0
const ENTRY_OVERHEAD = 1

class FlatPool {
	constructor ({ move, min, max, fields }) {
		this._move = move

		this._user_fields = fields
		this._entry_fields = ENTRY_OVERHEAD + fields

		this._min_capacity = min || 0
		this._max_capacity = max || Infinity
		this._array = []
		this._first = null
		if (min > 0) {
			this._first = 0
			const end = (min - 1) * this._entry_fields
			let index = 0
			while (index < end) {
				const next = index + this._entry_fields
				this._array[index + ENTRY_NEXT] = next
				index = next
			}
			this._array[index + ENTRY_NEXT] = null
		}
	}

	alloc () {
		if (this._array.length === this._max_capacity * this._entry_fields) {
			throw new Error("out of memory")
		}

		// Grow
		if (this._first === null) {
			const pointer = this._array.length
			this._array.length += this._entry_fields
			this._array[pointer + ENTRY_NEXT] = -1
			return pointer + ENTRY_OVERHEAD
		}

		const pointer = this._first
		const next = this._array[pointer + ENTRY_NEXT]
		this._first = next
		this._array[pointer + ENTRY_NEXT] = -1
		return pointer + ENTRY_OVERHEAD
	}

	free (_pointer) {
		const pointer = _pointer - ENTRY_OVERHEAD
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

		for (let i = 0; i < this._array.length; i += this._entry_fields) {
			const next = this._array[i + ENTRY_NEXT]
			if (next !== -1) {
				appendFree(i)
				continue
			}

			if (!this._first) { continue }

			const pointer = this.alloc() - ENTRY_OVERHEAD
			appendFree(i)
			for (let j = 0; j < this._user_fields; j++) {
				this._array[pointer + ENTRY_OVERHEAD + j] = this._array[i + ENTRY_OVERHEAD + j]
			}
			this._move && this._move(i + ENTRY_OVERHEAD, pointer + ENTRY_OVERHEAD)
		}

		if (this._first) {
			this._array.length = this._first
			this._first = null
		}
	}
}

module.exports = { FlatPool }
