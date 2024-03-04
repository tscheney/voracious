import { getBinariesPath, getUserDataPath } from '../util/appPaths';

export const importEpwing = async (epwingDir) => {
  const yomichanImportDir = window.path.join(getBinariesPath(), 'yomichan-import');
  let yomichanImport = window.path.join(yomichanImportDir, 'yomichan-import');
  if ( window.process.platform() === 'win32') {
    yomichanImport += '.exe';
  }

  // Make destination filename based on src, that doesn't conflict
  // TODO: ensure that epwingDir is a directory?
  const srcBase = window.path.parse(epwingDir).name;
  const destDir = window.path.join(getUserDataPath(), 'dictionaries');
  await window.fs.ensureDir(destDir);

  let idx = 0;
  let destFn;
  while (true) {
    destFn = window.path.join(destDir, srcBase);
    if (idx) {
      destFn += idx.toString();
    }
    destFn += '.zip';

    if (!(await window.fs.existsSync(destFn))) {
      break;
    }
    idx++;
  }

  console.log('importEpwing', yomichanImport, epwingDir, destFn);
  return new Promise((resolve, reject) => {
    window.childProcess.execFile(yomichanImport, [epwingDir, destFn], {cwd: yomichanImportDir, windowsHide: true}, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve(destFn);
    });
  });
};
