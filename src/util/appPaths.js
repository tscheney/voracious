export const getUserDataPath = async () => {
  return await window.api.invoke("appGetPath", "userData")
};

export const getResourcesPath = async () => {
  const appPath = await window.api.invoke('appGetAppPath');
  return await window.api.invoke("pathJoin", appPath, 'resources');
};

export const getBinariesPath = async  () => {
  const appPath = await window.api.invoke('appGetAppPath');
  if (appPath.endsWith('.asar')) {
    appPath += '.unpacked';
  }
  const processPlatform = await window.api.invoke("processPlatform");
  return await window.api.invoke("pathJoin", appPath, 'resources', 'bin', processPlatform);
};
