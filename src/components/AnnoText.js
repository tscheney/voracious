import React, { PureComponent } from 'react';
import Immutable, { Record } from 'immutable';

import './AnnoText.css';

import { iso6393To6391 } from '../util/languages';
import Tooltip from './Tooltip';
import CopyInterceptor from './CopyInterceptor';
import SystemBrowserLink from './SystemBrowserLink';

import { cpSlice } from '../util/string';
import { getKindAtIndex, getKindInRange, customRender as annoTextCustomRender } from '../util/annotext';

const CPRange = new Record({
  cpBegin: null,
  cpEnd: null,
});

const POTENTIAL_END = new Map([['け','く'], ['げ','ぐ'], ['せ','す'], ['ぜ','ず'], ['て','つ'], ['で','づ'],
                              ['ね','ぬ'], ['へ','ふ'], ['べ','ぶ'], ['ぺ','ぷ'], ['め','む'], ['れ','る']]);

export default class AnnoText extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectionRange: null,
      hoverRange: null,
      updates: 0,
    };
    this.charElem = {}; // map from cpIndex to element wrapping character
    this.hoverTimeout = null;
    this.dragStartIndex = null; // codepoint index of character that mousedown happened on, if mouse is still down
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.handleMouseUp);

    this.clearHoverTimeout();
  }

  clearHoverTimeout() {
    if (this.hoverTimeout) {
      window.clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }
  }

  setHoverTimeout() {
    if (this.hoverTimeout) {
      window.clearTimeout(this.hoverTimeout);
    }
    this.hoverTimeout = window.setTimeout(
      () => { this.setState({ hoverRange: null }); this.hoverTimeout = null; },
      300
    );
  }

  setSelRange = (newSelRange) => {
    if (!Immutable.is(newSelRange, this.state.selectionRange)) {
      this.setState({selectionRange: newSelRange});
    }
  };

  clearSelection = () => {
    this.setSelRange(null);
  };

  setSelection = (begin, end) => {
    this.setSelRange(new CPRange({cpBegin: begin, cpEnd: end}));
  };

  getSelectedText = () => {
    const selRange = this.state.selectionRange;
    if (!selRange) {
      return null;
    }
    return cpSlice(this.props.annoText.text, selRange.cpBegin, selRange.cpEnd);
  };

  handleMouseUp = (e) => {
    this.dragStartIndex = null;
    document.removeEventListener('mouseup', this.handleMouseUp);
  };

  wordRangeFromIndex = (cpIndex) => {
    const hitWordAnnos = getKindAtIndex(this.props.annoText, 'word', cpIndex);
    if (hitWordAnnos.length > 0) {
      const a = hitWordAnnos[0];
      const longAnno = this.getLongAnno(this.props.annoText, a.cpBegin, a.cpEnd);
      return new CPRange({cpBegin: longAnno[0].cpBegin, cpEnd: longAnno[0].cpEnd});
    } else {
      return null;
    }
  };

  handleCharMouseDown = async (e) => {
    if (e.button === 0) {
      e.preventDefault();
      const cpIndex = +e.currentTarget.getAttribute('data-index');
      this.dragStartIndex = cpIndex;
      if (this.state.selectionRange && (cpIndex >= this.state.selectionRange.cpBegin) && (cpIndex < this.state.selectionRange.cpEnd)) {
        this.clearSelection();
      } else {
        if (this.state.hoverRange) {
          this.setSelection(this.state.hoverRange.cpBegin, this.state.hoverRange.cpEnd);
        } else {
          this.setSelection(cpIndex, cpIndex+1);
        }
      }
      document.addEventListener('mouseup', this.handleMouseUp);
    } else {
      // Cycle the word learn state.
      if (this.state.hoverRange) {
        const word = cpSlice(this.props.annoText.text, this.state.hoverRange.cpBegin, this.state.hoverRange.cpEnd);

        const wordData = this.props.getWordFromList(word);
        const state = wordData.learnState;
        const newState = (state + 1) % 4;
        this.props.setWordInList(
          word,
          wordData.set('learnState', newState)
        );

        // Super hack to get the UI to update.  I don't understand
        // React.
        this.setState({updates: this.state.updates + 1});
      }
    }
  };

  handleCharMouseEnter = (e) => {
    const cpIndex = +e.currentTarget.getAttribute('data-index');

    this.setState({hoverRange: this.wordRangeFromIndex(cpIndex)});

    if (this.dragStartIndex !== null) {
      let a = this.dragStartIndex;
      let b = cpIndex;
      if (b < a) {
        [a, b] = [b, a];
      }
      this.setSelection(a, b+1);
    }
    this.clearHoverTimeout();
  };

  handleCharMouseLeave = (e) => {
    this.setHoverTimeout();
  };

  handleTooltipMouseEnter = () => {
    this.clearHoverTimeout();
  };

  handleTooltipMouseLeave = () => {
    this.setHoverTimeout();
  };
  
  searchDictionaries = (word) => {
    return this.props.searchDictionaries(word);
  }
  
  parsePotential = (word) => {
    if (this.searchDictionaries(word).length == 0) {
      if (word.length >= 3) {
        const wordBody = word.slice(0, -2);
        const wordSecToLast = word.slice(-2, -1);
        const wordLast = word.slice(-1);
        if (wordLast == 'る' && POTENTIAL_END.has(wordSecToLast)) {
          const newEnd = POTENTIAL_END.get(wordSecToLast);
          const deconjWord = wordBody + newEnd;
          if (this.searchDictionaries(deconjWord).length > 0) {
            return deconjWord;
          }
        }
      }
    }
    return "";
  }
  
  getLongAnno = (annoText, cpBegin, cpEnd) => {
    const annos = [];
    
    const hitWordAnnos = getKindInRange(annoText, 'word', cpBegin, cpEnd);
    
    annoText.annotations.forEach((anno, i) => {
      if (anno.kind === 'word') {
        annos.push(anno);
      }
    });
    
    let searchWordLemma = "";
    let searchWordsLemma = [];
    let searchWordConj = "";
    let searchWordsConj = [];
    let dicResultLemma;
    let dicResultConj;
    let endNumLemma = 0;
    let endNumConj = -1;
    let hitBegin = false;
    let conjType = "";
    let skipRemainingLemma = false;
    for (let i = 0; i < annos.length; i++) {
      let lemma = annos[i].data.lemma;
      if (!hitBegin) {
        if (hitWordAnnos[0] === annos[i])
        {
          hitBegin = true;
          // since kuromoji does not deconjugate potential forms properly, need to work around it
          const potential = this.parsePotential(lemma);
          if (potential != "")
          {
            lemma = potential;
            conjType = "potential";
          }
        }
      }
      if (hitBegin) {
        searchWordLemma += lemma;
        if (annos[i].data.conj != "") {
          searchWordConj += annos[i].data.conj;
        }
        else {
          searchWordConj += lemma;
        }
        if (!skipRemainingLemma) {
          searchWordsLemma.push({
            word: searchWordLemma,
            endAnno: annos[i],
          })
        }
        
        if ((searchWordLemma != searchWordConj) || skipRemainingLemma) {
          searchWordsConj.push({
            word: searchWordConj,
            endAnno: annos[i],
          })
        }
        else {
          searchWordsConj.push(null)
        }
        if (annos[i].data.conj != annos[i].data.lemma) {
          skipRemainingLemma = true;
        }
      }
    }
    
    for (let i = searchWordsLemma.length - 1; i >= 0; i--) {
      dicResultLemma = this.searchDictionaries(searchWordsLemma[i].word);
      if (dicResultLemma.length > 0) {
        endNumLemma = i;
        if (conjType != "" && searchWordsLemma[i].endAnno.conjType != "") {
          conjType += " "
        }
        conjType += searchWordsLemma[i].endAnno.conjType;
        break;
      }
    }
    
    // also check the conjagated forms (i.e. as written) to accomodate parsing issues and set phrases
    for (let i = searchWordsConj.length - 1; i >= 0; i--) {
      if (searchWordsConj[i] != null) {
        dicResultConj = this.searchDictionaries(searchWordsConj[i].word);
        if (dicResultConj.length > 0) {
          endNumConj = i;
          break;
        }
      }
    }
    
    let cpEndResult = searchWordsLemma[endNumLemma].endAnno.cpEnd;
    let wordResult = searchWordsLemma[endNumLemma].word;
    let dicResult = dicResultLemma;
    if (endNumConj >= endNumLemma) {
      cpEndResult = searchWordsConj[endNumConj].endAnno.cpEnd;
      wordResult = searchWordsConj[endNumConj].word;
      dicResult = dicResultConj;
      conjType = "";
    }
    
    const resultAnno = [];
    resultAnno.push({
      cpBegin: cpBegin,
      cpEnd: cpEndResult,
      kind: "word",
      data: {lemma: wordResult},
      dicResult: dicResult,
      conjType: conjType,
    })
    
    return resultAnno;
  }

  renderTooltip = () => {
    const { annoText } = this.props;
    const tooltipRange = this.state.selectionRange || this.state.hoverRange;

    if (tooltipRange) {
      let hitWordAnnos = [];
      let selEqHov = false;
      if (this.state.selectionRange && this.state.hoverRange) {
        selEqHov = this.state.selectionRange.cpBegin == this.state.hoverRange.cpBegin 
                   && this.state.selectionRange.cpEnd == this.state.hoverRange.cpEnd;
      }
      if (this.state.selectionRange && !selEqHov ) {
        const textSel = annoText.text.slice(tooltipRange.cpBegin, tooltipRange.cpEnd);
        hitWordAnnos.push({
          cpBegin: tooltipRange.cpBegin,
          cpEnd: tooltipRange.cpEnd,
          data: {lemma: textSel},
          dicResult: this.searchDictionaries(textSel),
        })
      }
      else {
        hitWordAnnos = this.getLongAnno(annoText, tooltipRange.cpBegin, tooltipRange.cpEnd);
      }
      const limitedHitWordAnnos = hitWordAnnos.slice(0, 3);
      const anchorElems = [];
      for (let i = tooltipRange.cpBegin; i < hitWordAnnos[0].cpEnd; i++) {
        const el = this.charElem[i];
        if (el) {
          anchorElems.push(el);
        }
      }
      
      let conjType = "";
      if (hitWordAnnos[0].conjType && hitWordAnnos[0].conjType != "") {
        conjType = " (" + hitWordAnnos[0].conjType + ")"
      }

      return (
        <Tooltip anchorElems={anchorElems} onMouseEnter={this.handleTooltipMouseEnter} onMouseLeave={this.handleTooltipMouseLeave}>
          <div className="AnnoText-tooltip">
            <ul className="AnnoText-tooltip-search-words-list">
              {limitedHitWordAnnos.map(wordAnno => {
                let lemma = (wordAnno.data.lemma || cpSlice(annoText.text, wordAnno.cpBegin, wordAnno.cpEnd));
                const encLemma = encodeURIComponent(lemma);
                const searchHits = hitWordAnnos[0].dicResult;
                return (
                  <li key={`wordinfo-${wordAnno.cpBegin}:${wordAnno.cpEnd}`} className="AnnoText-tooltip-search-words-item">
                    <div className="AnnoText-tooltip-external-links">
                      <SystemBrowserLink href={'https://dic.yahoo.co.jp/search/?p=' + encLemma}>Yahoo!</SystemBrowserLink>{' '}
                      <SystemBrowserLink href={'http://dictionary.goo.ne.jp/srch/all/' + encLemma + '/m0u/'}>goo</SystemBrowserLink>{' '}
                      <SystemBrowserLink href={'http://eow.alc.co.jp/search?q=' + encLemma}>英辞郎</SystemBrowserLink>{' '}
                      <SystemBrowserLink href={'https://jisho.org/search/' + encLemma}>Jisho</SystemBrowserLink>
                    </div>
                    <div className="AnnoText-tooltip-search-word">{lemma}</div>
                    {(conjType != "")? (
                      <div className="Annotext-tooltip-dict-hit-text">{conjType}</div>
                    ) : null}                    
                    <ul className="AnnoText-tooltip-dict-hits">{searchHits.map(({dictionaryName, text}, idx) => (
                      <li key={idx} className="AnnoText-tooltip-dict-hit">
                        <div className="Annotext-tooltip-dict-name">{dictionaryName}</div>
                        <div className="Annotext-tooltip-dict-hit-text">{text}</div>
                      </li>
                    ))}</ul>
                  </li>
                );
              })}
            </ul>
            {(hitWordAnnos.length > limitedHitWordAnnos.length) ? (
              <div style={{fontSize: '0.5em', marginTop: 10, textAlign: 'center', fontStyle: 'italic'}}> and {hitWordAnnos.length - limitedHitWordAnnos.length} more...</div>
            ) : null}
          </div>
        </Tooltip>
      );
    } else {
      return null;
    }
  };

  render() {
    const { annoText, language, showRuby } = this.props;

    const annoTextChildren = annoTextCustomRender(
      annoText,
      (a, inner) => {
        const word = cpSlice(annoText.text, a.cpBegin, a.cpEnd);
        const wordState = this.props.getWordFromList(word).get('learnState');
        const wordStateClass = "word-state-" + wordState;

        if (a.kind === 'ruby') {
          return showRuby ? [<ruby key={`ruby-${a.cpBegin}:${a.cpEnd}`} className={wordStateClass}>{inner}<rp>(</rp><rt>{a.data}</rt><rp>)</rp></ruby>] : inner;
        } else if (a.kind === 'highlight') {
          return [<span key={`highlight-${a.cpBegin}:${a.cpEnd}`} className='AnnoText-highlight'>{inner}</span>];
        } else {
          return [<span key={`word-state-${a.cpBegin}:${a.cpEnd}`} className={wordStateClass}>{inner}</span>];
        }
      },
      (c, i) => {
        if (c === '\n') {
          return <br key={`char-${i}`} />;
        } else {
          const classNames = ['AnnoText-textchar'];
          if ((this.state.selectionRange !== null) && (i >= this.state.selectionRange.cpBegin) && (i < this.state.selectionRange.cpEnd)) {
            classNames.push('AnnoText-selected');
          } else if ((this.state.hoverRange !== null) && (i >= this.state.hoverRange.cpBegin) && (i < this.state.hoverRange.cpEnd)) {
            classNames.push('AnnoText-hover');
          }

          return <span className={classNames.join(' ')} onMouseDown={this.handleCharMouseDown} onMouseEnter={this.handleCharMouseEnter} onMouseLeave={this.handleCharMouseLeave} data-index={i} key={`char-${i}`} ref={(el) => { this.charElem[i] = el; }}>{c}</span>;
        }
      }
    );

    return (
      <span className="AnnoText">
        <span {... ((language === 'und' ? {} : {lang: iso6393To6391(language)}))}>{annoTextChildren}</span>
        {this.renderTooltip()}
        {this.state.selectionRange ? (
          <CopyInterceptor copyData={[{format: 'text/plain', data: cpSlice(annoText.text, this.state.selectionRange.cpBegin, this.state.selectionRange.cpEnd)}]}/>
        ) : null}
      </span>
    );
  }
}
