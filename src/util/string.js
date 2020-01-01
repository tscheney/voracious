import assert from 'assert';

export const startsWith = (s, prefix) => (s.substr(0, prefix.length) === prefix);

export const removePrefix = (s, prefix) => {
  assert(startsWith(s, prefix));
  return s.substr(prefix.length);
}

export const cpSlice = (s, cpBegin, cpEnd) => [...s].slice(cpBegin, cpEnd).join('');

export const secondsToTimestamp = (pos) => {
  const hrs = Math.floor(pos / (60*60));
  pos -= hrs * 60 * 60;
  const mnts = Math.floor(pos / 60);
  pos -= mnts * 60;
  const secs = Math.floor(pos);

  var time_stamp = "";
  if (hrs > 0) {
    time_stamp += hrs + ":";
    time_stamp += ("00" + mnts).slice(-2) + ":";
  } else {
    time_stamp += mnts + ":";
  }
  time_stamp += ("00" + secs).slice(-2);

  return time_stamp;
}