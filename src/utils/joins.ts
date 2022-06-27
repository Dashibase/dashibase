import { useStore } from '@/utils/store'
import { Attribute, AttributeType, Page } from '@/utils/config'

/*
Get innermost foreign table from an attributeId
e.g. "one(two(three))" => "two"
*/
export function getForeignTable (attributeId:string) {
  if (!attributeId.includes('(')) return ''
  return attributeId.split('(').slice(-2)[0]
}

/*
Construct new attributeId that points to primary key of foreign table
e.g. if "two_id" is the primary key of a table named "two"
then "one(two(three))" => "one(two(two_id))"
*/
export function getForeignPrimaryKeyAttribute (attributeId:string) {
  const store = useStore()
  if (!attributeId.includes('(')) return attributeId
  const foreignTable = getForeignTable(attributeId)
  const parts = attributeId.split('(')
  let foreignKey = parts.map((str, i) => {
    if (i < parts.length - 1) return str
    else return store.dashboard.schema.t[foreignTable].pk || 'id'
  }).join('(')
  parts.slice(0, -1).forEach(() => foreignKey += ')')
  return foreignKey
}

/*
This processes page.attributes to add relevant primary key and foreign key attributes
We need these to key items in the tables
*/
export function getQueryAttributes (page:Page) {
  const store = useStore()
  const queryAttributes = JSON.parse(JSON.stringify(page.attributes)) as Attribute[]
  // Add primaryKey
  queryAttributes.push({
    id: store.dashboard.schema.t[page.table_id].pk || 'id',
    label: store.dashboard.schema.t[page.table_id].pk || 'id',
    required: false,
    readonly: false,
    hidden: false,
    type: AttributeType.Text
  })
  // For each foreign table, add the foreign primary key as a nested attribute string
  queryAttributes.filter(attr => attr.id.includes('('))
    .forEach(attr => {
      const foreignPrimaryKey = getForeignPrimaryKeyAttribute(attr.id)
      if (!queryAttributes.some(attr => attr.id === foreignPrimaryKey)) queryAttributes.push({
        id: foreignPrimaryKey,
        label: foreignPrimaryKey,
        required: false,
        readonly: false,
        hidden: false,
        type: AttributeType.Text
      })
    })
  return queryAttributes
}
