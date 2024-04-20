import rdf from 'rdf-ext'
import pkg from 'sparqljs'

const { Parser } = pkg


function doSelect ({ store, query }) {
  const result = []

  // This is here because Oxygraph parser does not give feedback.
  new Parser().parse(query)

  for (const binding of store.query(query)) {
    const item = Object.fromEntries(binding)

    for (const [varName, term] of Object.entries(item)) {
      item[varName] = termInstance(term)
    }

    result.push(item)
  }
  console.log(`query ${store.size} quads, result size: ${result.length}`)
  return result
}

function doConstruct ({ store, query }) {
  const result = rdf.dataset()
  for (const current of store.query(query)) {
    const quad = rdf.quad(termInstance(current.subject),
      termInstance(current.predicate), termInstance(current.object))
    result.add(quad)
  }
  console.log(`store: ${store.size} elements, results: ${result.size}`)
  return result
}

// Used to defeat Oxygraph bug, hangs when invoking .value multiple times.
// TODO report a github issue
function termInstance (term) {
  if (term.termType === 'Literal') {
    return rdf.literal(term.value, term.language || term.datatype)
  } else if (term.termType === 'NamedNode') {
    return rdf.namedNode(term.value)
  } else if (term.termType === 'BlankNode') {
    return rdf.blankNode(term.value)
  } else if (term.termType === 'DefaultGraph') {
    return rdf.defaultGraph()
  } else {
    // Handle other RDF term types as needed
    return term
  }
}

export { doSelect, doConstruct }
