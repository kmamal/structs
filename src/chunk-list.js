const _ = require('@kmamal/util')

class AbstractChunkList {
	constructor () {
		this._chunks = []
		this._chunkBorders = [ 0 ]
		this._startIndex = 0
		this._endIndex = 0
	}

	get length () { return this._endIndex - this._startIndex }

	_findLocation (_index) {
		const index = _index + this._startIndex
		if (false
			|| index < this._startIndex
			|| this._endIndex <= index
		) { return undefined }

		const chunkIndex = _.searching.binarySearchRight(this._chunkBorders, index) - 1
		const chunkStart = this._chunkBorders[chunkIndex]
		const indexInChunk = index - chunkStart

		return { chunkIndex, indexInChunk }
	}

	at (_index) {
		const index = _.atIndex(this.length, _index)
		const location = this._findLocation(index)
		return location && this._chunks[location.chunkIndex][location.indexInChunk]
	}

	pushChunk (chunk) {
		this._chunks.push(chunk)
		const chunkEnd = this._endIndex + chunk.length
		this._chunkBorders.push(chunkEnd)
		this._endIndex = chunkEnd
	}

	shiftN (num) {
		const shifted = this.slice(0, num)

		this._startIndex += shifted.length

		let didBordersChange = false
		for (;;) {
			if (this._chunkBorders.length === 1) { break }
			const nextEnd = this._chunkBorders[1]
			if (this._startIndex < nextEnd) { break }
			this._chunks.shift()
			this._chunkBorders.shift()
			didBordersChange = true
		}

		if (didBordersChange) {
			const firstBorder = this._chunkBorders[0]
			this._chunkBorders[0] = 0
			for (let i = 1; i < this._chunkBorders.length; i++) {
				this._chunkBorders[i] -= firstBorder
			}
			this._startIndex -= firstBorder
			this._endIndex -= firstBorder
		}

		return shifted
	}

	slice (start, end) {
		const { length } = this
		const first = _.startIndex(length, start)
		const last = _.endIndex(length, end) - 1
		if (first > last) { return this._getEmpty() }

		const firstIndexes = this._findLocation(first)
		const lastIndexes = this._findLocation(last)

		if (!firstIndexes || !lastIndexes) { return this._getEmpty() }

		const numChunks = (lastIndexes.chunkIndex - firstIndexes.chunkIndex) + 1

		if (numChunks === 1) {
			const chunk = this._chunks[firstIndexes.chunkIndex]
			const slice = chunk.slice(firstIndexes.indexInChunk, lastIndexes.indexInChunk + 1)
			return this._concat([ slice ])
		}

		const slices = Array.from({ length: numChunks })

		// Slice first chunk
		const firstChunk = this._chunks[firstIndexes.chunkIndex]
		slices[0] = firstChunk.slice(firstIndexes.indexInChunk)

		// Use full intermediate ones
		for (let i = 1; i < numChunks - 1; i++) {
			const chunkIndex = i + firstIndexes.chunkIndex
			slices[i] = this._chunks[chunkIndex]
		}

		// Slice last chunk
		const lastChunk = this._chunks[lastIndexes.chunkIndex]
		slices[numChunks - 1] = lastChunk.slice(0, lastIndexes.indexInChunk + 1)

		return this._concat(slices)
	}
}

class ArrayChunkList extends AbstractChunkList {
	_getEmpty () { return [] }
	_concat (slices) { return _.concat(slices) }
}

class BufferChunkList extends AbstractChunkList {
	_getEmpty () { return Buffer.alloc(0) }
	_concat (slices) { return Buffer.concat(slices) }
}

class StringChunkList extends AbstractChunkList {
	_getEmpty () { return '' }
	_concat (slices) { return slices.join('') }
}

module.exports = {
	AbstractChunkList,
	ArrayChunkList,
	BufferChunkList,
	StringChunkList,
}
