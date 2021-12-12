import { SocketManager } from '../SocketManager.js'
import { players } from '../../player/PlayerManager.js'

export class GetPlayers {
  private _socket: SocketManager
  public requestName = 'GetPlayers'
  public parameters = "returns data: {name: String, nameTag: String}[]"

  constructor(socket: SocketManager) {
    this._socket = socket
    this._socket.on('Message', (packet) => {
      if (packet.event != "GetPlayers") return
      const data = []
      for (const [, player] of players.getPlayerList()) {
        data.push({
          name: player.getName(),
          nameTag: player.getName(),
        })
      }
    
      return this._socket.sendMessage({
        berp: {
          event: "GetPlayers",
          message: "Sending all cached players.",
          data: data,
          requestId: packet.requestId,
        },
      })
    })
  }
}
