const { createTests } = require('./testing/test-cases-for-map')
const { sub } = require('@kmamal/util/operators')

createTests('node-tree', 'NodeTree', [ sub ])
