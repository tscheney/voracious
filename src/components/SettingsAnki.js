import React, { Component } from 'react';

import { ankiConnectInvoke } from '../util/ankiConnect';
import SystemBrowserLink from './SystemBrowserLink.js';

import './SettingsAnki.css';

const VORACIOUS_FIELD_NAMES = new Map([
  ['nofill', 'Don\'t fill'],
  ['text', 'Text'],
  ['text_readings', 'Text with kanji readings'],
  ['audio', 'Audio'],
  ['image', 'Image'],
  ['selected_text', 'Selected Text'],
  ['time_stamp', 'Timestamp (of subtitle)'],
  ['title', 'Title (of video)'],
]);

const FIELD_DEFAULTS = new Map([
  ['Expression', 'text'],
  ['Reading', 'text_readings'],
  ['Audio', 'audio'],
  ['Image', 'image'],
  ['Word', 'selected_text'],
]);

export default class SettingsAnki extends Component {
  constructor(props) {
    super(props);

    const { ankiPrefs } = this.props;

    this.state = {
      statusMessage: '',
      availableModels: [ankiPrefs.modelName],
      availableModelFields: new Map(),
      availableDecks: [ankiPrefs.deckName],
      selectedModel: ankiPrefs.modelName,
      selectedDeck: ankiPrefs.deckName,
      fieldMap: new Map([...ankiPrefs.fieldMap.entries()]),
    };
  }

  componentDidMount() {
    this.updateFromAnki();
  }

  updateFromAnki = async () => {
    this.setState({statusMessage: 'Connecting...'});
    let decksFromAC, modelsFromAC, modelFields;
    let decks, models;
    try {
      decksFromAC = await ankiConnectInvoke('deckNames', 6);
      modelsFromAC = await ankiConnectInvoke('modelNames', 6);
      modelFields = new Map();
      for (const mn of modelsFromAC) {
        const fields = await ankiConnectInvoke('modelFieldNames', 6, {modelName: mn});
        modelFields.set(mn, fields);
        //modelFields.push({key: mn, fields: fields,})
        //console.log(modelFields)
      }      
    } catch (e) {
      this.setState({
        statusMessage: e.toString(),
      });
      return;
    }

    decksFromAC.sort();
    let selectedDeck = this.state.selectedDeck;
    if (!selectedDeck || !decksFromAC.includes(selectedDeck)) {
      selectedDeck = decksFromAC.length ? decksFromAC[0] : null;
    }

    modelsFromAC.sort();
    let selectedModel = this.state.selectedModel;
    if (!selectedModel || !modelsFromAC.includes(selectedModel)) {
      selectedModel = modelsFromAC.length ? modelsFromAC[0] : null;
    }
    
    decks = new Map();
    for (let i = 0; i < decksFromAC.length; i++)
    {
      decks.set(i, decksFromAC[i]);
    }
    
    models = new Map();
    for (let i = 0; i < modelsFromAC.length; i++)
    {
        models.set(i, modelsFromAC[i]);
    }

    this.setState({
      statusMessage: 'Successfully connected',
      availableModels: models,
      availableModelFields: modelFields,
      availableDecks: decks,
      selectedDeck,
      selectedModel,
      fieldMap: this.computeFieldMap(selectedModel, modelFields),
    });
  };

  handleRefresh = async () => {
    await this.updateFromAnki();
  };

  computeFieldMap = (modelName, availableModelFields) => {
    const fieldMap = new Map();
    if (availableModelFields.has(modelName)) {
      const fields = availableModelFields.get(modelName);
      for (const fn of fields) {
        const vorfn = this.state.fieldMap.get(fn) || FIELD_DEFAULTS.get(fn) || [...VORACIOUS_FIELD_NAMES.keys()][0];
        fieldMap.set(fn, vorfn);
      }
    }
    return fieldMap;
  };

  handleChangeModel = (e) => {
    const modelName = e.target.value;

    this.setState({
      selectedModel: modelName,
      fieldMap: this.computeFieldMap(modelName, this.state.availableModelFields),
    });
  };

  handleChangeDeck = (e) => {
    this.setState({selectedDeck: e.target.value});
  };

  handleFieldChange = (ankiFn, vorFn) => {
    const newFieldMap = new Map(this.state.fieldMap);
    newFieldMap.set(ankiFn, vorFn);
    this.setState({
      fieldMap: newFieldMap,
    });
  };

  handleSave = () => {
    this.props.onSavePrefs({
      deckName: this.state.selectedDeck,
      modelName: this.state.selectedModel,
      fieldMap: this.state.fieldMap,
    });
  };

  render() {
    const { ankiPrefs } = this.props;

    return (
      <div>
        <div className="SettingsAnki-instructions">Voracious can create Anki cards and instantly import them if you have the <SystemBrowserLink href="https://ankiweb.net/shared/info/2055492159">AnkiConnect</SystemBrowserLink> add-on installed. Make sure Anki is running with AnkiConnect installed, and then specify below how you want new cards to be created. <em>Note:</em> On Mac, AnkiConnect may be slow or unresponsive unless you <SystemBrowserLink href="https://foosoft.net/projects/anki-connect/index.html#notes-for-mac-os-x-users">disable App Nap</SystemBrowserLink> for Anki.</div>
        <div>
          Current Settings:
          Deck: {ankiPrefs.deckName ? ankiPrefs.deckName : <em>Not set</em>},
          Note Type: {ankiPrefs.modelName ? ankiPrefs.modelName : <em>Not set</em>}
        </div>
        <div><br/></div>
        <div>AnkiConnect Status: {this.state.statusMessage} <button onClick={this.handleRefresh}>Refresh</button></div>
        <div>
          <div>
            <label>Deck{' '}
            <select value={this.state.selectedDeck || ''} onChange={this.handleChangeDeck}>
              {[...this.state.availableDecks.entries()].map(([k, v]) => <option key={k} value={v}>{v}</option>)}
            </select></label>
          </div>
          <div>
            <label>Note Type{' '}
            <select value={this.state.selectedModel || ''} onChange={this.handleChangeModel}>
              {[...this.state.availableModels.entries()].map(([k, v]) => <option key={k} value={v}>{v}</option>)}
            </select></label>
          </div>
          <div>Fields:</div>
          <table><tbody>
            {[...this.state.fieldMap.entries()].map(([ankiFn, vorFn]) => (
              <tr key={ankiFn}>
                <td>{ankiFn}</td>
                <td><select value={vorFn} onChange={e => { this.handleFieldChange(ankiFn, e.target.value); }}>
                  {[...VORACIOUS_FIELD_NAMES.entries()].map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <div><button onClick={this.handleSave}>Save</button></div>
      </div>
    );
  }
}
