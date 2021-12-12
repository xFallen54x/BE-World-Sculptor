import {
  Entity as MCEntity,
  EntityHealthComponent,
} from 'mojang-minecraft'
import { entities } from './EntityManager.js'
import { events } from '../events/EventManager.js'
import {
  Health,
  Location,
} from '../../types/BeAPI.i.js'

export class Entity {
  private _nameTag: string
  private _id: string
  private _vanilla: MCEntity
  private _runtimeId: number

  constructor(entity: MCEntity) {
    this._nameTag = entity.nameTag
    this._id = entity.id
    this._vanilla = entity
    this._runtimeId = entities.getNewRuntimeId()
    entities.addEntity(this)
    this._setUpEntity()
  }
  private _setUpEntity(): void {
    this._vanilla.nameTag = `${this._id}:${this._runtimeId}`
    this._vanilla.runCommand(`scoreboard players set @s "ent:runtimeId" ${this._runtimeId}`)
    this._vanilla.nameTag = this._nameTag
  }
  public setNameTag(nameTag: string): void {
    this._nameTag = nameTag
    this._vanilla.nameTag = nameTag
  }
  public getNameTag(): string { return this._nameTag }
  public getId(): string { return this._id }
  public getVanilla(): MCEntity { return this._vanilla }
  public getRuntimeId(): number { return this._runtimeId }
  public destroy(): void {
    events.emit('EntityDestroyed', this)
    this._vanilla.kill()
    entities.removeEntity(this)
  }
  public executeCommand(command: string): {statusMessage?: any, data?: any, err?: boolean} {
    return this._vanilla.runCommand(command.replace(/\\/g, ""))
  }
  public getLocation(): Location {
    const pos = this._vanilla.location

    return {
      x: Math.floor(pos.x),
      y: Math.floor(pos.y - 1),
      z: Math.floor(pos.z),
      dimension: this._vanilla.dimension,
    }
  }
  public getHealth(): Health {
    const health = this._vanilla.getComponent("minecraft:health") as EntityHealthComponent

    return {
      current: health.current,
      max: health.value,
    }
  }
  public getTags(): string[] {
    return this._vanilla.getTags()
  }
  public hasTag(tag: string): boolean {
    return this._vanilla.hasTag(tag)
  }
  public addTag(tag: string): boolean {
    return this._vanilla.addTag(tag)
  }
  public removeTag(tag: string): boolean {
    return this._vanilla.removeTag(tag)
  }
}
