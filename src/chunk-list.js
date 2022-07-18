const { startIndex } = require('../array/start-index')
const { endIndex } = require('../array/end-index')
const { binarySearchRight } = require('../array/search/binary')
const { concat } = require('../array/concat')
const B = require('buffer')

class ChunkList {
	constructor () {
		this._chunks = []
		this._chunk_limits = [ 0 ]
		this._end_index = 0
		this._start_index = 0

		return new Proxy(this, {
			get: (obj, prop) => {
				const index = parseInt(prop, 10)
				if (Number.isNaN(index)) { return obj[prop] }
				return obj.at(index)
			},
		})
	}

	get length () { return this._end_index - this._start_index }

	push (chunk) {
		this._chunks.push(chunk)
		const next_limit = this._end_index + chunk.length
		this._chunk_limits.push(next_limit)
		this._end_index = next_limit
	}

	shift (num) {
		const shifted = this.slice(0, num)

		this._start_index += shifted.length
		for (;;) {
			if (this._chunk_limits.length === 1) { break }
			const [ , next_end ] = this._chunk_limits
			if (this._start_index < next_end) { break }
			this._chunks.shift()
			this._chunk_limits.shift()
		}

		return shifted
	}

	_findIndexes (_index) {
		const index = _index + this._start_index
		if (index < this._start_index || this._end_index <= index) { return undefined }

		const chunk_index = binarySearchRight(this._chunk_limits, index) - 1
		const offset = this._chunk_limits[chunk_index]
		const index_in_chunk = index - offset

		return { chunk_index, index_in_chunk }
	}

	at (index) {
		const { chunk_index, index_in_chunk } = this._findIndexes(index)
		const chunk = this._chunks[chunk_index]
		return chunk[index_in_chunk]
	}

	_findSlices (first, last) {
		const first_indexes = this._findIndexes(first)
		const last_indexes = this._findIndexes(last)

		if (!first_indexes || !last_indexes) { return [] }

		const num_chunks = (last_indexes.chunk_index - first_indexes.chunk_index) + 1

		if (num_chunks === 1) {
			const chunk = this._chunks[first_indexes.chunk_index]
			return [ chunk.slice(first_indexes.index_in_chunk, last_indexes.index_in_chunk + 1) ]
		}

		const slices = Array.from({ length: num_chunks })

		// Slice first chunk
		const first_chunk = this._chunks[first_indexes.chunk_index]
		slices[0] = first_chunk.slice(first_indexes.index_in_chunk)

		// Use full intermediate ones
		for (let i = 1; i < num_chunks - 1; i++) {
			const chunk_index = i + first_indexes.chunk_index
			slices[i] = this._chunks[chunk_index]
		}

		// Slice last chunk
		const last_chunk = this._chunks[last_indexes.chunk_index]
		slices[num_chunks - 1] = last_chunk.slice(0, last_indexes.index_in_chunk + 1)

		return slices
	}

	slice (start, end) {
		const { length } = this
		const first = startIndex(length, start)
		const last = endIndex(length, end) - 1
		const slices = this._findSlices(first, last)
		const [ slice ] = slices
		return !slice ? []
			: (typeof slices[0] === 'string' && slices.join(''))
			|| (slices[0] instanceof B.Buffer && B.Buffer.concat(slices))
			|| concat(slices)
	}
}

module.exports = { ChunkList }
