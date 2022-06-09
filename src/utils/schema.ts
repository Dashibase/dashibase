
import * as _ from 'lodash'

export class Schema {
  schema:any;

  constructor (schema:any) {
    this.schema = schema
  }

  getAttributeIds (tableId:string) {
    return Object.keys(this.schema[tableId].properties)
  }

  getPrimaryKey (tableId:string) {
    const pkRegex = /<pk\/>/
    const primaryAttribute = Object.entries(this.schema[tableId].properties).find((attr:any) => {
      const attributeVal = attr[1]
      if (!attributeVal.description) return false
      const match = attributeVal.description.match(pkRegex)
      if (match) return true
      else return false
    })
    if (primaryAttribute) return primaryAttribute[0]
    else return null
  }

  getForeignTable (tableId:string, foreignKey:string) {
    const column = this.schema[tableId].properties[foreignKey]
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
    return this.getOutgoingJoins(sourceTable)
      .filter((out:any) => out.table === foreignTable)
      .map((out:any) => out.attributeId)
  }

  // Get all relevant attributes, including from joined tables
  getRelevantAttributes (tableId:string, attributeIds:string[]) {
    function unionArray (obj:string[], src:string[]) {
      if (!obj) return src
      if (!src) return obj
      return _.union(obj, src)
    }
    const attributesObjs = attributeIds.map(attributeId => {
      const foreignTableRgx = /^(?<foreignTableId>@.*?)\.(?<foreignAttributeId>.*?)$/
      const foreignKeyRgx = /^(?<foreignKey>.*?)\.(?<foreignAttributeId>.*?)$/
      const foreignTableMatch = attributeId.match(foreignTableRgx)
      const foreignKeyMatch = attributeId.match(foreignKeyRgx)
      let attributes = {} as {[k:string]:string[]}
      if (foreignTableMatch) {
        // e.g. @TagRelations.tag.label or @Actors.name
        const foreignTableId = (foreignTableMatch.groups as any).foreignTableId
        const foreignAttributeId = (foreignTableMatch.groups as any).foreignAttributeId
        const subAttributes = this.getRelevantAttributes(foreignTableId, [foreignAttributeId])
        attributes = _.mergeWith(attributes, subAttributes, unionArray)
        return attributes
      } else if (foreignKeyMatch) {
        // e.g. director.name
        const foreignKey = (foreignKeyMatch.groups as any).foreignKey
        const foreignTable = this.getForeignTable(tableId, foreignKey)
        const foreignTableId = foreignTable?.tableId
        const foreignJoinId = foreignTable?.joinId
        const foreignAttributeId = (foreignKeyMatch.groups as any).foreignAttributeId
        const subAttributes = this.getRelevantAttributes(foreignTableId, [foreignAttributeId])
        attributes = _.mergeWith(attributes, subAttributes, unionArray)
        attributes = _.mergeWith(attributes, {[tableId]: [foreignKey]}, unionArray)
        attributes = _.mergeWith(attributes, {[foreignTableId]: [foreignJoinId]}, unionArray)
        return attributes
      } else {
        attributes[tableId] = [attributeId]
        return attributes
      }
    })
    let allAttributes = {} as {[k:string]:string[]}
    attributesObjs.forEach(obj => {
      allAttributes = _.mergeWith(allAttributes, obj, unionArray)
    })
    return allAttributes
  }

  getOutgoingJoins (tableId:string) {
    const outgoing = Object.entries(this.schema[tableId].properties).map((attr:any) => {
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
    }).filter(table => table)
    return outgoing
  }

  getIncomingJoins (tableId:string) {
    const firstDegreeTables = Object.keys(this.schema).filter(table => this.getOutgoingJoins(table).map((foreignTable:any) => foreignTable.table).includes(tableId))
    // Also get outgoing tables of incoming tables
    const incomingTables = [] as string[]
    firstDegreeTables.forEach(table => {
      incomingTables.push(table)
      this.getOutgoingJoins(table).map((foreignTable:any) => foreignTable.table)
        .forEach(foreignTable => {
          if (foreignTable !== tableId && !incomingTables.includes(foreignTable)) incomingTables.push(foreignTable)
        })
    })
    return incomingTables
  }

  getJoinTable (table1:string, table2:string) {
    const incoming1 = Object.keys(this.schema).filter(table => this.getOutgoingJoins(table).map((foreignTable:any) => foreignTable.table).includes(table1))
    const incoming2 = Object.keys(this.schema).filter(table => this.getOutgoingJoins(table).map((foreignTable:any) => foreignTable.table).includes(table2))
    return _.intersection(incoming1, incoming2)[0]
  }

  getAttributeType (tableId:string, attributeId:string) {
    return this.schema[tableId].properties[attributeId].type
  }
}
