'use strict'

import { Schema, model } from 'mongoose'
/**
 * Sample API model. Can safely be removed.
 */
interface ISample {
  _id: string
  name: string
}
const schema = new Schema<ISample>({
  _id: String,
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true,
    minlength: [1, 'Name must have at least one character.'],
    maxlength: [20, 'Name must have at most 20 characters.'],
    default: '',
  },
})

export default model<ISample>('Sample', schema)
