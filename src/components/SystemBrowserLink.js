import React from 'react';

export default function SystemBrowserLink(props) {
  return (
    <a href="#external" onClick={e => { e.preventDefault(); window.shell.openExternal(props.href); }}>{props.children}</a>
  );
}
