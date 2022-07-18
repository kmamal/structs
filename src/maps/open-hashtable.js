
const getKey = (key) => key
const getValue = (key, value) => value
const getEntry = (key, value) => [ key, value ]

const ENTRY_KEY = 0
const ENTRY_VALUE = 1
const ENTRY_HASH = 2
const ENTRY_FIELDS = 3

class Hashtable {
	constructor (fn, capacity = 1) {
		this._fn = fn
		this._size = 0
		this._min_capacity = capacity
		this._capacity = capacity
		this._array = new Array(this._capacity * ENTRY_FIELDS)
	}

	get size () { return this._size }

	has (key) {
		const hash = this._fn(key)
		const entry_array_index = this._findEntryIndex(key, hash)
		const entry_key = this._array[entry_array_index + ENTRY_KEY]
		return entry_key !== undefined
	}

	get (key) {
		const hash = this._fn(key)
		const entry_array_index = this._findEntryIndex(key, hash)
		const entry_key = this._array[entry_array_index + ENTRY_KEY]
		if (entry_key === undefined) { return undefined }
		const entry_value = this._array[entry_array_index + ENTRY_VALUE]
		return entry_value
	}

	set (key, value) {
		const hash = this._fn(key)
		const entry_array_index = this._findEntryIndex(key, hash)

		this._array[entry_array_index + ENTRY_VALUE] = value

		const entry_key = this._array[entry_array_index + ENTRY_KEY]
		if (entry_key !== undefined) { return }

		this._array[entry_array_index + ENTRY_KEY] = key
		this._array[entry_array_index + ENTRY_HASH] = hash
		this._size += 1
		this._rebalance()
	}

	delete (key) {
		const hash = this._fn(key)
		const entry_array_index = this._findEntryIndex(key, hash)
		{
			const entry_key = this._array[entry_array_index + ENTRY_KEY]
			if (entry_key === undefined) { return false }
		}

		this._array[entry_array_index + ENTRY_KEY] = undefined
		this._size -= 1

		let target_array_index = entry_array_index
		shift_entries:
		for (;;) {
			fill_target: {
				for (let i = target_array_index + ENTRY_FIELDS; i < this._capacity * ENTRY_FIELDS; i += ENTRY_FIELDS) {
					const candidate_key = this._array[i + ENTRY_KEY]
					if (candidate_key === undefined) { break shift_entries }

					const candidate_hash = this._array[i + ENTRY_HASH]
					const goal_array_index = (candidate_hash % this._capacity) * ENTRY_FIELDS
					if (target_array_index < goal_array_index && goal_array_index <= i) { continue }

					this._array[target_array_index + ENTRY_KEY] = this._array[i + ENTRY_KEY]
					this._array[target_array_index + ENTRY_VALUE] = this._array[i + ENTRY_VALUE]
					this._array[target_array_index + ENTRY_HASH] = this._array[i + ENTRY_HASH]
					this._array[i + ENTRY_KEY] = undefined
					target_array_index = i
					break fill_target
				}

				for (let i = 0; i < target_array_index; i += ENTRY_FIELDS) {
					const candidate_key = this._array[i + ENTRY_KEY]
					if (candidate_key === undefined) { break shift_entries }

					const candidate_hash = this._array[i + ENTRY_HASH]
					const goal_array_index = (candidate_hash % this._capacity) * ENTRY_FIELDS
					if (target_array_index < goal_array_index || goal_array_index <= i) { continue }

					this._array[target_array_index + ENTRY_KEY] = this._array[i + ENTRY_KEY]
					this._array[target_array_index + ENTRY_VALUE] = this._array[i + ENTRY_VALUE]
					this._array[target_array_index + ENTRY_HASH] = this._array[i + ENTRY_HASH]
					this._array[i + ENTRY_KEY] = undefined
					target_array_index = i
					break fill_target
				}
			}
		}

		return true
	}

	* keys () { yield* this._iterate(getKey) }
	* values () { yield* this._iterate(getValue) }
	* entries () { yield* this._iterate(getEntry) }

	* _iterate (selector) {
		for (let i = 0; i < this._array.length; i += ENTRY_FIELDS) {
			const key = this._array[i + ENTRY_KEY]
			if (key === undefined) { continue }
			const value = this._array[i + ENTRY_VALUE]
			yield selector(key, value)
		}
	}

	_findEntryIndex (key, hash) {
		const entry_index = hash % this._capacity
		const entry_array_index = entry_index * ENTRY_FIELDS

		let end = this._capacity * ENTRY_FIELDS
		for (let i = entry_array_index; i < end; i += ENTRY_FIELDS) {
			const entry_key = this._array[i + ENTRY_KEY]
			if (entry_key === undefined || entry_key === key) { return i }
		}

		end = entry_array_index * ENTRY_FIELDS
		for (let i = 0; i < end; i += ENTRY_FIELDS) {
			const entry_key = this._array[i + ENTRY_KEY]
			if (entry_key === undefined || entry_key === key) { return i }
		}

		throw new Error("wtf")
	}

	_rebalance () {
		if (this._size === 0) { return }

		const ratio = this._size / this._capacity
		if (ratio > 3 / 4) {
			this._capacity *= 2
		} else if (ratio < 1 / 4) {
			if (this._capacity === this._min_capacity) { return }
			this._capacity /= 2
		} else {
			return
		}

		const old_array = this._array
		this._array = new Array(this._capacity * ENTRY_FIELDS)

		for (let i = 0; i < old_array.length; i += ENTRY_FIELDS) {
			const key = old_array[i + ENTRY_KEY]
			if (key === undefined) { continue }

			const value = old_array[i + ENTRY_VALUE]
			this._size -= 1
			this.set(key, value)
		}
	}

	_print () {
		console.log(this._array)
	}
}

module.exports = { Hashtable }
