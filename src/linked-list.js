
class LinkedList {
	constructor () {
		this._size = 0
		this._head = null
	}

	size () { return this._size }

	* values () {
		let node = this._head
		while (node) {
			yield node.value
			node = node.next
		}
	}

	_get (index) {
		if (index < 0 || this._size <= index) { return null }

		let node = this._head
		for (let i = 0; i < index; i++) {
			node = node.next
		}
		return node
	}

	get (index) { return this._get(index)?.value }

	set (index, value) {
		const node = this._get(index)
		if (node === null) { return undefined }
		const oldValue = node.value
		node.value = value
		return oldValue
	}

	_shift () {
		const node = this._head
		if (node === null) { return undefined }
		this._size--
		this._head = node.next
		return node
	}

	shift () { return this._shift()?.value }

	_unshiftNode (node) {
		node.next = this._head
		this._head = node
		this._size++
	}

	_unshift (value) {
		const node = { value }
		this._unshiftNode(node)
		return node
	}

	unshift (value) { this._unshift(value) }

	_insertNodeAfter (before, node) {
		node.next = before.next
		before.next = node
		this._size++
	}

	_insertAfter (before, value) {
		const node = { value }
		this._insertNodeAfter(before, node)
		return node
	}

	_insertAt (index, value) {
		if (index === 0) {
			return this._unshift(value)
		}

		const before = this._get(index - 1)
		if (before === null) { return null }
		return this._insertAfter(before, value)
	}

	insertAt (index, value) { this._insertAt(index, value) }

	_removeAfter (before) {
		const node = before.next
		if (node === null) { return null }
		this._size--
		before.next = node.next
		return node
	}

	removeAt (index) {
		if (index === 0) { return this.shift() }

		const before = this._get(index - 1)
		if (before === null) { return undefined }
		const node = this._removeAfter(before)
		return node.value
	}
}

module.exports = { LinkedList }
