import { EventManager } from '../EventManager.js'
import { players } from '../../player/PlayerManager.js'
import { entities } from '../../entity/EntityManager.js'
import {
  BeforeItemUseOnEvent,
  world,
} from 'mojang-minecraft'

export class ItemUseOn {
  private _events: EventManager
  public eventName = 'ItemUseOn'
  private prev: BeforeItemUseOnEvent

  constructor (events: EventManager) {
    this._events = events
    world.events.beforeItemUseOn.subscribe((data) => {
      this.prev = data
      let source
      if (data.source.id === "minecraft:player") {
        source = players.getPlayerByNameTag(data.source.nameTag)
      } else {
        source = entities.getEntityByVanilla(data.source)
      }

      return this._events.emit("ItemUseOn", {
        source: source,
        item: data.item,
        block: data.source.dimension.getBlock(data.blockLocation),
        cancelEvent: this.cancel.bind(this),
      })
    })
  }
  private cancel(): void {
    this.prev.cancel = true
  }
}
