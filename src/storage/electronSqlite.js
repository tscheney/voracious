import { getUserDataPath } from '../util/appPaths';

// NOTE: We use window.require instead of require or import so that
//  Webpack doesn't transform it. These requires happen at runtime
//  via Electron loading mechanisms.

class ElectronSqliteBackend {
  constructor(dbFilename) {
    this.dbFilename = dbFilename;
  }

  async initialize() {
    await window.api.invoke("dbInitialize", this.dbFilename)
  }

  async getItemMaybe(key) {
    const row = await window.api.invoke("dbGet", 'SELECT * FROM kv WHERE k = ?', key);
    return row && row.v;
  }

  async getItem(key) {
    const value = this.getItemMaybe(key);
    if (value === undefined) {
      throw new Error('item not found');
    }
    return value;
  }

  async getItems(keys) {
    const inPlaceholder = '(' + keys.map(() => '?').join(',') + ')';
    const rows = await window.api.invoke("dbAll", 'SELECT * FROM kv WHERE k IN ' + inPlaceholder, keys);
    if (rows.length !== keys.length) {
      throw new Error('not all items found');
    }

    const result = new Map();
    for (const row of rows) {
      const k = row.k;
      if (result.has(k)) {
        throw new Error('loaded same key more than once?');
      }
      result.set(k, row.v);
    }

    // Extra sanity check
    for (const k of keys) {
      if (!result.has(k)) {
        throw new Error('missed a key');
      }
    }

    return result;
  }

  async setItem(key, value) {
    // This is supposedly the right way to upsert in sqlite
    // NOTE: This wouldn't really be safe if we had multiple calls
    //  to setItem for same key back to back. There could be a race
    //  where they both try to INSERT, I think.
    // TODO: Since all calls go through this same backend object,
    //  and they're all async, we could serialize them here.
    const { changes } = await window.api.invoke("dbRun", 'UPDATE kv SET v = ? WHERE k = ?', value, key);
    if (changes === 0) {
      // If changes is 0 that means the UPDATE failed to match any rows
      await window.api.invoke("dbRun", 'INSERT INTO kv (k, v) VALUES (?, ?)', key, value);
    }
  }

  async removeItem(key) {
    await window.api.invoke("dbRun", 'DELETE FROM kv WHERE k = ?', key);
  }

  // This is used for loading the word list on startup.
  async getAllWords() {
    const rows = await window.api.invoke("dbAll", 'SELECT * FROM words');

    const word_list = new Map();
    for (const row of rows) {
      const word = row.word;
      word_list.set(word, row.data);
    }

    return word_list;
  }

  // Sets a word in the words table.
  async setWord(word, data) {
    // This is supposedly the right way to upsert in sqlite
    // NOTE: This wouldn't really be safe if we had multiple calls
    //  to setItem for same key back to back. There could be a race
    //  where they both try to INSERT, I think.
    // TODO: Since all calls go through this same backend object,
    //  and they're all async, we could serialize them here.
    const { changes } = await window.api.invoke("dbRun", 'UPDATE words SET data = ? WHERE word = ?', data, word);
    if (changes === 0) {
      // If changes is 0 that means the UPDATE failed to match any rows
      await window.api.invoke("dbRun", 'INSERT INTO words (word, data) VALUES (?, ?)', word, data);
    }
  }
}

export default async function createBackend() {
  const userDataPath = await getUserDataPath();
  //const dbFilename = path.join(userDataPath, 'voracious.db');
  const dbFilename = userDataPath + "\\voracious.db";
  const backend = new ElectronSqliteBackend(dbFilename);
  await backend.initialize();
  return backend;
}
