import React from 'react';

export default function SystemBrowserLink(props) {

  async function handleClick(e) {
    e.preventDefault();
    await window.api.invoke("shellOpenExternal", props.href)
  }  
    
  return (
    <a href="#external" onClick={handleClick}>{props.children}</a>
  );
}
