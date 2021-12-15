import Methods from './methods'
import { resolve } from 'path'

const defaultId = { type: Number, default: Date.now(), required: true }

/**
 * Create a new Schema
 *
 * @name Schema
 * @function
 * @param {String} model
 * @param {Object} schema
 * @param {String} path
 * @returns {Methods}
 */

export type SchemaType = {
  _id?: {
    type: NumberConstructor | StringConstructor
    required: boolean
    default: number
  }
  [key: string]: {
    type: any
    default?: any
    required?: boolean
  }
}

function Schema(model: string, schema: SchemaType, path?: string) {
  if (!model)
    throw new Error('The Schema requires a name, see the documentation.')

  if (!schema._id) schema._id = defaultId

  if (![Number, String].includes(schema._id.type)) schema._id.type = Number

  if (!schema._id.required || !schema._id.default)
    Object.assign(schema._id, defaultId)

  const databasePath = resolve(`${path}/${model}.json`)

  return {
    ...Methods(schema, databasePath),
  }
}

export default Schema
