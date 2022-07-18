
const getKey = ({ key }) => key
const getValue = ({ value }) => value
const getEntry = ({ key, value }) => [ key, value ]

class LeafTree {
	constructor (fn) {
		this._fn = fn
		this._root = null
		this._size = 0
	}

	get size () { return this._size }

	has (key) { return this._root ? this._has(this._root, key) : false }
	_has (node, key) {
		const cmp = this._fn(node.key, key)
		if (node.weight === 1) { return cmp === 0 }
		return cmp >= 0
			? this._has(node.left, key)
			: this._has(node.right, key)
	}

	get (key) { return this._root ? this._get(this._root, key) : undefined }
	_get (node, key) {
		const cmp = this._fn(node.key, key)
		if (node.weight === 1) { return cmp === 0 ? node.value : undefined }
		return cmp >= 0
			? this._get(node.left, key)
			: this._get(node.right, key)
	}

	set (key, value) {
		if (!this._root) {
			this._root = {
				key,
				value,
				weight: 1,
			}
			this._size = 1
			return true
		}

		return this._set(this._root, null, undefined, key, value)
	}

	_set (node, parent, parent_cmp, key, value) {
		const cmp = this._fn(node.key, key)
		if (node.weight === 1) {
			if (cmp === 0) {
				node.value = value
				return false
			}

			const tee = {
				key: null,
				weight: 2,
				left: null,
				right: null,
			}

			const sibling = {
				key,
				value,
				weight: 1,
			}

			if (cmp > 0) {
				tee.left = sibling
				tee.right = node
			} else {
				tee.left = node
				tee.right = sibling
			}
			tee.key = tee.left.key

			if (parent) {
				if (parent_cmp >= 0) {
					parent.left = tee
				} else {
					parent.right = tee
				}
			} else {
				this._root = tee
			}

			this._size += 1
			return true
		}

		const created = cmp >= 0
			? this._set(node.left, node, cmp, key, value)
			: this._set(node.right, node, cmp, key, value)

		if (created) { this._rebalance(node, parent, parent_cmp) }

		return created
	}

	delete (key) { return this._root ? this._delete(this._root, null, undefined, null, undefined, key) : false }
	_delete (node, parent, parent_cmp, grandparent, grandparent_cmp, key) {
		const cmp = this._fn(node.key, key)
		if (node.weight === 1) {
			if (cmp !== 0) { return false }

			if (parent) {
				const sibling = parent_cmp >= 0 ? parent.right : parent.left
				if (grandparent) {
					if (grandparent_cmp >= 0) {
						grandparent.left = sibling
					} else {
						grandparent.right = sibling
					}
				} else {
					this._root = sibling
				}
			} else {
				this._root = null
			}

			this._size -= 1
			return true
		}

		const deleted = cmp >= 0
			? this._delete(node.left, node, cmp, parent, parent_cmp, key)
			: this._delete(node.right, node, cmp, parent, parent_cmp, key)

		if (deleted && parent) { this._rebalance(parent, grandparent, grandparent_cmp) }

		return deleted
	}

	* keys () { yield* this._visit(this._root, getKey) }
	* values () { yield* this._visit(this._root, getValue) }
	* entries () { yield* this._visit(this._root, getEntry) }

	* _visit (node, visitor) {
		if (!node) { return }
		yield* this._visit(node.left, visitor)
		if (node.weight === 1) { yield visitor(node) }
		yield* this._visit(node.right, visitor)
	}

	_rebalance (node, parent, parent_cmp) {
		const left_weight = node.left.weight
		const right_weight = node.right.weight
		node.weight = left_weight + right_weight

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
			if (parent_cmp >= 0) {
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
		const mid_weight = middle_subtree.weight
		node.weight = (node.weight - right_weight) + mid_weight
		right.weight = (right_weight - mid_weight) + node.weight
	}

	_rotateRight (node, parent, parent_cmp) {
		const { left } = node

		if (parent) {
			if (parent_cmp >= 0) {
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
		const mid_weight = middle_subtree.weight
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

module.exports = { LeafTree }
