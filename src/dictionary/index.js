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
  const dirents = await window.api.invoke("fsReadDirSync", dir);
  for (const dirent of dirents) {
    if (await window.api.invoke("pathExtname", dirent) === '.zip') {
      // Assume any zips are Yomichan dicts
      const yomiZipPath = await window.api.invoke("pathJoin", dir, dirent);
      const info = await loadAndIndexYomichanZip(yomiZipPath, builtin, reportProgress);
      result.push(info);
    }
  }
  return result;
};

export const loadDictionaries = async (reportProgress) => {
  const result = [];

  // Scan for built-in dictionaries
  const yomiChanPath = await window.api.invoke("pathJoin", await getResourcesPath(), 'dictionaries');
  result.push(...await scanDirForYomichanZips(yomiChanPath, true, reportProgress));

  // Scan for imported dictionaries
  const importedPath = await window.api.invoke("pathJoin", await getUserDataPath(), 'dictionaries');
  if (await window.api.invoke("fsExistsSync", importedPath)) {
    const userDictPath = await window.api.invoke("pathJoin", await getUserDataPath(), 'dictionaries');
    result.push(...await scanDirForYomichanZips(userDictPath, false, reportProgress));
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
