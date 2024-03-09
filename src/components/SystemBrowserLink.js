import React from 'react';

export default async function SystemBrowserLink(props) {
    
  return (
    <a href="#external" onClick={e => { e.preventDefault(); window.api.invoke("shellOpenExternal", props.href); }}>{props.children}</a>
  );
}
