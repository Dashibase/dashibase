
import * as _ from 'lodash'
import { useStore } from '@/utils/store'
import { loadDashboardMetadata } from './supabase'

export async function getSchema () {
  const metadata = await loadDashboardMetadata()
  const response = await fetch(`${metadata.supabaseUrl}/rest/v1/?apikey=${metadata.supabaseAnonKey}`)
  const schema = await (await response.json()).definitions
  const store = useStore()
  store.dashboard.schema = new Schema(schema)
  return schema 
}

interface TableSchema {
  required: string[];
  properties: { [attributeId:string]: { type:string, format:string, description?:string} };
  attributeIds: string[];
  pk: string;
  fk: ({ attributeId:string, table:string }|null)[];
}

export class Schema {
  _schema:any;
  t: { [tableId:string]:TableSchema };

  constructor (schema:any) {
    this._schema = schema
    this.t = {}
    // Initialize schema properties for easy access
    Object.keys(schema).forEach(tableId => {
      const table = schema[tableId] as any
      this.t[tableId] = {
        required: table.required,
        properties: table.properties,
        attributeIds: Object.keys(table.properties),
        pk: this._getPrimaryKey(table),
        fk: this._getForeignKeys(table),
      }
    })
  }

  /*
  Retrieve primary key of specific table
  */
  _getPrimaryKey (table:any) {
    const pkRegex = /<pk\/>/
    const primaryAttribute = Object.entries(table.properties).find((attr:any) => {
      const attributeVal = attr[1]
      if (!attributeVal.description) return false
      const match = attributeVal.description.match(pkRegex)
      if (match) return true
      else return false
    })
    if (primaryAttribute) return primaryAttribute[0]
    else return ''
  }

  /*
  Retrieve foreign keys and corresponding foreign tables
  */
  _getForeignKeys (table:any) {
    const outgoing = Object.entries(table.properties)
      .map((attr:any) => {
        const attributeId = attr[0]
        const attributeVal = attr[1]
        const fkRegex = /<fk table='(?<tableId>.*?)' column=/
        if (!attributeVal.description) return null
        const match = attributeVal.description.match(fkRegex)
        if (match) {
          return {
            attributeId,
            table: match.groups.tableId as string
          }
        } else {
          return null
        }
      })
      .filter(table => table)
    return outgoing
  }

  getForeignTable (tableId:string, foreignKey:string) {
    const column = this._schema[tableId].properties[foreignKey]
    if (!column.description) return null
    const foreignTableRgx = /<fk table='(?<foreignTableId>.*?)' column='(?<foreignJoinId>.*?)'\/>/
    const foreignTableMatch = column.description.match(foreignTableRgx)
    if (foreignTableMatch) {
      return {
        tableId: (foreignTableMatch.groups as any).foreignTableId,
        joinId: (foreignTableMatch.groups as any).foreignJoinId,
      }
    } else {
      return null
    }
  }

  getFkColumns (sourceTable:string, foreignTable:string) {
    // Might be more than one
    return this._getForeignKeys(this.t[sourceTable])
      .filter((out:any) => out.table === foreignTable)
      .map((out:any) => out.attributeId)
  }

  getJoinTable (table1:string, table2:string) {
    const incoming1 = Object.keys(this._schema).filter(table => this._getForeignKeys(this.t[table]).map((foreignTable:any) => foreignTable.table).includes(table1))
    const incoming2 = Object.keys(this._schema).filter(table => this._getForeignKeys(this.t[table]).map((foreignTable:any) => foreignTable.table).includes(table2))
    return _.intersection(incoming1, incoming2)[0]
  }
}
