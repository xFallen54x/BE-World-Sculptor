/* eslint-disable @typescript-eslint/no-var-requires */
const childProcess = require("child_process")
const fs = require("fs")
const path = require("path")
const copydir = require('copy-dir')
const templateBP = require('./template/manifest.json')
const templateRP = require('../resource/manifest.json')
const { v4 } = require("uuid-1345")
const { zip } = require('zip-a-folder')

function update() {
  console.log('[INFO] Installing packages...')

  return new Promise((res) => {
    childProcess.exec("npm i", {
      cwd: process.cwd(),
    }, (err, out, s) => {
      if (err) {
        console.log('[ERROR] Failed to install packages.', out, s)

        return res(false)
      } else {
        console.log('[INFO] Installation complete...')

        return res(true)
      }
    })
  })
}

function build() {
  console.log('[INFO] Building package...')

  return new Promise((res) => {
    childProcess.exec("npm run build", {
      cwd: process.cwd(),
    }, (err, out, s) => {
      if (err) {
        console.log('[ERROR] Failed to build package.', out, s)

        return res(false)
      } else {
        console.log('[INFO] Build complete...')

        return res(true)
      }
    })
  })
}

function copyBPfiles() {
  console.log('[INFO] [Behavior] Copying Pack files...')

  return new Promise(async (res) => {
    if (!fs.existsSync(path.resolve(process.cwd() + "/output"))) fs.mkdirSync(path.resolve(process.cwd() + "/output"))
    if (!fs.existsSync(path.resolve(process.cwd() + "/output/tempBP"))) fs.mkdirSync(path.resolve(process.cwd() + "/output/tempBP"))
    if (!fs.existsSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI"))) fs.mkdirSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI"))
    if (!fs.existsSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI/scripts"))) fs.mkdirSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI/scripts"))
    if (!fs.existsSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI/animation_controllers"))) copydir(path.resolve(process.cwd() + "/animation_controllers"), path.resolve(process.cwd() + "/output/tempBP/BeAPI/animation_controllers"), {
      utimes: true,
      mode: true,
      cover: true,
    })
    if (!fs.existsSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI/functions"))) copydir(path.resolve(process.cwd() + "/functions"), path.resolve(process.cwd() + "/output/tempBP/BeAPI/functions"), {
      utimes: true,
      mode: true,
      cover: true,
    })
    if (!fs.existsSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI/entities"))) copydir(path.resolve(process.cwd() + "/entities"), path.resolve(process.cwd() + "/output/tempBP/BeAPI/entities"), {
      utimes: true,
      mode: true,
      cover: true,
    })
    if (!fs.existsSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI/items"))) copydir(path.resolve(process.cwd() + "/items"), path.resolve(process.cwd() + "/output/tempBP/BeAPI/items"), {
      utimes: true,
      mode: true,
      cover: true,
    })
    copydir(path.resolve(process.cwd() + "/scripts"), path.resolve(process.cwd() + "/output/tempBP/BeAPI/scripts"), {
      utimes: true,
      mode: true,
      cover: true,
    }, async () => {
      const raw = JSON.stringify(templateBP)
      await fs.writeFileSync(path.resolve(process.cwd() + "/output/tempBP/BeAPI/manifest.json"), `${raw.replace("|NAME|", "§l§dWorld §bSculptor §6BP").replace(/\|DESC\|/g, `Advanced Essentials World Edit made with the Gametest Framework. Compiled on ${new Date().toLocaleTimeString()} ${new Date().toDateString()}`)
        .replace("|UUID1|", v4())
        .replace("|UUID2|", v4())}`)
      console.log('[INFO] [Behavior] Copy complete...')

      return res(true)
    })
  })
}

function copyRPfiles() {
  console.log('[INFO] [Resource] Copying Pack files...')

  return new Promise(async (res) => {
    if (!fs.existsSync(path.resolve(process.cwd() + "/resource"))) return res(true)
    copydir(path.resolve(process.cwd() + "/resource"), path.resolve(process.cwd() + "/output/tempRP"), {
      utimes: true,
      mode: true,
      cover: true,
    }, async () => {
      const raw = JSON.stringify(templateRP)
      await fs.writeFileSync(path.resolve(process.cwd() + "/output/tempRP/manifest.json"), `${raw.replace("|NAME|", "§l§dWorld §bSculptor §6RP").replace(/\|DESC\|/g, `Advanced Essentials World Edit made with the Gametest Framework. Compiled on ${new Date().toLocaleTimeString()} ${new Date().toDateString()}`)
        .replace("|UUID1|", v4())
        .replace("|UUID2|", v4())}`)
      console.log('[INFO] [Resource] Copy complete...')

      return res(true)
    })
  })
}

function zipBPfolder() {
  console.log('[INFO] [Behavior] Zipping folder...')

  return new Promise(async (res) => {
    await zip(path.resolve(process.cwd() + "/output/tempBP"), path.resolve(process.cwd() + "/output/WorldSculptor-BP.mcpack"))
    fs.rmdirSync(path.resolve(process.cwd() + "/output/tempBP"), {
      recursive: true,
    })

    return res(true)
  })
}


function zipRPfolder() {
  console.log('[INFO] [Resource] Zipping folder...')

  return new Promise(async (res) => {
    await zip(path.resolve(process.cwd() + "/output/tempRP"), path.resolve(process.cwd() + "/output/WorldSculptor-RP.mcpack"))
    fs.rmdirSync(path.resolve(process.cwd() + "/output/tempRP"), {
      recursive: true,
    })

    return res(true)
  })
}
async function start() {
  await update()
  await build()
  await copyBPfiles()
  await copyRPfiles()
  await zipBPfolder()
  await zipRPfolder()

  console.log('[INFO] Done!')
}

start()
