import React, { Component } from 'react';

import './ImportEpwing.css';

import SecondaryScreen from './SecondaryScreen.js';
import SystemBrowserLink from './SystemBrowserLink.js';
import Button from './Button.js';
import { importEpwing } from '../dictionary';

export default class ImportEpwing extends Component {
  constructor(props) {
    super(props);

    this.state = {
      epwingDirectory: undefined,
      importing: false,
      statusType: 'working',
      statusText: '',
    };
  }

  handleIpcChoseDirectory = (file) => {
    this.setState({epwingDirectory: file});
  };

  handleClickChooseDirectory = (e) => {
    e.preventDefault();
    
    const dialogConfig = {
        title: 'Choose EPWING file',
        buttonLabel: 'Choose',
        properties: ['openFile']
    };
    window.api.invoke('dialog', 'showOpenDialog', dialogConfig)
        .then(result => {
            if(!result.canceled)
            {
              this.handleIpcChoseDirectory(result.filePaths[0])
            }
        });   
  };

  handleImport = async () => {
    this.setState({
      importing: true,
      statusType: 'working',
      statusText: 'Importing ' + this.state.epwingDirectory + '... (may take a while)',
    });

    try {
      await importEpwing(this.state.epwingDirectory);

      await this.props.onReloadDictionaries(progressMsg => {
        this.setState({
          statusText: 'Reloading dictionaries: ' + progressMsg,
        });
      });

      this.setState({
        importing: false,
        statusType: 'success',
        statusText: 'EPWING imported successfully',
        epwingDirectory: undefined,
      });
    } catch (e) {
      console.log(e.message);
      let statusText = 'Something went wrong';
      if (e.message.includes('unrecognized dictionary format')) {
        statusText = 'The file you selected is not an EPWING dictionary';
      } else if (e.message.includes('failed to find compatible extractor')) {
        statusText = 'The EPWING you selected is not supported (see instructions above)';
      }

      this.setState({
        importing: false,
        statusType: 'error',
        statusText: statusText,
      });
    }
  };

  render() {
    const { onExit } = this.props;

    return (
      <SecondaryScreen title="Import EPWING Dictionary">
        <div>If your EPWING dictionary is archived (e.g. a ZIP or RAR file), first unarchive it. Note that Voracious relies on Yomichan Importer to import EPWINGS, and only certain specific dictionaries are supported (<SystemBrowserLink href="https://foosoft.net/projects/yomichan-import/">see the list here</SystemBrowserLink>).</div>
        <br />
        <div>File: {this.state.epwingDirectory || <span><i>None selected</i></span>} <button disabled={this.state.importing} onClick={this.handleClickChooseDirectory}>Choose File</button></div>
        <br />
        <div className={'ImportEpwing-status ImportEpwing-status-' + this.state.statusType}>{this.state.statusText}&nbsp;</div>
        <br />
        <div>
          <Button disabled={!this.state.epwingDirectory || this.state.importing} onClick={this.handleImport}>Import Selected File</Button>&nbsp;
          <Button disabled={this.state.importing} onClick={onExit}>Back</Button>
        </div>
      </SecondaryScreen>
    );
  }
}
