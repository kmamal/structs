const { createTests } = require('./testing/test-cases-for-map')
const { sub } = require('@kmamal/util/operators')

createTests('leaf-tree', 'LeafTree', [ sub ])
