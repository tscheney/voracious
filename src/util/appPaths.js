export const getUserDataPath = async () => {
  //let userPath = "";
  //await window.api.fromAppGetPath("userData").then((response) => {
  //  userPath = response;
  //});
  //return userPath;
  return await window.api.invoke("fromAppGetPath", "userData")
};

export const getResourcesPath = () => {
  return window.path.join(window.app.getAppPath(), 'resources');
};

export const getBinariesPath = () => {
  let appPath = window.api.appGetAppPath();
  if (appPath.endsWith('.asar')) {
    appPath += '.unpacked';
  }
  return window.path.join(appPath, 'resources', 'bin', window.info.process());
};
