
const getKey = (key) => key
const getValue = (key, value) => value
const getEntry = (key, value) => [ key, value ]

const ENTRY_KEY = 0
const ENTRY_HASH = 1
const ENTRY_VALUE = 2
const ENTRY_FIELDS = 3

const _findEntryIndex = (arr, key) => {
	let index = 0
	while (index < arr.length) {
		if (arr[index + ENTRY_KEY] === key) { break }
		index += ENTRY_FIELDS
	}
	return index
}

class Hashtable {
	constructor (fn, capacity = 1) {
		this._fn = fn
		this._size = 0
		this._min_capacity = capacity
		this._capacity = capacity
		this._array = new Array(this._capacity)
	}

	get size () { return this._size }

	has (key) {
		const hash = this._fn(key)
		const index = hash % this._capacity
		const array = this._array[index]
		if (!array) { return false }

		const entry_array_index = _findEntryIndex(array, key)
		const entry_key = array[entry_array_index + ENTRY_KEY]
		return entry_key !== undefined
	}

	get (key) {
		const hash = this._fn(key)
		const index = hash % this._capacity
		const array = this._array[index]
		if (!array) { return undefined }

		const entry_array_index = _findEntryIndex(array, key)
		const entry_key = array[entry_array_index + ENTRY_KEY]
		if (entry_key === undefined) { return undefined }

		const entry_value = array[entry_array_index + ENTRY_VALUE]
		return entry_value
	}

	set (key, value) {
		const hash = this._fn(key)
		const index = hash % this._capacity

		let array = this._array[index]
		let entry_array_index
		if (!array) {
			array = new Array(ENTRY_FIELDS)
			this._array[index] = array
			entry_array_index = 0
		} else {
			entry_array_index = _findEntryIndex(array, key)
		}

		array[entry_array_index + ENTRY_VALUE] = value

		const entry_key = array[entry_array_index + ENTRY_KEY]
		if (entry_key !== undefined) { return }

		array[entry_array_index + ENTRY_KEY] = key
		array[entry_array_index + ENTRY_HASH] = hash

		this._size += 1
		this._rebalance()
	}

	delete (key) {
		const hash = this._fn(key)
		const index = hash % this._capacity
		const array = this._array[index]
		if (!array) { return false }

		const entry_array_index = _findEntryIndex(array, key)
		const entry_key = array[entry_array_index + ENTRY_KEY]
		if (entry_key === undefined) { return false }

		const last_entry_index = array.length - ENTRY_FIELDS
		if (last_entry_index > entry_array_index) {
			array[entry_array_index + ENTRY_KEY] = array[last_entry_index + ENTRY_KEY]
			array[entry_array_index + ENTRY_HASH] = array[last_entry_index + ENTRY_HASH]
			array[entry_array_index + ENTRY_VALUE] = array[last_entry_index + ENTRY_VALUE]
		}
		array.length -= ENTRY_FIELDS

		this._size -= 1
		this._rebalance()
		return true
	}

	* keys () { yield* this._iterate(getKey) }
	* values () { yield* this._iterate(getValue) }
	* entries () { yield* this._iterate(getEntry) }

	* _iterate (selector) {
		for (let i = 0; i < this._array.length; i++) {
			const array = this._array[i]
			if (!array) { continue }

			for (let j = 0; j < array.length; j += ENTRY_FIELDS) {
				const key = array[j + ENTRY_KEY]
				if (key === undefined) { continue }
				const value = array[j + ENTRY_VALUE]
				yield selector(key, value)
			}
		}
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
		this._array = new Array(this._capacity)

		for (let i = 0; i < old_array.length; i++) {
			const array = old_array[i]
			if (!array) { continue }

			for (let j = 0; j < array.length; j += ENTRY_FIELDS) {
				const key = array[j + ENTRY_KEY]
				const value = array[j + ENTRY_VALUE]
				this._size -= 1
				this.set(key, value)
			}
		}
	}

	_print () {
		console.log(this._array)
	}
}

module.exports = { Hashtable }
