export const getUserDataPath = async () => {
  //let userPath = "";
  //await window.api.appGetPath("userData").then((response) => {
  //  userPath = response;
  //});
  //return userPath;
  return await window.api.invoke("appGetPath", "userData")
};

export const getResourcesPath = async () => {
  const appPath = await window.api.invoke('appGetAppPath');
  return await window.api.invoke("pathJoin", appPath, 'resources');
};

export const getBinariesPath = async  () => {
  const appPath = await window.api.invoke('appGetAppPath');
  console.log(appPath)
  if (appPath.endsWith('.asar')) {
    appPath += '.unpacked';
  }
  const processPlatform = await window.api.invoke("processPlatform");
  console.log(processPlatform)
  return await window.api.invoke("pathJoin", appPath, 'resources', 'bin', processPlatform);
};
