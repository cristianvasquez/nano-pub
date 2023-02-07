import { QueryEngine } from '@comunica/query-sparql-rdfjs'
import { readFile } from 'fs/promises'
import { Store } from 'n3'
import { resolve } from 'path'
import { createTriplifier } from 'vault-triplifier'
import ns from './src/namespaces.js'
import rdf from './src/rdf-ext.js'

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
const dir = './example-vault'

const triplifier = await createTriplifier(dir)

// This can be any RDFJS source
const store = new Store()

for (const file of triplifier.getFiles()) {
  console.log('Processing file:', file)
  const text = await readFile(resolve(dir, file), 'utf8')
  const pointer = triplifier.toRDF(text, { path: file }, triplifyOptions)

  for (const quad of pointer.dataset) {
    const withGraph = rdf.quad(quad.subject, quad.predicate, quad.object,
      pointer.term)
    store.addQuad(withGraph)
  }
}

// Create our engine, and query it.
// If you intend to query multiple times, be sure to cache your engine for optimal performance.
const myEngine = new QueryEngine()

const bindingsStream = await myEngine.queryBindings(`
PREFIX schema: <http://schema.org/>
PREFIX ex: <http://example.org/>
PREFIX dot: <http://pkm-united.org/>

  SELECT * WHERE {
    GRAPH ?g {
      ?contact a ex:Contact ;
        schema:name ?contactName ;
        dot:wikipath ?wikipath .
    }
  } LIMIT 100`, {
  sources: [store],
})

// bindingsStream.on('data', (binding) => {
//   console.log(binding.toString()) // Quick way to print bindings for testing
//
// })
// bindingsStream.on('end', () => {
//   // The data-listener will not be called anymore once we get here.
// })
// bindingsStream.on('error', (error) => {
//   console.error(error)
// })

// Consume results as an array (easier)
const bindings = await bindingsStream.toArray()
console.log(bindings.forEach(x => console.log(x.toString())))
