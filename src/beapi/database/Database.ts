import {
  db,
  entry,
} from '../../types/BeAPI.i.js'
import {
  executeCommand,
} from '../command/executeCommand.js'

export class Database {
  public readonly name: string
  public readonly id: number

  constructor(options: {
    name: string
    id?: number
  }, mount = false) {
    this.name = options.name
    this.id = options.id || Math.round(Math.random() * 100000)
    if (!mount) {
      executeCommand('scoreboard objectives add "database" dummy')
      executeCommand(`scoreboard players set "${this._generateJSON()}" "database" ${this.id}`)
    }
  }
  private _generateJSON(): string {
    const json = {
      database: {
        name: this.name,
        id: this.id,
        entries: [
          this.id,
        ],
      },
    }

    return JSON.stringify(json).replace(/"/g, "\\'")
  }
  private _getDbAsString(): string {
    const c = executeCommand("scoreboard players list").statusMessage.split("\n")
    const tables: db[] = []
    for (const t of c) {
      if (!t.startsWith("{'database':{'name':")) continue
      for (const db of t.replace(/'/g, '"').split(", ")) {
        tables.push(JSON.parse(db))
      }
    }

    return JSON.stringify(tables.find((x) => x.database.id === this.id))
  }
  private _updateDb(newDb: db): void {
    executeCommand(`scoreboard players reset "${this._getDbAsString().replace(/"/g, "\\'")}" database`)
    executeCommand(`scoreboard players set "${JSON.stringify(newDb).replace(/"/g, "\\'")}" "database" ${this.id}`)
  }
  public getEntries(): entry[] {
    const c = executeCommand("scoreboard players list").statusMessage.split("\n")
    const tables: db[] = []
    for (const t of c) {
      if (!t.startsWith("{'database':{'name':")) continue
      for (const db of t.replace(/'/g, '"').split(", ")) {
        tables.push(JSON.parse(db))
      }
    }

    return tables.find((x) => x.database.id === this.id).database.entries
  }
  public addEntry(entry: entry): void {
    const dbJson: db = JSON.parse(this._getDbAsString())
    dbJson.database.entries.push(entry)

    return this._updateDb(dbJson)
  }
  public removeEntry(name: string): void {
    const dbJson: db = JSON.parse(this._getDbAsString())
    const res = dbJson.database.entries.filter((x) => x.name !== name)
    dbJson.database.entries = res

    return this._updateDb(dbJson)
  }
}

export function getAllDatabases(): Map<string, Database> {
  const databases = new Map<string, Database>()
  const c = executeCommand("scoreboard players list").statusMessage.split("\n")
  const tables: db[] = []
  for (const t of c) {
    if (!t.startsWith("{'database':{'name':")) continue
    for (const db of t.replace(/'/g, '"').split(", ")) {
      tables.push(JSON.parse(db))
    }
  }
  for (const table of tables) {
    databases.set(table.database.name, new Database({
      name: table.database.name,
      id: table.database.id,
    }, true))
  }

  return databases
}
