const { createTests } = require('./testing/test-cases-for-map')

createTests('closed-hashtable', 'Hashtable', [ (x) => x * 199 ])
