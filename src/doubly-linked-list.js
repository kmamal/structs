
class DoublyLinkedList {
	constructor () {
		this._size = 0
		this._head = null
		this._tail = null
	}

	size () { return this._size }

	* values () {
		let node = this._head
		while (node) {
			yield node.value
			node = node.next
		}
	}

	* valuesReverse () {
		let node = this._tail
		while (node) {
			yield node.value
			node = node.prev
		}
	}

	_getFromHead (index) {
		if (index < 0 || this._size <= index) { return null }

		let node = this._head
		for (let i = 0; i < index; i++) {
			node = node.next
		}
		return node
	}

	_getFromTail (index) {
		if (index < 0 || this._size <= index) { return null }

		let node = this._tail
		for (let i = 0; i < index; i++) {
			node = node.prev
		}
		return node
	}

	_get (indexFromHead) {
		const indexFromTail = (this._size - indexFromHead) - 1
		return indexFromHead <= indexFromTail
			? this._getFromHead(indexFromHead)
			: this._getFromTail(indexFromTail)
	}

	get (index) { return this._get(index)?.value }

	set (index, value) {
		const node = this._get(index)
		if (node === null) { return undefined }
		const oldValue = node.value
		node.value = value
		return oldValue
	}

	_unshiftNode (node) {
		node.prev = null
		node.next = this._head
		this._size++
		if (this._head) { this._head.prev = node }
		this._head = node
		if (!this._tail) { this._tail = node }
	}

	_unshift (value) {
		const node = { value }
		this._unshiftNode(node)
		return node
	}

	unshift (value) { this._unshift(value) }

	_pushNode (node) {
		node.prev = this._tail
		node.next = null
		this._size++
		if (this._tail) { this._tail.next = node }
		this._tail = node
		if (!this._head) { this._head = node }
	}

	_push (value) {
		const node = { value }
		this._pushNode(node)
		return node
	}

	push (value) { this._push(value) }

	_shift () {
		const node = this._head
		if (!node) { return null }

		this._size--
		const { next } = node
		this._head = next
		if (next) {
			next.prev = null
		} else {
			this._tail = null
		}
		return node
	}

	shift () { return this._shift()?.value }

	_pop () {
		const node = this._tail
		if (!node) { return null }

		this._size--
		const { prev } = node
		this._tail = prev
		if (prev) {
			prev.next = null
		} else {
			this._head = null
		}
		return node
	}

	pop () { return this._pop()?.value }

	_remove (node) {
		this._size--
		const { prev, next } = node
		if (prev) {
			prev.next = next
		} else {
			this._head = next
		}
		if (next) {
			next.prev = prev
		} else {
			this._tail = prev
		}
	}

	_insertNodeAfter (before, node) {
		this._size++
		const after = before.next
		before.next = node

		node.next = after
		node.prev = before

		if (after) {
			after.prev = node
		} else {
			this._tail = node
		}
	}

	_insertAfter (before, value) {
		const node = { value }
		this._insertNodeAfter(before, node)
		return node
	}

	_insertNodeBefore (after, node) {
		this._size++
		const before = after.prev
		after.prev = node

		node.next = after
		node.prev = before

		if (before) {
			before.next = node
		} else {
			this._head = node
		}
	}

	_insertBefore (after, value) {
		const node = { value }
		this._insertNodeBefore(after, node)
		return node
	}

	_insertAt (index, value) {
		if (index === 0) { return this._unshift(value) }

		const size = this._size
		if (index === size) { return this._push(value) }

		if (index < 0 || size < index) { return null }

		const indexFromHead = index - 1
		const indexFromTail = (size - index) - 1
		return indexFromHead <= indexFromTail
			? this._insertAfter(this._getFromHead(indexFromHead), value)
			: this._insertBefore(this._getFromTail(indexFromTail), value)
	}

	insertAt (index, value) { this._insertAt(index, value) }

	_removeAfter (before) {
		const node = before.next
		if (node === null) { return null }

		this._size--
		const after = node.next
		before.next = after
		if (after) {
			after.prev = before
		} else {
			this._tail = before
		}
		return node
	}

	_removeBefore (after) {
		const node = after.prev
		if (node === null) { return null }

		this._size--
		const before = node.prev
		after.prev = before
		if (before) {
			before.next = after
		} else {
			this._head = after
		}
		return node
	}

	removeAt (index) {
		if (index === 0) { return this.shift() }

		const size = this._size
		if (index === size - 1) { return this.pop() }

		if (index < 0 || size < index) { return undefined }

		const indexFromHead = index - 1
		const indexFromTail = (size - index) - 2
		const node = indexFromHead <= indexFromTail
			? this._removeAfter(this._getFromHead(indexFromHead))
			: this._removeBefore(this._getFromTail(indexFromTail))
		return node?.value
	}
}

module.exports = { DoublyLinkedList }
