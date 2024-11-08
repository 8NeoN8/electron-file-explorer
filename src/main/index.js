import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const configFileRoute = join(app.getPath('userData'),'config.json')
const currentOS = require('os').platform()

let appConfig = null

require('@electron/remote/main').initialize()

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    minWidth: 750,
    minHeight: 450,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    resizable: true,
  })

  require("@electron/remote/main").enable(mainWindow.webContents)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

async function runCmd(command) {
  const { stdout, stderr } = await exec(command);
  return stdout
}

async function getWinBinDir(){

  let user = await runCmd('whoami')
  user = user.split('\\')[1].replaceAll(/\s/g,'')

  let userSID = await runCmd(`wmic useraccount where name="${user}" get sid`)
  userSID = userSID.split('\r\r\n')[1].replaceAll(/\s/g,'').replaceAll(' ','')

  const binLocation = `C:\\$Recycle.Bin\\${userSID}`

  return binLocation
}


async function createConfigFile(){
  let baseConfiguration = {
    homeDirectory: null,
    recycleBinDir: await getWinBinDir(),
    os: currentOS
  }

  let baseConfigurationJSON = JSON.stringify(baseConfiguration)

  fs.writeFile(configFileRoute, baseConfigurationJSON, 'utf8', (err) => {
    if(err){
      //console.log(err);
    }

    getConfigs()
  })
}

async function checkConfig(){
  fs.access(configFileRoute, fs.constants.F_OK, (err) => {
    if (err){
      createConfigFile()
    }
    if(!err){
      getConfigs()
    }
  });
}

function getConfigs(){
  appConfig = JSON.parse(fs.readFileSync(configFileRoute, 'utf8'))
}

async function setHomeDir(homeDir){
  let config = null
  fs.readFile(configFileRoute, 'utf8', (err, data) => {
    config = JSON.parse(data)
    config.homeDirectory = homeDir

    config = JSON.stringify(config)

    fs.writeFile(configFileRoute, config, 'utf-8',(err) => console.log(err))
  })

}
/* async function sendToTrash(file){
  await shell.trashItem(file)
} */

async function sendToFakeTrash(file){
  console.log(file);
  /* const destination = join(appConfig.recycleBinDir, file.split('\\')[1])
  
  fs.copyFile(file, destination, (err) => {
    console.log('SE COPIO UN ARCHIVO A LA PAPELERA MARDICION');
    if(err) console.log('Error Moving file>>: ', err);
  })
  await removeOriginalForCopy(file) */
}

async function removeOriginalForCopy(file){
  console.log(file);
  if(fs.statSync(file).isDirectory()){
    console.log('SE VA A BORRAR UN ARCHIVO');
    fs.rmdir(file, (err) => {
      if(err) console.log('Error at original dir deletion>>: ', file, err);
    })
    return
  }

  fs.rm(file, (err) => {
    if(err) console.log('Error at original file deletion>>: ', err);
  })
}

async function deleteRecursiveDir(dir){
  let dirInfo = fs.readdirSync(dir).map(file => {
    let fullFile = {}
    let filepath = join(dir, file)
    fullFile.filePath = filepath
    fullFile.fileName = file
    return fullFile
  })

  dirInfo = dirInfo.filter(file => !file.fileName.includes('$') && !file.fileName.includes('desktop.ini'))

  dirInfo.forEach(dirOrFile => {
    if(fs.statSync(dirOrFile.filePath).isDirectory()){
      deleteRecursiveDir(dirOrFile.filePath)
    }else{
      console.log('Deleting file... ', dirOrFile.filePath);
      fs.rm(dirOrFile.filePath, (err) => {
        if(err) console.log('error borrando archivo>>: ',err);
      })
      console.log('archivo borrado>>: ', dirOrFile.fileName);
    }

  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.handle('IPC_GetConfig', () => {
    return appConfig
  })
  ipcMain.handle('IPC_SetHomeDir', (event, data) => {
    setHomeDir(data)
  })

  ipcMain.handle('IPC_SendToTrash', (event, data) => {
    sendToFakeTrash(data)
  })

  ipcMain.handle('IPC_ClearTrash', () => {
    deleteRecursiveDir(appConfig.recycleBinDir)
  })

  checkConfig()
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
