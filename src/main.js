import { gsap } from "gsap";
    
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { TextPlugin } from "gsap/TextPlugin";

import $ from "jquery";

gsap.registerPlugin(ScrambleTextPlugin,SplitText,TextPlugin);


// gsap.to("#letter_1", {duration: 2, x: 100 });

let animations = [];    
let animationSpeed=1000;
let animationPause=1000;
let words = ['lethargic adventurers','revealing sacred truth'];
window.words = words;

let copyWords = [...words];

function insertWords(words) {
    words.forEach((word, index) => {
        let wordDiv = $('<div/>')[0];
        wordDiv.className = 'word';
        wordDiv.id = `word_${index}`;
        word.split('').forEach((letter, letterIndex) => {
            let letterDiv = $('<div/>')[0];
            letterDiv.id = `letter_${index}_${letterIndex}`;
            letterDiv.textContent = letter;
            wordDiv.appendChild(letterDiv);
        });
        $('#words').append(wordDiv);
    });
}

function absolutify() {
    let positions = [];
    $('#words div div').each((i, el) => {
        positions.push($(el).position());
    });

    positions.forEach((pos, i) => {
        let el = $('#words div div')[i];
        $(el).css({display:'block', position: 'absolute', left: 0, top: 0, transform: `translate(${pos.left}px, ${pos.top}px)`});
        $(el).data('pos', pos);
    });

}

/* The color picker doesn't have an onChange event and doesn't update the actual input value. */
/* So we use a MutationObserver to watch for changes to the style attribute of the color picker input. */
const observer = new MutationObserver(function(mutationsList, observer) {
    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'style') {
                $('#words').css('color', $('#fontColor').css('background-color'));
            }
            // console.log(`The "${mutation.attributeName}" attribute was modified on element:`, mutation.target);
            // You can add your custom logic here to respond to the attribute change
        }
    }
})

let rotation = 360;
function animate() {
    animations.forEach(a => a.kill());
    animations = [];
    for (let wordIndex=0; wordIndex<=words.length-1; wordIndex++) {
        let nextWordIndex = wordIndex>=words.length-1?0:wordIndex+1;
        // console.log({wordIndex, nextWordIndex,words});
        words[wordIndex].split('').forEach((letter, index) => {
            if (letter === ' ') return;
            let sourceDiv = $(`#letter_${wordIndex}_${index}`);
            let targetIndex = words[nextWordIndex].indexOf(letter);

            let targetDiv = $(`#letter_${nextWordIndex}_${targetIndex}`);
            // console.log({sourceDiv, targetDiv, letter, wordIndex, nextWordIndex, index, targetIndex});
            let sourcePos = { left: sourceDiv.position().left, top: sourceDiv.position().top };
            // let targetPos = { left: targetDiv.data().pos.left, top: targetDiv.data().pos.top };
            words[nextWordIndex] = words[nextWordIndex].replace(letter, '_');
            // gsap.to(sourceDiv, {duration: 1, x: sourcePos.left, y: targetPos.top });
            if (!$('#rotateLetters').is(':checked')) {
                rotation = 0;
            }
            let animation = gsap.to(targetDiv, 
                {
                duration: animationSpeed/1000, 
                x: sourcePos.left, y: sourcePos.top,
                rotation: rotation,
                onComplete: () => {
                    animations.pop();
                    if (animations.length===0) {
                        setTimeout( () => {
                            animate();
                        }, animationPause);
                    }
                }
            });
            animations.push(animation);
            // console.log(animation);
        });
        rotation += 360;
        if (rotation>words.length*360) rotation = 0;
        words = [...copyWords];
    }

}
function setWordSpacing() {
    let val = $('#wordSpacing').val();
    $('#wordSpacingValue').text((val/100).toFixed(2)+'em');
    $('.word').css('margin-bottom', (val/100).toFixed(2)+'em');
}

function updateFontSize() {
    let val = $('#fontSize').val();
    $('#sizeValue').text(val);
    $('#words').css('font-size', val+'px');
}

function updateWordPosition() {
    let valX = $('#positionX').val();
    let valY = $('#positionY').val();
    $('#positionXValue').text(valX);
    $('#positionYValue').text(valY);
    $('#words').css({left: valX+'%', top: valY+'%'});
    // console.log({valX, valY});
}

function makeHooks() {

    observer.observe(document.getElementById('fontColor'), { attributes: true });


    $('#fontSize').on('input', (e) => {
        animations.forEach(a => a.kill());
        animations = [];
        $('#words').empty();    
        insertWords(words);
        updateFontSize();
        setWordSpacing();
        absolutify();
    });

    $('#wordSpacing').on('input', (e) => {
        animations.forEach(a => a.kill());
        animations = [];
        $('#words').empty();    
        insertWords(words);
        updateFontSize();
        setWordSpacing();
        absolutify();
    });
    $('#positionX').on('input', (e) => { 
        updateWordPosition();
    });
    $('#positionY').on('input', (e) => { 
        updateWordPosition();
    });

    $('#play').on('click', (e) => {
        init();
    });

    $('#animationSpeed').on('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        $('#animationSpeedValue').text(animationSpeed); 
    });

    $('#animationPause').on('input', (e) => {
        animationPause = parseInt(e.target.value);
        $('#animationPauseValue').text(animationPause);
    });

    $('.toggle-panel').on('click', (e) => {
        $('#controls').toggle();
    });
    $('#fontFamily').on('change', (e) => {
        $('#words').css('font-family', e.target.value);
        stopAnimations();
        init();
    });
}

function stopAnimations() {
    animations.forEach(a => a.kill());
    animations = [];
}

function init() {
    stopAnimations();
    $('#words').empty();
    words = $('#input').val().split('\n');
    copyWords = [...words];
    insertWords(words);
    setWordSpacing();
    updateFontSize();
    absolutify();
    makeHooks();
    updateWordPosition();
    animate();
}
init();