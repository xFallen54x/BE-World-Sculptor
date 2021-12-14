import { BlockLocation, world, Block } from 'mojang-minecraft'
import {
    commands,
    events,
    executeCommand,
    Player,
} from '../beapi/BeAPI.js'

import { ItemUse } from '../types/BeAPI.i.js'

let CurrentBrushes: Array<Brush> = []

class Brush {

    public id: string = 'ws:paint_brush'
    public player: Player
    public distance: number
    private fillArea: Array<[number, number, number]>
    private blocks: Array<[string, number]>
    //private undo: Array<[string, number, {x: number, y: number, z: number}]>
    //private redo: Array<[string, number, {x: number, y: number, z: number}]>
    private enabled: boolean = false

    constructor(player: Player, type: string, size: number, distance: number) {

        if (type == 'sphere') this.fillArea = this.generateSphere(size)
        if (type == 'cube') this.fillArea = this.generateCube(size)

        this.player = player
        this.distance = distance

        events.on('ItemUse', (data) => {
            const source = data.source as Player
            const item = data.item

            if (item.id != this.id) return
            if (source.getNameTag() != this.player.getNameTag()) return
            if (!this.enabled) return this.onEnabled()

            this.paint()
        })
    }

    public onEnabled() {
        this.enabled = true
        return this.player.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §7Your paint brush has been §aEnabled`)
    }

    private paint() {
        for (const [x, y, z] of this.fillArea) {
            const [id, data] = this.getRandomBlock()
            //this.undo.push([id, data, {x, y, z}])
            executeCommand(`execute "${this.player.getExecutableName()}" ^^^${this.distance} fill ~${x} ~${y} ~${z} ~${x} ~${y} ~${z} ${id} ${data} replace air 0`)
        }
    }

    private getRandomBlock() {
        this.blocks = []

        for (let slot = 1; slot != 8; slot++) {
            const item = this.player.getInventory().getItem(slot)
            if (!item || item.id == this.id) continue
            this.blocks.push([item.id, item.data])
        }

        if (this.blocks.length == 0) return

        const randomIndex = Math.floor(Math.random() * this.blocks.length)
        return this.blocks[randomIndex]
    }

    public generateSphere(size: number): [number, number, number][] {
        const coords: [number, number, number][] = []
        for (let i = -size; i <= size; i++)
            for (let j = -size; j <= size; j++)
                for (let k = -size; k <= size; k++)
                    if (i * i + j * j + k * k <= size * size)
                        coords.push([i, j, k])

        return coords
    }
    public generateCube(size: number): [number, number, number][] {
        const coords: [number, number, number][] = []
        for (let i = -size; i <= size; i++)
            for (let j = -size; j <= size; j++)
                for (let k = -size; k <= size; k++)
                    coords.push([i, j, k])

        return coords
    }

    public onDisabled() {
        this.enabled = false
        return this.player.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §7Your paint brush has been §cDisabled`)
    }
}

commands.registerCommand({
    'command': 'wsbrush',
    'description': 'World Sculptor paint brush tool'
}, (data) => {
    const findBrush = CurrentBrushes.find((brush) => brush.player.getNameTag() == data.sender.getNameTag())

    if (!findBrush) {
        if (data.args[0] == undefined)
            return data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cInvalid Syntax: Unexpected '': at '-wsbrush ' >><<\n§cExpected: -§7wsbrush <type: sphere / cube> <size: number> <distance: number>`);
        if (data.args[1] == undefined)
            return data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cInvalid Syntax: Unexpected '': at '-wsbrush ' >><<\n§cExpected: -§7wsbrush ${data.args[0]} <size: number> <distance: number>`);
        if (data.args[2] == undefined)
            return data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cInvalid Syntax: Unexpected '': at '-wsbrush ' >><<\n§cExpected: -§7wsbrush ${data.args[0]} ${data.args[1]} <distance: number>`);

        CurrentBrushes.push(
            new Brush(
                data.sender,
                data.args[0],
                parseInt(data.args[1]),
                parseInt(data.args[2])
            )
        )
    }

    if (findBrush) {
        if (data.args[0] == undefined)
            data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r Here are the brush commands\n -§7wsbrush <enabled / disable\n -§7wsbrush edit <type: sphere / cube> <size: number> <distance: number>\n -§7wsbrush destroy`);


        switch (data.args[0]) {
            case 'enable':

                findBrush.onEnabled()

                break;

            case 'disable':

                findBrush.onDisabled()

                break;

            case 'edit':

                if (data.args[1] == undefined)
                    return data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cInvalid Syntax: Unexpected '': at '-wsbrush ' >><<\n§cExpected: -§7wsbrush <type: sphere / cube> <size: number> <distance: number>`);
                if (data.args[2] == undefined)
                    return data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cInvalid Syntax: Unexpected '': at '-wsbrush ' >><<\n§cExpected: -§7wsbrush ${data.args[1]} <size: number> <distance: number>`);
                if (data.args[3] == undefined)
                    return data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cInvalid Syntax: Unexpected '': at '-wsbrush ' >><<\n§cExpected: -§7wsbrush ${data.args[1]} ${data.args[2]} <distance: number>`);

                if (data.args[1] == 'cube') findBrush.generateCube(parseInt(data.args[2]))
                if (data.args[1] == 'sphere') findBrush.generateCube(parseInt(data.args[2]))

                findBrush.distance = parseInt(data.args[3])

                data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §7Brush has been successfuly §aEdited`)

                break;

            case 'destroy':

                CurrentBrushes.filter((brush, index) => {
                    if (brush.player.getNameTag() == data.sender.getNameTag()) {
                        return CurrentBrushes.splice(index, 1)
                    }
                })

                break;

            case 'undo':

                data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cThis feature is currently not avaliable`)

                break;

            case 'redo':

                data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cThis feature is currently not avaliable`)

                break;

            default:

                data.sender.sendMessage(`§l§8[§r§dWorld Sculptor§l§8]§r §cInvalid arguments`)

                break;
        }
    }
})
