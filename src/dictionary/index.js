import { getResourcesPath, getUserDataPath } from '../util/appPaths';
import { loadYomichanZip, indexYomichanEntries } from './yomichan';
export { importEpwing } from './epwing';

const loadAndIndexYomichanZip = async (zipfn, builtin, reportProgress) => {
  const {name, termEntries} = await loadYomichanZip(zipfn, reportProgress);

  if (reportProgress) {
    reportProgress('Indexing ' + name + '...');
  }
  return {
    name,
    index: indexYomichanEntries(termEntries),
    builtin,
    filename: zipfn,
  };
};

const scanDirForYomichanZips = async (dir, builtin, reportProgress) => {
  const result = [];
  const dirents = await window.fs.readdir(dir);
  for (const dirent of dirents) {
    if (window.api.invoke("pathExtname", dirent) === '.zip') {
      // Assume any zips are Yomichan dicts
      const info = await loadAndIndexYomichanZip(window.api.invoke("pathJoin", dir, dirent), builtin, reportProgress);
      result.push(info);
    }
  }
  return result;
};

export const loadDictionaries = async (reportProgress) => {
  const result = [];

  // Scan for built-in dictionaries
  result.push(...await scanDirForYomichanZips(window.api.invoke("pathJoin", getResourcesPath(), 'dictionaries'), true, reportProgress));

  // Scan for imported dictionaries
  const importedPath = window.api.invoke("pathJoin", getUserDataPath(), 'dictionaries');
  if (await window.fs.existsSync(importedPath)) {
    result.push(...await scanDirForYomichanZips(window.api.invoke("pathJoin", getUserDataPath(), 'dictionaries'), false, reportProgress));
  }

  return result;
};

export const searchIndex = (index, word) => {
  const result = [];
  const sequences = index.wordOrReadingToSequences.get(word);
  if (sequences) {
    for (const seq of sequences) {
      const entry = index.sequenceToEntry.get(seq);
      result.push(Array.from(entry.glosses).join('\n'));
    }
  }

  return result;
};
