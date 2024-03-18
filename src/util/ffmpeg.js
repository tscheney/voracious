import { getBinariesPath } from '../util/appPaths';

const getBinaryFilename = async () => {
  const ffmpegDir = await window.api.invoke("pathJoin", await getBinariesPath(), 'ffmpeg');
  let result = await window.api.invoke("pathJoin", ffmpegDir, 'ffmpeg');
  const processPlatform = await window.api.invoke("processPlatform");
  if (processPlatform === 'win32') {
    result += '.exe';
  }
  return result;
};

export const extractAudio = async (vidfn, startTime, endTime) => {
  return await window.api.invoke("createMedia", "audio", await getBinaryFilename(), vidfn, startTime, endTime);  
};

export const extractFrameImage = async (vidfn, time) => {
  return await window.api.invoke("createMedia", "image", await getBinaryFilename(), vidfn, time);
};
