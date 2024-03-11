import React, { Component } from 'react';

import './AddCollection.css';

import SecondaryScreen from './SecondaryScreen.js';
import SystemBrowserLink from './SystemBrowserLink.js';
import Button from './Button.js';

export default class AddCollection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collectionName: '',
      collectionDirectory: undefined,
    };

  }

  handleNameChange = (e) => {
    this.setState({collectionName: e.target.value});
  };

  handleIpcChoseCollectionDirectory = async (dir) => {
    this.setState({collectionDirectory: dir});
    console.log(dir)
    if (!this.state.collectionName) {
        console.log()
      this.setState({collectionName: await window.api.invoke("pathBasename", dir)});
    }
  };

  handleClickChooseCollectionDirectory = (e) => {
    e.preventDefault();
    
    const dialogConfig = {
        title: 'Select collection folder',
        buttonLabel: 'Choose',
        properties: ['openDirectory']
    };
    window.api.invoke('dialog', 'showOpenDialog', dialogConfig)
        .then(result => {
            if(!result.canceled)
            {
              this.handleIpcChoseCollectionDirectory(result.filePaths[0])
            }
        });    
  };

  handleAddCollection = () => {
    this.props.onAdd(this.state.collectionName, this.state.collectionDirectory);
  };

  render() {
    const { onExit } = this.props;

    return (
      <SecondaryScreen title="Add Collection">
        <div>Your collection folder should have your media and subtitles named and organized the same as for a media player like <SystemBrowserLink href="https://kodi.wiki/view/Naming_video_files">Kodi</SystemBrowserLink> or <SystemBrowserLink href="https://support.plex.tv/articles/#cat-media-preparation">Plex</SystemBrowserLink>. But unlike those, movies and TV shows can be mixed in the same folder. Note that Voracious <span style={{fontWeight: 'bold'}}>cannot currently play</span> some popular video/audio codecs including H.265 and AC3.</div>
        <br />
        <div><label>Display Name: <input style={{fontSize: 'inherit'}} value={this.state.collectionName} onChange={this.handleNameChange} placeholder="My Videos" /></label></div>
        <div>Folder: {this.state.collectionDirectory || <span><i>None selected</i></span>} <button onClick={this.handleClickChooseCollectionDirectory}>Choose Folder</button></div>
        <br />
        <div>
          <Button disabled={!this.state.collectionName || !this.state.collectionDirectory} onClick={this.handleAddCollection}>Add Collection</Button>&nbsp;
          <Button onClick={onExit}>Cancel</Button>
        </div>
      </SecondaryScreen>
    );
  }
}
