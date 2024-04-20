import { readFile } from 'fs/promises'
import { Store } from 'oxigraph'
import { resolve } from 'path'
import rdf from 'rdf-ext'
import { createTriplifier } from 'vault-triplifier'

async function createStore ({ vaultPath, triplifyOptions }) {
  const triplifier = await createTriplifier(vaultPath)
  const store = new Store()
  for (const path of triplifier.getFiles()) {
    const text = await readFile(resolve(vaultPath, path), 'utf8')
    const { dataset, term } = triplifier.toRDF(text, { path }, triplifyOptions)
    for (const { subject, predicate, object } of dataset) {
      store.add(rdf.quad(subject, predicate, object, term))
    }
  }
  return { store }
}

export { createStore }
