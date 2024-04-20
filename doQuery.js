import ns from './src/namespaces.js'

import { doConstruct, doSelect } from './src/query.js'
import { createStore } from './src/triplifier.js'

const triplifyOptions = {
  baseNamespace: ns.ex,
  addLabels: true,
  includeWikipaths: true,
  splitOnHeader: true,
  namespaces: ns,
  customMappings: {
    'lives in': ns.schema.address,
  },
}
const vaultPath = './example-vault'
const { store } = await createStore({ vaultPath, triplifyOptions })
// const query = `
// PREFIX schema: <http://schema.org/>
// PREFIX ex: <http://example.org/>
// PREFIX dot: <http://pkm-united.org/>
//
//   SELECT * WHERE {
//     GRAPH ?g {
//       ?contact a ex:Contact ;
//         schema:name ?contactName ;
//         dot:wikipath ?wikipath .
//     }
//   } LIMIT 100`
//
// const result = doSelect({ store, query })
// console.log(result)

const query = `
  CONSTRUCT {
    ?subject ?predicate ?object
  }
  WHERE {
    GRAPH ?g {
      ?subject ?predicate ?object
    }
  }
`
const dataset = doConstruct({ store, query })
console.log(dataset.toCanonical())
