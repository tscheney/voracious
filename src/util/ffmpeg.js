import { getBinariesPath } from '../util/appPaths';

const getBinaryFilename = () => {
  const ffmpegDir = window.api.invoke("pathJoin", getBinariesPath(), 'ffmpeg');
  let result = window.api.invoke("pathJoin", ffmpegDir, 'ffmpeg');
  if (process.platform === 'win32') {
    result += '.exe';
  }
  return result;
};

export const extractAudio = async (vidfn, startTime, endTime) => {
  const tmpfile = await window.tmpPromise.file({keep: true, postfix: '.mp3'});

  await new Promise((resolve, reject) => {
    const subp = window.childProcess.spawn(getBinaryFilename(), ['-ss', startTime.toString(), '-i', vidfn, '-t', (endTime-startTime).toString(), '-map', '0:a:0', '-ab', '192k', '-f', 'mp3', '-y', tmpfile.path], {windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});

    subp.on('error', (error) => {
      reject(error);
    });

    subp.stderr.on('data', (data) => {
      console.log(`ffmpeg extract audio stderr: ${data}`);
    });

    subp.on('exit', (code) => {
      if (code) {
        reject(new Error('ffmpeg exit code ' + code));
      }
      resolve();
    });
  });

  const data = await window.fs.readFile(tmpfile.path);

  tmpfile.cleanup();

  return data;
};

export const extractFrameImage = async (vidfn, time) => {
  const tmpfile = await window.tmpPromise.file({keep: true, postfix: '.jpg'});

  await new Promise((resolve, reject) => {
    const subp = window.childProcess.spawn(getBinaryFilename(), ['-ss', time.toString(), '-i', vidfn, '-vf', "scale='min(480,iw)':'min(240,ih)':force_original_aspect_ratio=decrease", '-frames:v', '1', "-q:v", "6", '-y', tmpfile.path], {windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']});

    subp.on('error', (error) => {
      reject(error);
    });

    subp.stderr.on('data', (data) => {
      console.log(`ffmpeg extract image stderr: ${data}`);
    });

    subp.on('exit', (code) => {
      if (code) {
        reject(new Error('ffmpeg exit code ' + code));
      }
      resolve();
    });
  });

  const data = await window.fs.readFile(tmpfile.path);

  tmpfile.cleanup();

  return data;
};
