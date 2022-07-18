
const getKey = ({ key }) => key
const getValue = ({ value }) => value
const getEntry = ({ key, value }) => [ key, value ]

class NodeTree {
	constructor (fn) {
		this._fn = fn
		this._root = null
		this._size = 0
	}

	get size () { return this._size }

	has (key) { return this._has(this._root, key) }
	_has (node, key) {
		if (!node) { return false }
		const cmp = this._fn(node.key, key)
		if (cmp === 0) { return true }
		return cmp > 0 ? this._has(node.left, key) : this._has(node.right, key)
	}

	get (key) { return this._get(this._root, key) }
	_get (node, key) {
		if (!node) { return undefined }
		const cmp = this._fn(node.key, key)
		if (cmp === 0) { return node.value }
		return cmp > 0 ? this._get(node.left, key) : this._get(node.right, key)
	}

	set (key, value) { return this._set(this._root, null, undefined, key, value) }
	_set (node, parent, parent_cmp, key, value) {
		if (!node) {
			const child = { key, value, weight: 1, left: null, right: null }

			if (parent) {
				if (parent_cmp > 0) {
					parent.left = child
				} else {
					parent.right = child
				}
			} else {
				this._root = child
			}

			this._size += 1
			return true
		}

		const cmp = this._fn(node.key, key)
		if (cmp === 0) {
			node.value = value
			return false
		}

		const created = cmp > 0
			? this._set(node.left, node, cmp, key, value)
			: this._set(node.right, node, cmp, key, value)

		if (created) { this._rebalance(node, parent, parent_cmp) }

		return created
	}

	delete (key) { return this._delete(this._root, null, undefined, key) }
	_delete (node, parent, parent_cmp, key) {
		if (!node) { return false }
		const cmp = this._fn(node.key, key)
		if (cmp === 0) {
			this._removeNode(node, parent, parent_cmp)

			if (parent) {
				parent.weight -= 1
			}

			this._size -= 1
			return true
		}

		const deleted = cmp > 0
			? this._delete(node.left, node, cmp, key)
			: this._delete(node.right, node, cmp, key)

		if (deleted) { this._rebalance(node, parent, parent_cmp) }

		return deleted
	}

	_removeNode (node, parent, parent_cmp) {
		let replacement_parent = node
		let replacement = null
		let replacement_cmp

		if (node.right) {
			replacement = node.right
			replacement_cmp = -1
			while (replacement.left) {
				replacement_parent = replacement
				replacement = replacement.left
				replacement_cmp = 1
			}
		} else if (node.left) {
			replacement = node.left
			replacement_cmp = 1
			while (replacement.right) {
				replacement_parent = replacement
				replacement = replacement.right
				replacement_cmp = -1
			}
		}

		if (replacement) {
			this._removeNode(replacement, replacement_parent, replacement_cmp)

			replacement.left = node.left
			replacement.right = node.right
		}

		if (parent) {
			if (parent_cmp > 0) {
				parent.left = replacement
			} else {
				parent.right = replacement
			}
		} else {
			this._root = replacement
		}

		if (replacement) { this._rebalance(replacement, parent, parent_cmp) }
	}

	* keys () { yield* this._visit(this._root, getKey) }
	* values () { yield* this._visit(this._root, getValue) }
	* entries () { yield* this._visit(this._root, getEntry) }

	* _visit (node, visitor) {
		if (!node) { return }
		yield* this._visit(node.left, visitor)
		yield visitor(node)
		yield* this._visit(node.right, visitor)
	}

	_rebalance (node, parent, parent_cmp) {
		const left_weight = node.left?.weight || 0
		const right_weight = node.right?.weight || 0
		node.weight = left_weight + right_weight + 1

		const ratio = left_weight / right_weight

		if (ratio < 1 / 2 && right_weight > 1) {
			this._rotateLeft(node, parent, parent_cmp)
		} else if (ratio > 2 && left_weight > 1) {
			this._rotateRight(node, parent, parent_cmp)
		}
	}

	_rotateLeft (node, parent, parent_cmp) {
		const { right } = node

		if (parent) {
			if (parent_cmp > 0) {
				parent.left = right
			} else {
				parent.right = right
			}
		} else {
			this._root = right
		}

		const middle_subtree = right.left
		right.left = node
		node.right = middle_subtree

		const right_weight = right.weight
		const mid_weight = middle_subtree?.weight || 0
		node.weight = (node.weight - right_weight) + mid_weight
		right.weight = (right_weight - mid_weight) + node.weight
	}

	_rotateRight (node, parent, parent_cmp) {
		const { left } = node

		if (parent) {
			if (parent_cmp > 0) {
				parent.left = left
			} else {
				parent.right = left
			}
		} else {
			this._root = left
		}

		const middle_subtree = left.right
		left.right = node
		node.left = middle_subtree

		const left_weight = left.weight
		const mid_weight = middle_subtree?.weight || 0
		node.weight = (node.weight - left_weight) + mid_weight
		left.weight = (left_weight - mid_weight) + node.weight
	}

	_print () {
		const _print = (node, indent) => {
			if (!node) { return }
			_print(node.right, `${indent} `)
			console.log(`${indent}${node.key}(${node.weight})`)
			_print(node.left, `${indent} `)
		}
		_print(this._root, '')
	}
}

module.exports = { NodeTree }
