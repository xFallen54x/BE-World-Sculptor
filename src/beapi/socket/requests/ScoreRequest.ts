import { SocketManager } from '../SocketManager.js'
import { players } from '../../player/PlayerManager.js'

export class ScoreRequest {
  private _socket: SocketManager
  public requestName = 'ScoreRequest'
  public parameters = "player: String, data: {objective: String}; returns data: Number"

  constructor(socket: SocketManager) {
    this._socket = socket
    this._socket.on('Message', (packet) => {
      if (packet.event != "ScoreRequest") return
      if (!players.getPlayerList().has(packet.player)) return this._socket.sendMessage({
        berp: {
          event: "ScoreRequest",
          message: "Player Not Found!",
          requestId: packet.requestId,
        },
      })
      if (!packet.data) return this._socket.sendMessage({
        berp: {
          event: "ScoreRequest",
          message: "You must supply an objective!",
          requestId: packet.requestId,
        },
      })
      const player = players.getPlayerByName(packet.player)
      const score = player.getScore(packet.data.objective)
    
      return this._socket.sendMessage({
        berp: {
          event: "ScoreRequest",
          message: "Returning score value.",
          data: score,
          requestId: packet.requestId,
        },
      })
    })
  }
}
