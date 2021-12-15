import { existsSync, mkdirSync } from 'fs'
import Schema from './modules/schema'
import { resolve } from 'path'

/**
 * Create a new database.
 *
 * @name dbLocal
 * @constructor
 * @returns {{Schema: Schema}}
 */
function dbLocal({ path } = { path: './databases' }) {
  const databasePath = resolve(path)
  if (!existsSync(databasePath)) mkdirSync(databasePath)

  return {
    Schema: (model, schema) => Schema(model, schema, path),
  }
}

export default dbLocal
