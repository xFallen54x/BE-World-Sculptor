import { Tick } from "./tick.js"
import { PlayerJoin } from "./PlayerJoin.js"
import { PlayerLeft } from "./PlayerLeft.js"
import { PlayerMessage } from "./PlayerMessage.js"
import { EntityCreate } from './EntityCreate.js'
import { Explosion } from './Explosion.js'
import { ItemUse } from './ItemUse.js'
import { ItemUseOn } from './ItemUseOn.js'

export const defaultEvents = [
  Tick,
  PlayerJoin,
  PlayerLeft,
  PlayerMessage,
  EntityCreate,
  Explosion,
  ItemUse,
  ItemUseOn,
]
