import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
const fs = require('fs');
const path = require('path');
//const exec = require('child_process').exec;
const homedir = require('os').homedir();
const homeDirDesktop = join(homedir, 'Escritorio')

const util = require('util');
const exec = util.promisify(require('child_process').exec);

require('@electron/remote/main').initialize()

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
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

function ipcCommand(){
  console.log(app.getPath('userData'));
}

function execute(command, callback) {
  exec(command, (error, stdout, stderr) => { 
      if(error) console.log(error);
      callback(stdout); 
  });
}

async function runCmd(command) {
  const { stdout, stderr } = await exec(command);
  return stdout
}

async function getWinBinDir(){
  //const baseDir = 'C:\\$Recycle.Bin\\'
  //let binLocation = null

  let user = await runCmd('whoami')
  user = user.split('\\')[1].replaceAll(/\s/g,'')

  let userSID = await runCmd(`wmic useraccount where name="${user}" get sid`)
  userSID = userSID.split('\r\r\n')[1].replaceAll(/\s/g,'').replaceAll(' ','')

  let binLocation = `C:\\$Recycle.Bin\\${userSID}`

  console.log(binLocation);

  return binLocation

  /* let user = execute('whoami', (output) => {
    console.log('Output>>: ',output);
    return output
  }) */

  /* execute('whoami', (output) => {
    let user =  output.split('\\')[1]
    user = user.replaceAll(/\s/g,'')
    //console.log(user);

    binLocation = execute(`wmic useraccount where name="${user}" get sid`, (output) => {
      console.log(user,'inside sid req');
      let winSID = output.split('\r\r\n')[1]
      userSID = winSID
      return `C:\\$Recycle.Bin\\${userSID}`
    })
    
    console.log(binLocation,'before return');
    return binLocation
  }); */
  
}

async function getConfigs(){
  const binDir = await getWinBinDir() //* this should be os specific, change that later

  //console.log(path.join(app.getPath('userData'),'config.json'));

  fs.readFile(path.join(app.getPath('userData'),'config.json'), 'utf8', (err, data) => {
    if (err?.code == 'ENOENT') {

      let autoConfigs = {
        homeDirectory: homeDirDesktop,
        recycleBinDir: binDir
      }
      console.log(autoConfigs,'en la primera definicion!!!!!');
      let jsonConfigs = JSON.stringify(autoConfigs)

      fs.writeFile(path.join(app.getPath('userData'),'config.json'), jsonConfigs, 'utf8', (err) => {
        if(err) console.error(err);
      })
      getConfigs()
      return
      
    }
    
    let configs = JSON.parse(data)

    if(configs.recycleBinDir == '' || configs.recycleBinDir == null || !configs.recycleBinDir){
    
      configs.recycleBinDir = binDir

      let json = JSON.stringify(configs)

      fs.writeFile(path.join(app.getPath('userData'),'config.json'), json, 'utf8', (err) => {
        if(err) console.error(err);
      })
    }
  })
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
  ipcMain.handle('ipcTest', () => getConfigs())
  //ipcMain.handle('ping', () => ipcCommand())


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
