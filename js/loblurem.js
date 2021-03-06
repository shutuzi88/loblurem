/*
 * Loblurem 1.0
 * Loblurem plugin for generating blurry text
 * click108
 * Copyright 2019, MIT License
 * 使用方式 給予自定義屬性 data-loblurem
 * 使用方式 給予屬性值 "100w(字數)/22(字型大小)/10(行間間距)/#737373(字型顏色)/5(字元間距)/4(模糊程度預設)"
 * 使用方式 如果不需要標點符號，第一個參數請給大寫的[W]
 * 針對模糊程度，允許傳入屬性值，默認值為4，如需調正其值，請在字元間距後加入數值，數值越大，其越模糊，並用斜線劃分
 * 如果模糊段落中，有超連結按鈕，請給於屬性 data-loblurem-btn，屬性值不用給予
 * 使用限制 如果 data-loblurem 是跟著 p tag, 子節點 data-loblurem-btn 就必需是
 * 1. span包a，2.單純a，3.或是轉成箱型屬性標籤
 */
let Loblurem;
(function ($, window, document, undefined) {

  //Create a class named Loblurem and constructor
  Loblurem = function () {
    //Default values.
    this.query = null;
    this.data = null;
  };
  //Static variables
  Loblurem.COMMA;
  Loblurem.TEXT_LENGTH;
  Loblurem.TEXT = 2;
  Loblurem.TEXT_TYPE = {
    PARAGRAPH: 1,
    SENTENCE: 2,
    WORD: 3
  }
  // Release module to window
  window.Loblurem = Loblurem;

  //Words list.
  Loblurem.WORDS = [
    '心', '戶', '手', '文', '斗', '斤', '方', '日', '月', '木', //4
    '令', '北', '本', '以', '主', '充', '半', '失', '巧', '平', //5
    '在', '回', '休', '交', '至', '再', '光', '先', '全', '共', //6
    '邱', '附', '怖', '長', '使', '其', '非', '並', '刻', '取', //8
    '既', '洋', '拜', '面', '促', '前', '飛', '亮', '信', '香', //9
    '班', '借', '家', '勉', '冠', '英', '苦', '為', '段', '派', //10
    '荷', '推', '區', '停', '假', '動', '健', '夠', '問', '將', //11
    '傻', '勢', '亂', '傷', '圓', '傲', '照', '滄', '溺', '準', //13
    '境', '厭', '像', '夢', '奪', '摘', '實', '寧', '管', '種', //14
    '褪', '選', '隨', '憑', '導', '憾', '奮', '擋', '曉', '暸', //16
    '懷', '穩', '曠', '邊', '難', '願', '關', '壞', '爆', '攏'  //19
  ];
  // Punches list
  Loblurem.PUNCH = ["，", "。", "？", "！"];

  // 
  Loblurem.WIDTH = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  // Random integer method.
  Loblurem.prototype.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Shuffle array without duplicate elements
  Loblurem.prototype.shuffle = function (arr) {
    for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
    return arr;
  }
  // Random sentence length.
  Loblurem.prototype.randomSentenLength = function (range, wordsArray, comma) {
    let count = wordsArray.length;
    // console.log('before ' + count);
    let rangeArray = new Array;
    let mod;
    range = this.shuffle(Array.apply(null, Array(range[range.length - 1] - range[0] + 1)).map(function (_, i) {
      return i + range[0];
    }));
    while (count > 0) {
      range.reduce((accumulator, currentValue, currentIndex, array) => {
        if (accumulator <= 0) {
          array.splice(0); // eject early
          return;
        } else {
          rangeArray.push(currentValue);
          // console.log(rangeArray);
          count = accumulator - currentValue;
          mod = accumulator;
          return count;
        }
      }, count);
    }
    // console.log('after ' + count);
    // console.log('before ' + rangeArray);
    rangeArray.splice(rangeArray.length - 1, 1, mod); // [12, 11, 10, 9, 8, 7, 6, 12, 11, 10, 4]
    // console.log('after ' + rangeArray);
    rangeArray = this.shuffle(this.customSplice(rangeArray, 7));
    if (!comma) return;

    rangeArray.reduce((accumulator, currentValue, currentIndex, array) => {
      let target_index = ((accumulator + currentValue) >= wordsArray.length) ? wordsArray.length - 1 : (accumulator + currentValue);
      wordsArray.splice(target_index, 1, currentIndex + 1 > Loblurem.PUNCH.length ? Loblurem.PUNCH[currentIndex % Loblurem.PUNCH.length] : Loblurem.PUNCH[currentIndex]);
      // console.log(accumulator);
      return accumulator + currentValue;
    }, 0);
  }
  Loblurem.prototype.customSplice = function (ary, min) {
    let less = ary.filter(i => i < min);
    let keep = ary.filter(i => i >= min);
    less.map(i => {
      let idx = keep.indexOf(Math.min.apply(null, keep));
      keep[idx] += i;
    });
    return keep;
  }
  // Template literals embedded.
  Loblurem.prototype.template = function (rows, svgWidth, svgHeight, fontSize, fontColor, letterSpacing, stdDeviation, idNO, offsetX, textLength) {
    let first_few_rows = last_row = '';
    for (let i = 0; i < rows.length; i++) {
      if (i < rows.length - 1) {
        first_few_rows += `
        <text kerning="auto" font-family="Microsoft JhengHei" filter="url(#drop-shadow${idNO})" font-size="${fontSize}px" x="${offsetX}px" y="${parseInt(svgHeight / rows.length) * (i + 1) - 2}px" letter-spacing="${letterSpacing}px" textLength="${textLength ? svgWidth - 10 : 0}" font-size="${fontSize}px" filter="url(#drop-shadow)" fill="${fontColor}">${rows[i]}</text>
        `
      } else {
        last_row = `
        <text kerning="auto" font-family="Microsoft JhengHei" filter="url(#drop-shadow${idNO})" font-size="${fontSize}px" x="${offsetX}px" y="${parseInt(svgHeight / rows.length) * (i + 1) - 2}px" letter-spacing="${letterSpacing}px" font-size="${fontSize}px" filter="url(#drop-shadow)" fill="${fontColor}">${rows[i]}</text>
        `
      }
    }
    return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${svgWidth}px" height="${svgHeight + 7}px" display="block">
      <filter id="drop-shadow${idNO}"><feGaussianBlur stdDeviation="${(typeof stdDeviation == "undefined") ? stdDeviation = 4 : stdDeviation}" result="drop-shadow"></feGaussianBlur></filter>
        ${first_few_rows}${last_row}
    </svg>
    `
  }
  // Inset punch symbol into text array
  Loblurem.prototype.insert = function (array, index, punch) {
    array.splice(index, 1, punch); // replace A to B at specified index
  };
  // Text creator method with parameters: how many, what
  Loblurem.prototype.createText = function (count, type, svgWidth, idNO, element) {
    let options = this.query.split('/'); // turn to array
    let fontSize = parseInt(options[1], 10);
    let letterSpacing = parseInt(options[4], 10);
    let fontColor = options[3];
    let stdDeviation = options[5];
    // console.log(stdDeviation);
    switch (type) {
      //paragraphs are loads of sentences.
      case Loblurem.TEXT_TYPE.PARAGRAPH:
        let paragraphs = new Array;
        for (let i = 0; i < count; i++) {
          let paragraphLength = this.randomInt(10, 20);
          let paragraph = this.createText(paragraphLength, Loblurem.TEXT_TYPE.SENTENCE, svgWidth, element);
          paragraphs.push('<p>' + paragraph + '</p>');
          console.log(paragraph);
        }
        return paragraphs.join('');
      //sentences are loads of words.
      case Loblurem.TEXT_TYPE.SENTENCE:
        let sentences = new Array;
        for (let i = 0; i < count; i++) {
          let sentenceLength = this.randomInt(5, 10);
          console.log(sentenceLength);
          let words = this.createText(sentenceLength, Loblurem.TEXT_TYPE.WORD, svgWidth, element);
          let sentence = words;
          sentences.push(sentence);
        }
        return sentences.join('');
      //words are words
      case Loblurem.TEXT_TYPE.WORD:
        let strings;
        if (element.hasAttribute('data-loblurem-plaintext') && element.getAttribute('data-loblurem-plaintext').length > 0) {
          strings = element.getAttribute('data-loblurem-plaintext');
        } else {
          let newLoblurem = new Array;
          if (count > Loblurem.WORDS.length) {
            let times = Math.ceil(count / Loblurem.WORDS.length);
            while (times > 0) {
              newLoblurem = this.shuffle(newLoblurem.concat(Loblurem.WORDS));
              times--;
            }
          } else {
            newLoblurem = Loblurem.WORDS;
          }
          // Choose random words from words array
          let wordIndex = this.randomInt(0, newLoblurem.length - count - 1);
          // Turn array to string
          let wordsArray = this.shuffle(newLoblurem).slice(wordIndex, wordIndex + count);
          this.randomSentenLength([7, 13], wordsArray, Loblurem.COMMA);
          strings = wordsArray.join('');
          element.setAttribute("data-loblurem-plaintext", strings);
        }
        let rows = new Array;
        let maxWordsInRow = Math.floor(svgWidth / (fontSize + letterSpacing)) - 1;
        if (maxWordsInRow > 0) {
          while (strings.length > 0) {
            rows.push(strings.slice(0, maxWordsInRow));
            strings = strings.replace(strings.substr(0, maxWordsInRow), '');
          };
        } else {
          element.innerHTML = '你沒有給寬度哦!!!';
          // break;
          return false;
        };
        let lineSpacing = parseInt(options[2], 10); //行距
        let svgHeight = fontSize * rows.length + lineSpacing * (rows.length == 1 ? 1 : rows.length - 1);
        let offsetX = this.display(element, count, svgWidth, fontSize, letterSpacing);
        let textLength = Loblurem.TEXT_LENGTH;
        let result = this.template(rows, svgWidth, svgHeight, fontSize, fontColor, letterSpacing, stdDeviation, idNO, offsetX, textLength);
        return result;
    }
  };
  Loblurem.prototype.display = function (element, count, svgWidth, fontSize, letterSpacing) {
    let display, offsetX;

    if (element.hasAttribute('data-loblurem-display') && element.getAttribute('data-loblurem-display').length > 0) {
      display = element.getAttribute('data-loblurem-display');

      switch (display) {
        case "middle":
          offsetX = svgWidth / 2 - (fontSize * count + letterSpacing * (count - 1)) / 2;
          return offsetX;

        case "right":
          offsetX = svgWidth - (fontSize * count + letterSpacing * (count - 1)) - 3;
          return offsetX;

        default:
          return offsetX = 3;
      }
    }
  };
  Loblurem.prototype.detectBtn = function (element) {
    let btn = $(element).find('[data-loblurem-btn]');
    if (btn.length == 0) return;

    let btnArray = [0, 0];
    for (let i = 0; i < btn.length; i++) {
      $(btn[i]).css('position', 'absolute');
      // btnArray.push($(btn[i]).height());
      btnArray[i] = $(btn[i]).height();
    }

    let eleHeight = $(element).height();
    for (let i = 0; i < btn.length; i++) {
      let top, btn0 = btnArray[0],
        btn1 = btnArray[1];
      let styles = {
        top: function () {
          if (i == 0) top = eleHeight - ($(element).find('svg').height() / 2) - (btn0 / 2) + 'px';
          if (i == 1) top = eleHeight - ($(element).find('svg').height() / 2) + (btn0 / 2) + 'px';
          return top;
        },
        left: '50%',
        transform: 'translate(-50%, 0)',
        'z-index': 1,
        'margin': 0,
      };
      $(btn[i]).css(styles);
    }
    $(element).css('position', 'relative');
  };

  Loblurem.prototype.copyForbidden = function (element) {
    let css = {
      '-webkit-user-select': 'none',
      '-moz-user-select': 'none',
      'user-select': 'none',
      '-ms-user-select': 'none',
      '-khtml-user-select': 'none',
    };
    $(element).find('svg').css(css);
  };
  Loblurem.prototype.createLoblurem = function (element, svgWidth, i) {
    let loblurem;
    let count;
    let options = this.query.split('/'); // turn to array
    let words = options[0];
    let type;
    // console.log(element, "this.query: " + this.query, "this.type: " + this.type);
    if (/\d+-\d+[psw]/.test(words)) {
      let range = words.substring(0, words.length - 1).split("-"); // turn to array
      count = this.randomInt(parseInt(range[0]), parseInt(range[1]));
    } else {
      count = parseInt(words);
    }

    let typeInput = words[words.length - 1]; //fetch last index value
    if (typeInput == null) return;
    switch (typeInput) {
      case 'p':
        type = Loblurem.TEXT_TYPE.PARAGRAPH;
        break;
      case 's':
        type = Loblurem.TEXT_TYPE.SENTENCE;
        break;
      case 'w':
        type = Loblurem.TEXT_TYPE.WORD;
        Loblurem.TEXT_LENGTH = true;
        Loblurem.COMMA = true;
        break;
      case 'W':
        type = Loblurem.TEXT_TYPE.WORD;
        Loblurem.TEXT_LENGTH = false;
        Loblurem.COMMA = false;
        break;
    };

    loblurem = this.createText(count, type, svgWidth, i, element);
    if (element == null && loblurem == null) return;
    element.innerHTML += loblurem;
    this.detectBtn(element);
    this.copyForbidden(element);
  };
  window.addEventListener('DOMContentLoaded', function () {
    // Select all elements that has a data-loblurem attribute
    let els = document.querySelectorAll('[data-loblurem]'), svgWidth;

    function forLoops() {
      for (let i in els) {
        if (els.hasOwnProperty(i)) {
          let loblurem = new Loblurem;
          svgWidth = $(els).eq(i).innerWidth() || $(els).eq(i).parent().innerWidth();
          loblurem.query = els[i].getAttribute('data-loblurem');
          if (!els[i].hasAttribute('data-loblurem-plaintext')) {
            els[i].setAttribute('data-loblurem-plaintext', '');
          }
          loblurem.createLoblurem(els[i], svgWidth, i);
        }
      }
    };
    $(window).on('resize orientationchange', function () {
      $(els).find('svg').remove();
      forLoops();
    });
    forLoops();
  });
})(jQuery, window, document);