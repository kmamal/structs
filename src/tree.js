const { DoublyLinkedList } = require('./doubly-linked-list')

class Node {
	constructor () {
		this._parent = null
		this._nodeInParent = null
		this._children = new DoublyLinkedList()
	}

	get parent () { return this._parent }
	get children () { return [ ...this._children.values() ] }

	removeChild (child) {
		if (child._parent !== this) { throw Object.assign(new Error("not a child"), { child, parent: this }) }

		const node = child._nodeInParent
		this._children.remove(node)
		child._parent = null
		child._nodeInParent = null
	}

	repaceChild (target, child) {
		if (target._parent !== this) { throw Object.assign(new Error("not a child"), { child: target, parent: this }) }

		child.remove()
		const node = target._nodeInParent
		target._parent = null
		target._nodeInParent = null
		node.value = child
		child._parent = this
		child._nodeInParent = node
	}

	insertChildAt (index, child) {
		if (index < 0 || this._children.size() < index) { throw Object.assign(new Error("out of bounds"), { node: this, index }) }

		child.remove()
		const node = this._children._insertAt(index, child)
		child._parent = this
		child._nodeInParent = node
	}

	appendChild (child) {
		child.remove()
		const node = this._children._push(child)
		child._parent = this
		child._nodeInParent = node
	}

	prependChild (child) {
		child.remove()
		const node = this._children._unshift(child)
		child._parent = this
		child._nodeInParent = node
	}

	insertChildBefore (target, child) {
		const parent = target._parent
		if (parent === null) { throw Object.assign(new Error("no parent"), { child: target }) }

		child.remove()
		const node = parent._children._insertBefore(target._nodeInParent, child)
		child._parent = parent
		child._nodeInParent = node
	}

	insertChildAfter (target, child) {
		const parent = target._parent
		if (parent === null) { throw Object.assign(new Error("no parent"), { child: target }) }

		child.remove()
		const node = parent._children._insertAfter(target._nodeInParent, child)
		child._parent = parent
		child._nodeInParent = node
	}

	remove () { this._parent?.removeChild(this) }

	replace (target) {
		const parent = target._parent
		if (parent === null) { throw Object.assign(new Error("no parent"), { node: target }) }
		parent.replaceChild(target, this)
	}

	replaceWith (node) {
		const parent = this._parent
		if (parent === null) { throw Object.assign(new Error("no parent"), { node: this }) }
		parent.replaceChild(this, node)
	}

	insertAt (parent, index) { parent.insertChildAt(index, this) }
	appendTo (parent) { parent.appendChild(this) }
	prependTo (parent) { parent.prependChild(this) }

	insertBefore (node) {
		const parent = node._parent
		if (parent === null) { throw Object.assign(new Error("no parent"), { node }) }
		parent.insertChildBefore(node, this)
	}

	insertAfter (node) {
		const parent = node._parent
		if (parent === null) { throw Object.assign(new Error("no parent"), { node }) }
		parent.insertChildAfter(node, this)
	}
}

module.exports = { Node }
