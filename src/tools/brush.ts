import {
    commands,
    events,
    executeCommand,
    Player,
} from '../beapi/BeAPI.js'
import { ItemUse } from '../types/BeAPI.i.js'

let CurrentBrushes: Array<Brush> = []

class Brush {
    private fillArea: Array<[number, number, number]>
    private player: Player
    private distance: number
    private enabled: boolean = true

    constructor(player: Player, type: string, size: number, distance: number) {
        if (type == 'sphere') this.fillArea = this.generateSphere(size)
        if (type == 'cube') this.fillArea = this.generateCube(size)
        this.player = player

        this.distance = distance

        events.on('ItemUse', (data) => {
            this.onUse(data)
        })

        this.player.executeCommand(`function using_paint_brush`)
    }

    public onEnabled() {
        this.enabled = true
    }

    public onDisabled() {
        this.enabled = false
    }

    private getRandomBlock(blocks: Array<[string, number]>) {
        if (blocks.length == 0) return
        const randomIndex = Math.floor(Math.random() * blocks.length)
        const [id, data] = blocks[randomIndex]
        return `${id} ${data}`
    }

    public onUse(data: ItemUse) {
        if (!this.enabled) return
        let blocks: Array<[string, number]> = []
        let source = data.source as Player
        if (source.getNameTag() != this.player.getNameTag()) return
        for (let slot = 1; slot != 8; slot++) {
            const item = source.getInventory().getItem(slot)
            if (!item) continue
            blocks.push([item.id, item.data])
        }
        for (const [x, y, z] of this.fillArea) {
            executeCommand(`execute "${source.getExecutableName()}" ^^^${this.distance} fill ~${x} ~${y} ~${z} ~${x} ~${y} ~${z} ${this.getRandomBlock(blocks)} replace air 0`)
        }
    }

    private generateSphere(rad: number): [number, number, number][] {
        const coords: [number, number, number][] = []
        for (let i = -rad; i <= rad; i++)
            for (let j = -rad; j <= rad; j++)
                for (let k = -rad; k <= rad; k++)
                    if (i * i + j * j + k * k <= rad * rad)
                        coords.push([i, j, k])

        return coords
    }
    private generateCube(rad: number): [number, number, number][] {
        const coords: [number, number, number][] = []
        for (let i = -rad; i <= rad; i++)
            for (let j = -rad; j <= rad; j++)
                for (let k = -rad; k <= rad; k++)
                    coords.push([i, j, k])

        return coords
    }

}

commands.registerCommand({
    'command': 'wsbrush',
    'description': 'World Sculptor paint brush tool'
}, (data) => {
    CurrentBrushes.push(new Brush(data.sender, data.args[0], parseInt(data.args[1]), parseInt(data.args[2])))
})