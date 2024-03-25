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

export const extractChapters = async(vidfn) => {
  const videoFn = vidfn.replace('local://', '')
  const rawOutput = await window.api.invoke("childProcessExecFile", await getBinaryFilename(), ["-i", videoFn, "-f", "ffmetadata", "pipe:"], {windowsHide: true});

  const rawChapters = rawOutput.out;
  let re = /TIMEBASE=(.*)/g;
  const timebases = [...rawChapters.matchAll(re)];
  re = /START=(.*)/g;
  const starts = [...rawChapters.matchAll(re)];
  re = /END=(.*)/g;
  const ends = [...rawChapters.matchAll(re)];
  re = /title=(.*)/g;
  const titles = [...rawChapters.matchAll(re)];

  let chapters = new Array();
  for (let i = 0; i < starts.length; i++)
  {
    let start = Number(starts[i][1]);
    if (!isNaN(start))
    {
      let end = Number(ends[i][1]);
      if (timebases.length != 0 && timebases[i][1] != "") {
        const timebaseParts = timebases[i][1].split('/');
        const num = Number(timebaseParts[0]);
        const den = Number(timebaseParts[1]);
        let timeFactor = 1;
        if (!isNaN(num) && !isNaN(den))
        {
          timeFactor = num / den;
          start = start * timeFactor;
          if (!isNaN(end))
          {
            end = end * timeFactor;
          }
        }
        
      }
      if (chapters.length == 0 && start != 0)
      {
        chapters.push({
          start: 0.0,
          end: start,
          title: "Beginning",
        });
      }
      chapters.push({
          start: start,
          end: end,
          title: titles[i][1],
      });
    }
  }
  return chapters;
};
