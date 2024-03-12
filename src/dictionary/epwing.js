import { getBinariesPath, getUserDataPath } from '../util/appPaths';

export const importEpwing = async (epwingDir) => {
  const yomichanImportDir = await window.api.invoke("pathJoin", await getBinariesPath(), 'yomichan-import');
  let yomichanImport = await window.api.invoke("pathJoin",yomichanImportDir, 'yomichan-import');
  if ( await window.api.invoke("processPlatform") === 'win32') {
    yomichanImport += '.exe';
  }

  // Make destination filename based on src, that doesn't conflict
  // TODO: ensure that epwingDir is a directory?
  const srcParse = await window.api.invoke("pathParse", epwingDir);
  const srcBase = srcParse.name;
  const destDir = await window.api.invoke("pathJoin", await getUserDataPath(), 'dictionaries');
  await window.api.invoke("fsEnsureDirSync", destDir);

  let idx = 0;
  let destFn;
  while (true) {
    destFn = await window.api.invoke("pathJoin", destDir, srcBase);
    if (idx) {
      destFn += idx.toString();
    }
    destFn += '.zip';

    if (!(await window.api.invoke("fsExistsSync", destFn))) {
      break;
    }
    idx++;
  }

  console.log('importEpwing', yomichanImport, epwingDir, destFn);

  await window.api.invoke("childProcessExecFile", yomichanImport, [epwingDir, destFn], {cwd: yomichanImportDir, windowsHide: true});
};
