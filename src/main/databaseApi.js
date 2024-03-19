const {ipcMain} = require('electron');

const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');

class DatabaseApi {
  constructor() {
    this.db = null; 
  }   

  async dbInitialize(dbFilename)
  {
    this.db = await sqlite.open({
      filename: dbFilename,
      driver: sqlite3.Database
    })
  
    // Table for most of the application data.
    await this.db.run('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)');
  
    // Table for tracking seen/known/etc. words.
    await this.db.run('CREATE TABLE IF NOT EXISTS words (word TEXT PRIMARY KEY, data TEXT)');
  }
}

export default function registerDbApi() {
  const dbApi = new DatabaseApi();
    
  ipcMain.handle('dbInitialize', async (event, dbFilename) => {
    return await dbApi.dbInitialize(dbFilename)
  })

  ipcMain.handle('dbRun', async (event, ...args) => {
    return await dbApi.db.run(...args)
  })

  ipcMain.handle('dbGet', async (event, ...args) => {
    return await dbApi.db.get(...args)
  })

  ipcMain.handle('dbAll', async (event, ...args) => {
    return await dbApi.db.all(...args)
  })  
}