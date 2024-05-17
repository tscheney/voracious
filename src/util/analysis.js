import { hiraToKata, kataToHira, anyCharIsKana } from '../util/japanese';
import DiffMatchPatch from 'diff-match-patch';
import { create as createAnnoText } from './annotext';
import { cpSlice } from '../util/string';
import { builder } from '../../public/kuromoji/kuromoji'; // loaded by script tag in index.html, we do this to avoid lint warning

const dmp = new DiffMatchPatch();
const VERB_CONJ_SUFFIX = ['て', 'で', 'ば', 'ちゃ', 'じゃ'];
const VERB_CONJ_NOT_IND = ['くださる', 'てる', 'でる', 'なさる'];
const SHIMAU_FORMS = ['ちゃう', 'ちまう', 'じゃう', 'じまう'];
const NOUN_CONJ_SUFFIX = ['そう'];
const DA_PAST_ENDING = ['ぐ', 'む', 'ぶ', 'ぬ']
let kuromojiTokenizer = null;
let kuromojiLoadPromise = null;

export const startLoadingKuromoji = () => {
  console.log('Loading Kuromoji ...');
  const dicPath = window.location.href.startsWith('file:') ? './kuromoji/dict/' : '/kuromoji/dict/';
  kuromojiLoadPromise = new Promise(resolve =>
    builder({ dicPath }).build(function (err, tokenizer) {
      console.log('Kuromoji loaded');
      kuromojiTokenizer = tokenizer;
      resolve();
    })
  );
};

export const ensureKuromojiLoaded = async () => {
  if (!kuromojiLoadPromise) {
    startLoadingKuromoji();
  }
  await kuromojiLoadPromise;
};

const isConj = (t, lastToken) => {
  let lastPosDetail1ChaJa = false
  if (lastToken) {
    lastPosDetail1ChaJa = (lastToken.basic_form == 'ちゃ' || lastToken.basic_form == 'じゃ');
  }
  
  const isSpecial = t.conjugated_type.slice(0,2) == '特殊';
  const isNonConjDesu = t.conjugated_type == '特殊・デス' 
    && (t.surface_form == 'です' || t.surface_form == 'っす' || t.surface_form == 'っしょ');
  const isNonConjSpecDa = t.conjugated_type == '特殊・ダ'
    && (t.surface_form == 'で'
    || (!DA_PAST_ENDING.includes(lastToken.basic_form.slice(-1))
      && t.surface_form != "だろ"))
  const isNonConjSpecTa = t.conjugated_type == '特殊・タ' && t.surface_form == 'た'
    && DA_PAST_ENDING.includes(lastToken.basic_form.slice(-1))
  
  return (
       (isSpecial && !isNonConjDesu && !isNonConjSpecDa && !isNonConjSpecTa)
    || t.conjugated_type == '不変化型'
    || (t.pos_detail_1 == '接続助詞' && VERB_CONJ_SUFFIX.includes(t.basic_form))
    || (t.pos == '動詞' && t.pos_detail_1 == '接尾')
    || (t.pos == '動詞' && t.pos_detail_1 == '非自立' && VERB_CONJ_NOT_IND.includes(t.basic_form)))
    || (t.pos_detail_1 == '接尾' && t.pos_detail_2 ==  '助動詞語幹' && NOUN_CONJ_SUFFIX.includes(t.basic_form))
    || SHIMAU_FORMS.includes(t.basic_form)
    || (t.pos_detail_1 == '並立助詞' && t.basic_form == 'たり')
    || (lastPosDetail1ChaJa && t.basic_form == 'いる' 
      && t.pos_detail_1 == '非自立' && t.surface_form == 'い'); // handles a weird case where kuromoji doesn't parse ちゃう form correctly 
}

const singleWordConj = (t) => {
  return (
        t.conjugated_form == '命令ｒｏ' 
    ||  (t.pos == '動詞' && t.basic_form != t.surface_form && t.surface_form.length >= 3 
        && (t.surface_form.slice(-2) == 'りゃ' || t.surface_form.slice(-2) == 'きゃ'))
  )
}

const conjType = (curConjType, t, lastToken, nextToken) => {
  let lastPosDetail1ChaJa = false;
  if (lastToken) {
    lastPosDetail1ChaJa = (lastToken.basic_form == 'ちゃ' || lastToken.basic_form == 'じゃ');
  }
  let addition = ""
  if (t.conjugated_form == '命令ｒｏ' || t.surface_form == 'なさい') {
    addition = "imperative";
  } else if ((t.conjugated_type == '特殊・ナイ' && t.surface_form !='なきゃ') || t.conjugated_type == '特殊・ヌ'
    || (t.conjugated_type == '不変化型' && t.basic_form == 'ん')) {
    addition = "negative";
  } else if (t.conjugated_type == '特殊・タ' || t.conjugated_type == '特殊・ダ') {
    if (t.surface_form == 'たら') {
      addition = "conditional";
    } else if (t.surface_form == 'なら') {
      addition = "provisional";
    } else {
      addition = "past";
    }
  } else if (t.conjugated_type == '特殊・マス' || t.conjugated_type == '特殊・デス') {
    if (lastToken.surface_form == 'て' && lastToken.pos == '助詞' && lastToken.pos_detail_1 == '接続助詞') {
      addition = "-いる "
    }
    addition += "polite";
    //test2  = nextToken.basic_form != 'う'
    //test3 = t.surface_form == 'でしょ'
    //test4 = t.surface_form == 'ましょ'
    if ((nextToken == null || nextToken.basic_form != 'う') && (t.surface_form == 'でしょ' || t.surface_form == 'ましょ')) {
      addition += " presumptive"
    }
  } else if (t.conjugated_type == '特殊・タイ') {
    addition = "desire";
  } else if (t.conjugated_type == '不変化型' && t.basic_form == 'う') {
    addition = "presumptive";
  } else if (t.pos_detail_1 == '接続助詞'
    && (t.basic_form == 'て' || t.basic_form == 'で')) {
    addition = "て"
  } else if (t.pos_detail_1 == '接続助詞' && t.basic_form == 'ば') {
    addition = "provisional";
  } else if (t.pos_detail_1 == '接尾'
    && (t.basic_form == 'られる' || t.basic_form == 'れる')) {
    addition = "passive";
  } else if (t.pos_detail_1 == '接尾'
    && (t.basic_form == 'させる' || t.basic_form == 'せる')) {
    addition = "causitive";
  } else if (((t.basic_form == 'ちゃう' || t.basic_form == 'じゃう'
    || t.basic_form == 'ちまう' || t.basic_form == 'じまう')
    || (lastPosDetail1ChaJa && t.basic_form == 'いる' 
    && t.pos_detail_1 == '非自立' && t.surface_form == 'い')
    && lastToken.pos_detail_1 == '接続助詞'))
  {
    if (lastPosDetail1ChaJa) {
      curConjType = curConjType.replace("ては contraction","")
    }
    addition = "しまう";
  } else if (t.pos_detail_1 == '非自立' && t.basic_form == 'くださる') {
    addition += "polite imperative";
  } else if (t.pos_detail_1 == '非自立' && (t.basic_form == 'てる' || t.basic_form == 'でる')) {
    addition += "て-いる";
  } else if (t.pos_detail_1 == '接尾' && t.basic_form == 'そう') {
    addition += "appearance";
  } else if (t.pos == '動詞' && t.basic_form != t.surface_form && t.surface_form.length >= 3 
    && t.surface_form.slice(-2) == "りゃ") {
    addition = "provisional contraction";
  } else if ((t.conjugated_type == '特殊・ナイ' && t.surface_form =='なきゃ')
    || (t.basic_form == 'ちゃ' || t.basic_form == 'じゃ')
    || (t.pos == '動詞' && t.basic_form != t.surface_form && t.surface_form.length >= 3 
    && t.surface_form.slice(-2) == "きゃ")) {
    if (t.conjugated_type == '特殊・ナイ') {
      addition = "negative "
    }
    addition += "ては contraction";
  } else if (t.pos_detail_1 == '並立助詞' && t.basic_form == 'たり') {
    addition = "listing";
  }
  
  let newConjType = curConjType;
  
  if (curConjType == "" || curConjType == "stem") {
    newConjType = addition;
  }
  else if (curConjType != "" && addition != "" && !curConjType.includes(addition)) {
    if (addition.charAt(0) != '-') {
      newConjType += " ";
    }
    newConjType += addition;
  }
  
  return newConjType;
   
}

const analyzeJAKuromoji = async (text) => {
  await ensureKuromojiLoaded();

  const tokens = kuromojiTokenizer.tokenize(text);
  const annotations = [];

  // code point indexes, not byte indexes
  let cpBegin;
  let cpEnd = 0;
  
  let inVerbConj = false;
  let lastToken = null;
  let curToken = null;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (curToken) {
      lastToken = curToken;
    }
    curToken = t;
    cpBegin = cpEnd;
    cpEnd = cpBegin + [...t.surface_form].length;
    
    let nextToken = null;
    if (i < tokens.length - 1) {
      nextToken = tokens[i+1];
    }

    const textSlice = cpSlice(text, cpBegin, cpEnd);

    // sanity checks
    if (textSlice !== t.surface_form) {
      throw new Error('Input text token does not match surface_form');
    }

    if ((!t.basic_form) || (t.basic_form === '')) {
      throw new Error('Unexpected');
    }

    // skip some stuff
    if (t.pos === '記号') {
      continue;
    }
    
    let inputData = {};
    if (t.basic_form === '*') {
        inputData = {
            lemma: t.surface_form,
            conj: "",
        } // covers certain cases that don't work otherwise
    }
    else {
        inputData = {
            lemma: t.basic_form,
            conj: t.surface_form,
        } // conjugated verb
    }
    
    // Connect verb conjugation suffixes
     if (inVerbConj && isConj(t, lastToken)) {
      let indexOfLastWord = -1;
      annotations.forEach((anno, i) => {
        if (anno.kind === 'word') {
          indexOfLastWord = i;
        }
      });
      if (indexOfLastWord != -1) {
        const anno = annotations[indexOfLastWord];
        anno.cpEnd = cpEnd;
        anno.data.conj += t.surface_form;
        anno.conjType = conjType(anno.conjType, t, lastToken, nextToken);
        continue;
      }
    }
    else {
      // special ろ cases
      let newConjType = "";
      if (singleWordConj(t)) { 
        newConjType = conjType("", t, lastToken, nextToken);
        inVerbConj = false;
      } else if (t.pos == '動詞' || t.pos == '形容詞' && t.basic_form != t.surface_form) {
        if (t.conjugated_form == '連用形') {
          newConjType = "stem";
        }
        inVerbConj = true;
      } else {
        inVerbConj = false;
      }
      annotations.push({
          cpBegin,
          cpEnd,
          kind: 'word',
          data: inputData,
          conjType: newConjType,
        });
    }

    // skip ones without basic_form properly set, for now
    if (t.basic_form === '*') {
      continue;
    }

    if (t.reading !== '*') {
      const kataReading = hiraToKata(t.reading);
      const kataSurfaceForm = hiraToKata(t.surface_form);

      if (kataReading !== kataSurfaceForm) {
        const hiraReading = kataToHira(t.reading);

        if (anyCharIsKana(t.surface_form)) {
          const diffs = dmp.diff_main(kataToHira(t.surface_form), hiraReading);
          let beginOff = 0;
          let endOff = 0;

          for (const [action, s] of diffs) {
            if (action === -1) {
              // Deletion
              endOff = beginOff + [...s].length;
            } else if (action === 1) {
              // Insertion
              if (endOff <= beginOff) {
                console.warn('diff matching furigana, endOff <= beginOff', t.surface_form, hiraReading);
              }
              annotations.push({
                cpBegin: cpBegin + beginOff,
                cpEnd: cpBegin + endOff,
                kind: 'ruby',
                data: s,
                conjType: '',
              });
              beginOff = endOff;
            } else {
              if (action !== 0) {
                throw new Error('diff should only return [-1,0,1]');
              }
              beginOff += [...s].length;
              endOff = beginOff;
            }
          }
          if (beginOff !== endOff) {
            console.warn('diff matching furigana, beginOff !== endOff', t.surface_form, hiraReading);
          }
        } else {
          // Simple case
          annotations.push({
            cpBegin,
            cpEnd,
            kind: 'ruby',
            data: hiraReading,
            conjType: '',
          });
        }
      }
    }
  }

  return annotations;
};

const languageAnalyzerFunc = {
  'jpn': analyzeJAKuromoji,
}

const canAnalyzeLanguage = (language) => languageAnalyzerFunc.hasOwnProperty(language);

const analyzeText = async (text, language) => {
  if (!canAnalyzeLanguage(language)) {
    throw new Error('Cannot analyze ' + language);
  }

  return await languageAnalyzerFunc[language](text);
};

// expects ISO 639-3
export const createAutoAnnotatedText = async (text, language) => {
  if (canAnalyzeLanguage(language)) {
    return createAnnoText(text, await analyzeText(text, language));
  } else {
    return createAnnoText(text);
  }
}
