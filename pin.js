/**
 * kriss_pin bookmarklet
 * Copyleft - 2012 Tontof - http://tontof.net
 * use KrISS pin at your own risk
 */
(function () {
    'use strict';
/**
 * http://code.google.com/p/mrclay/source/browse/trunk/javascript/bookmarklets/myPage.js
 */
var d = document,
    b = d.body,
    w = window,
    pinUrl = 'http://github.com/tontof/kriss_pin',
    onImagesBase64 = 0, /* default images conversion */
    alwaysKeepStyle = ['display', 'text-decoration'],
    zoomValue = 1.5,
    currentSel = null, /* current selected */
    sel = [], /* selected */
    histOver = [], /*  history over (for down arrow) */
    hist = [], /* history none display (for 'N' and 'U' */
    kpec = 0, /* edit css mode (for 'C') */
    kpeh = 0, /* edit html mode (for 'H') */
    allElt = b.getElementsByTagName('*'),
    kpb = d.createElement('div'), /* body tree (for 'B') */
    kpj = d.createElement('div'), /* javascript info (for 'J') */
    kps = d.createElement('div'), /* style info (for 'S') */
    kpx = d.createElement('div'), /* xray info (for 'X') */
    menu = d.createElement('div'),
    overlay = d.createElement('div'),
    style = d.createElement('style'),
    canvasToBase64 = {},
    defaultStyle = {},
    css = '';

/**
 * http://stackoverflow.com/questions/1787322/htmlspecialchars-equivalent-in-javascript
 */
function escapeHtml(unsafe) {
    return unsafe
           .replace(/&/g, '&amp;')
           .replace(/</g, '&lt;')
           .replace(/>/g, '&gt;');
}

/**
 * http://phpjs.org/functions/nl2br:480
 */
function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml || (typeof is_xhtml === 'undefined')) ? '' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

function removeChildren(elt) {
    while (elt.hasChildNodes()) {
        elt.removeChild(elt.firstChild);
    }
}

function clearHead() {
    removeChildren(d.getElementsByTagName('head')[0]);
    d.getElementsByTagName('head')[0].appendChild(style);
}

function removeElement(elt) {
    if (elt.parentNode) {
        elt.parentNode.removeChild(elt);
    }
}

function changeClass(elt, cls) {
    if (elt !== null && elt.nodeType === Node.ELEMENT_NODE) {
        elt.className = elt.className.replace(/\b[ ]*kp[shk]\b/g, '');
        if (cls) {
            elt.className += elt.className ? ' ' + cls : cls;
        }
    }
}

function hasClass(elt, cls) {
    if (elt && (' ' + elt.className + ' ').replace(/[\n\t\r]/g, ' ').indexOf(' ' + cls + ' ') > -1) {
        return true;
    }
    return false;
}

function markSelected() {
    var i, len, rect, div;
    if (d.getElementById('kpx')) {
        b.removeChild(kpx);
        xrayLastSelected();
    }
    while (histOver.length) {
        histOver.pop();
    }
    if (menu.parentNode !== b) {
        b.appendChild(menu);
    }
    if (overlay.parentNode !== b) {
        b.appendChild(overlay);
    }
    removeChildren(overlay);
    for (i = 0, len = sel.length; i < len; i++) {
        rect = sel[i].getBoundingClientRect();
        div = d.createElement('div');
        div.style.position = 'absolute';
        div.style.zIndex = '2147483647';
        div.style.top = (rect.top + w.scrollY) + 'px';
        div.style.left = (rect.left + w.scrollX) + 'px';
        div.style.width = (rect.width) + 'px';
        div.style.height = (rect.height) + 'px';
        div.style.border = '3px solid blue';
        div.style.pointerEvents = 'none';
        overlay.appendChild(div);
    }
}

function deselectSelected() {
    var i, len;
    for (i = 0, len = sel.length; i < len; i++) {
        changeClass(sel[i]);
    }
    sel.length = 0;
    markSelected();
}

function selectElement(elt) {
    sel.push(elt);
    changeClass(elt, 'kps');
    markSelected();
}

function unSelectElement(elt) {
    var i, len;

    changeClass(elt);
    for (i = 0, len = sel.length; i < len; i++) {
        if (sel[i] === elt) {
            sel.splice(i, 1);
            markSelected();
            i--;
            len--;
        }
    }
}


//http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm/
function naturalSort (a, b) {
    var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return naturalSort.insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length != 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
    // first try and sort Hex codes or Dates
    if (yD)
        if ( xD < yD ) return -1;
        else if ( xD > yD ) return 1;
    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
        // find floats not starting with '0', string or 0 if not defined (Clint Priest)
        oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
        oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) return -1;
        if (oFxNcL > oFyNcL) return 1;
    }
    return 0;
}

function putInOrder() {
    
    var elt = null;
    var eltTH = null;
    var parentsFirst = [];
    var parentsSecond = [];
    var whichChild = [];
    var commonParent = null;
    var i = 0;
    var j = 0;
    var len = 0;
    var iCP = 0;
    var childList = [];
    var incorrectChildList = [];
    var elementList = [];
    var skipTH = false;
    
    if (sel.length !=2){
        w.alert("select only 2 elements.");
    }else{
        elt = sel[0];
        while(elt){//on garde les parents du premier élément cliqué
            parentsFirst.push(elt);
            if(elt.parentNode){//s'il a un parent, on cherche c'est le combientieme enfant
                childList = elt.parentNode.childNodes;//on recup freres 
                i = 0;
                while ((i < childList.length)){//on parcourt freres
                    if (childList.item(i)==elt){
                        whichChild.push(i);//l'element est le ieme enfant de son parent
                    }
                    i = i + 1;
                }
            }
            elt = elt.parentNode;
        }
        
        len = parentsFirst.length;
        elt = sel[1];

        while(elt){//on garde les parents du second élément
            parentsSecond.push(elt);
            elt = elt.parentNode;
        }
        if (len !=parentsSecond.length){
            console.log("Les éléments n'ont pas la même profondeur.");
        }else{
            //on cherche l'ancêtre commun
            if (parentsFirst[len - 1] == parentsSecond[len - 1]){ //s'il existe, au pire, c'est le premier
                i = len - 1;
                while ((commonParent == null)&&(i>=0)){
                    if (parentsFirst[i] != parentsSecond[i]){
                        commonParent = parentsFirst[i + 1];
                        iCP = i + 1;
                        if (commonParent.tagName =="TABLE" || commonParent.tagName =="TBODY"){
                            skipTH = true;
                        }
                    }
                    i = i - 1;
                }
            }else{
                console.log("differents");
            }
            if (commonParent){
                //ils ont un parent commun, on vérifie que c'est le même type de descendance
                if (iCP==0){
                    //on fait rien
                    console.log("on a cliqué sur le mm élément...");
                }else{
                    if (iCP==1){
                        console.log("les éléments sont frères");
                    }
                    for (i = iCP - 2; i >= 0; i--){// - 1  car le premier correspond à la bifurcation de la descendance
                        elt = parentsSecond[i + 1];
                        try{
                            elt = elt.childNodes[whichChild[i]];
                            if (elt != parentsSecond[i]){
                                console.log("nok pour le parent " + i +"("+iCP+")");
                            }
                        }
                        catch(e){
                            console.log("err: pas le même niveau entre les deux éléments. " +e);
                        }
                    }
                    //les vérifs nécessaires sont faites (?), on récupère tous les enfants directs de l'ancêtre commun
                    childList = commonParent.childNodes;
                    
                    incorrectChildList = [];
                    for (i = 0; i < childList.length; i++){//pour tous les fils de l'ancêtre commun
                        elt = childList.item(i);
                        if (elt.nodeType !== Node.TEXT_NODE){//s'il a un bon type de noeud
                            if(iCP>1){
                                for (j = iCP-2; j >= 0; j--){
                                    try{
                                        elt = elt.childNodes[whichChild[j]];
                                        if (skipTH && elt.tagName == "TH"){
                                            elt = null;
                                            eltTH = true;
                                        }
                                    }
                                    catch(e){
                                        console.log("err : pas la mm hierarchie pour tous les elements, ou element TH")
                                    }
                                }
                            }
                            if (elt){
                                elementList.push([elt.textContent, childList.item(i)]);
                            }else{
                                if (!eltTH){
                                    incorrectChildList.push(childList.item(i));
                                }
                            }
                        }
                    }
                    //on trie suivant les éléments cliqués
                    //on peut faire attention au fait que le premier élément est < ou > au deuxième (pb si sont =)
                    // si contient nombre 1<10<2<22<3<...
                    elementList.sort(naturalSort);
                    if(naturalSort(parentsFirst[0].textContent,parentsSecond[0].textContent)>0){
                        elementList.reverse();
                    }
                    //on supprime les enfants directs, et on les ajoute dans le bon ordre
                    //ceux que l'on trie
                    for (i = 0; i < elementList.length; i++){
                        removeElement(elementList[i][1]);
                    }
                    //ceux qui iront à la fin
                    for (i = 0; i < incorrectChildList.length; i++){
                        removeElement(incorrectChildList[i]);
                    }
                    //les triés
                    for (i = 0; i < elementList.length; i++){
                        commonParent.appendChild(elementList[i][1]);
                    }          
                    //les malformés
                    for (i = 0; i < incorrectChildList.length; i++){
                        commonParent.appendChild(incorrectChildList[i]);
                    }
                }//endif icp==0

            }//endif commonParent
        }//endif len ==parentsSecond.length
    }//endif sel.length !=2
    deselectSelected();
}


function convertImageUrlIntoBase64(url) {
    var img, canvas, context;

    if (!canvasToBase64[url] && onImagesBase64 === 1) {
        img = new Image();

        img.onload = function () {
            canvas = d.createElement('canvas');
            canvas.id = 'canvas';
            canvas.height = this.height;
            canvas.width = this.width;
            context = canvas.getContext('2d');
            context.drawImage(this, 0, 0);
            canvasToBase64[url] = canvas.toDataURL();
        };

        img.src = url;
    }
}

function loadImages() {
    var i, imgs = d.getElementsByTagName('img');
    for (i = 0; i < imgs.length; i++) {
        /* convert relative url into absolute */
        imgs[i].src = imgs[i].src;
        convertImageUrlIntoBase64(imgs[i].src);
    }
}

function reset(force) {
    sel.length = 0;
    markSelected();
    if (force) {
        clearHead();
        loadImages();
    }
}

function convertUrlToBase64(val) {
    if (/url/.test(val)) {
        convertImageUrlIntoBase64(val.split('"')[1]);
    }
        return val;
}

function generateCode() {
    removeElement(kpb);
    removeElement(kpj);
    removeElement(kps);
    removeElement(kpx);
    removeElement(menu);
    removeElement(overlay);

    var html = d.createElement('div'),
    div = d.createElement('div'),
    url;

    div.style.cssText = b.style.cssText;
    div.innerHTML = b.innerHTML;
    html.appendChild(div);
    for (url in canvasToBase64) {
        if (canvasToBase64.hasOwnProperty(url)) {
            html.innerHTML = html.innerHTML.replace(url, canvasToBase64[url]);
        }
    }
    b.appendChild(menu);
    b.appendChild(overlay);
    return html.innerHTML;
}

function generateStyle(elt) {
    var i, len, eltStyle;
    if (elt.className !== '') {
        eltStyle = w.getComputedStyle(elt, null);
        for (i = 0, len = eltStyle.length; i < len; i++) {
            if (defaultStyle[eltStyle.item(i)] !== eltStyle.getPropertyValue(eltStyle.item(i))) {
                elt.style.cssText += eltStyle.item(i) + ':' + convertUrlToBase64(eltStyle.getPropertyValue(eltStyle.item(i))) + ';';
            }
        }
        elt.id = '';
        elt.className = '';
    }
}

function markParent(elt, cls) {
    while (((elt = elt.parentNode)) !== null && elt !== b) {
        changeClass(elt, cls);
    }
}

function markChildren(elt, cls) {
    var i, len;
    if (elt !== menu && elt !== overlay) {
        if (elt.hasChildNodes()) {
            for (i = 0, len = elt.childNodes.length; i < len; i++) {
                markChildren(elt.childNodes.item(i), cls);
            }
        }
        changeClass(elt, cls);
    }
}

function generateKeptElements(elt, css) {
    var i, len;
    if (elt.hasChildNodes()) {
        for (i = 0, len = elt.childNodes.length; i < len; i++) {
            if (elt.childNodes.item(i).nodeType === Node.ELEMENT_NODE) {
                if (!hasClass(elt.childNodes.item(i), 'kpk')) {
                    if (elt.childNodes.item(i) !== menu && elt.childNodes.item(i) !== overlay) {
                        removeElement(elt.childNodes.item(i));
                        i--;
                        len--;
                    }
                } else {
                    generateKeptElements(elt.childNodes.item(i), css);
                    if (css === true) {
                        generateStyle(elt.childNodes.item(i));
                    }
                }
            }
        }
    }
    if (css === true) {
        generateStyle(elt);
    } else {
        changeClass(elt);
    }
}

/**
 * http://www.quirksmode.org/js/events_order.html
 */
function noBubbling(evt) {
    evt.cancelBubble = true;
    if (evt.stopPropagation) {
        evt.stopPropagation();
    }
}

function moveTo(direction) {
    if (currentSel !== null && (currentSel !== b || direction === 'child')) {
        if (hasClass(currentSel.parentNode, 'kps')) {
            unSelectElement(currentSel.parentNode);
        }
        if (hasClass(currentSel, 'kph')) {
            changeClass(currentSel);
        }
        switch (direction) {
            case 'first':
            while (currentSel.previousSibling !== null) {
                currentSel = currentSel.previousSibling;
            }
            break;
            case 'last':
            while (currentSel.nextSibling !== null) {
                currentSel = currentSel.nextSibling;
            }
            break;
            case 'previous':
            if (currentSel.previousSibling !== null) {
                currentSel = currentSel.previousSibling;
            }
            break;
            case 'next':
            if (currentSel.nextSibling !== null) {
                currentSel = currentSel.nextSibling;
            }
            break;
            case 'child':
            if (histOver.length === 0) {
                currentSel = null;
            } else if (histOver.length === 1) {
                currentSel = histOver[0];
            } else {
                currentSel = histOver.pop();
            }
            break;
            case 'parent':
            histOver.push(currentSel);
            currentSel = currentSel.parentNode;
            break;
            default:
            break;
        }
        changeClass(currentSel, 'kph');
    } else {
        if (currentSel !== null) {
            currentSel = b;
            changeClass(currentSel, 'kph');
        }
    }
}

function pinOver(evt) {
    if (!kpec && !kpeh) {
        if (!evt) {
            evt = window.event;
        }
        noBubbling(evt);
        currentSel = evt.target || evt.srcElement;
        if (!hasClass(currentSel, 'kps')) {
            changeClass(currentSel, 'kph');
        }
    }
}

function pinOut(evt) {
    var elt;
    if (!kpec && !kpeh) {
        if (!evt) {
            evt = window.event;
        }
        noBubbling(evt);
        if (hasClass(currentSel, 'kph')) {
            changeClass(currentSel);
        }
        currentSel = null;
        elt = evt.target || evt.srcElement;
        while (histOver.length) { histOver.pop(); }
        if (!hasClass(elt, 'kps')) {
            changeClass(elt);
        }
    }
}

function pinClick(evt) {
    if (!kpec && !kpeh) {
        noBubbling(evt);
        if (currentSel !== null) {
            if (hasClass(currentSel, 'kps')) {
                unSelectElement(currentSel);
            } else {
                selectElement(currentSel);
            }
        }
    }
    return false;
}

function addEvents(elt) {
    elt.oldOnmouseover = elt.onmouseover;
    elt.oldOnmouseout = elt.onmouseout;
    elt.oldOnclick = elt.onclick;
    elt.onmouseover = pinOver;
    elt.onmouseout = pinOut;
    elt.onclick = pinClick;
}

/**
     * http://stackoverflow.com/questions/1700870/how-do-i-do-outerhtml-in-firefox
                         */
function outerHTML(node) {
    return node.outerHTML || (
        function (n) {
            var div = document.createElement('div'), h;
            div.appendChild(n.cloneNode(true));
            h = div.innerHTML;
            div = null;
            return h;
        }
        (node)
    );
}

function toggleMenu() {
    var i, span, divs;
    span = d.getElementById('kpm').getElementsByTagName('span')[0];
    divs = d.getElementById('kpm').getElementsByTagName('div');
    for (i = 0; i < divs.length; i++) {
        divs[i].style.display = (span.style.display !== 'none') ? 'block' : '';
    }
    span.style.display = (span.style.display !== 'none') ? 'none' : '';
}

function editMenu(elt, txt) {
    var kpe = d.createElement('div'),
    rect = elt.getBoundingClientRect(),
    rows = Math.min(15, txt.split('\n').length + 3);

    kpe.id = 'kpe';
    kpe.style.top = (rect.top + w.scrollY + rect.height) + 'px';
    kpe.innerHTML = '<textarea id="kpt" rows="' + rows + '"></textarea><button id="kpbut" style="position:static">done</button>';
    b.appendChild(kpe);
    d.getElementById('kpt').value = txt;
    if (kpec === 1) {
        d.getElementById('kpt').onkeyup = function () {
              elt.style.cssText = d.getElementById('kpt').value;
          };
    }
    d.getElementById('kpbut').onkeypress = function () {
                                   if (kpec === 1) {
                                       kpec = 0;
                                       elt.style.cssText = d.getElementById('kpt').value;
                                   }
                                   if (kpeh === 1) {
                                       var i = 0, desc, tmp;
                                       kpeh = 0;
                                       tmp = b.appendChild(d.createElement('div'));
                                       tmp.innerHTML = d.getElementById('kpt').value;
                                       while ((desc = tmp.getElementsByTagName('*').item(i++)) !== null) {
                                           addEvents(desc);
                                       }
                                       elt.parentNode.insertBefore(tmp.firstChild, elt);
                                       removeElement(elt);
                                       removeElement(tmp);
                                   }
                                   removeElement(kpe);
                               };
    d.getElementById('kpbut').onclick = d.getElementById('kpbut').onkeypress;
}

function bodyTreeHtml(elt, depth) {
    var i, str = '', sep = '  ';
    if (elt !== menu && elt !== kpb && elt !== overlay && elt.nodeType !== Node.TEXT_NODE) {
        for (i = 0; i < depth; i++) {
        str += sep;
        }
        str += elt.nodeName + ' ' + (elt.id ? '#' + elt.id : '') + ' ' + (elt.className ? '.' + elt.className : '') + '\n';
        for (i = 0; i < elt.childNodes.length; i++) {
            str += bodyTreeHtml(elt.childNodes.item(i), depth + 1);
        }
    }
    return str;
}

function bodyTree() {
    if (d.getElementById('kpb')) {
        b.removeChild(kpb);
    } else {
        kpb.innerHTML = '<pre>' + bodyTreeHtml(b, 0).replace(/kps/g, '<strong style="text-decoration:underline;">kps</strong>') + '</pre>';
        b.appendChild(kpb);
    }
    deselectSelected();
}

function cssEditLastSelected() {
    var elt;
    if (sel.length > 0) {
        elt = sel[sel.length - 1];
        if (elt.style.cssText !== '') {
            kpec = 1;
            editMenu(elt, elt.style.cssText.replace(/; /g, ';\n'));
        } else {
            w.alert('Generate style first !');
        }
    } else {
        w.alert('Select an element !');
    }
}

function exportElements() {
    w.alert('TODO');
}

function generateStyleSelectedElements() {
    var i, len;
    for (i = 0, len = sel.length; i < len; i++) {
        markChildren(sel[i], 'kpk');
        generateKeptElements(sel[i], true);
        changeClass(sel[i], 'kps');
    }
}

function isEditableWithoutNoRisk(elt) {
    var tmp = b.appendChild(d.createElement('div')),
        type;
    tmp.innerHTML = outerHTML(elt);
    type = tmp.firstChild.tagName;

    removeElement(tmp);
    if (type !== elt.tagName) {
        return false;
    }
    return true;
}

function htmlEditLastSelected() {
    var elt;
    if (sel.length > 0) {
        elt = sel[sel.length - 1];
        if (isEditableWithoutNoRisk(elt)) {
            kpeh = 1;
            unSelectElement(elt);
            editMenu(elt, outerHTML(elt)
                          .replace(/> </g, '>\n<')    /* separe tags */
                          .replace(/class=''/g, '')   /* empty class */
                          .replace(/class=""/g, '')   /* empty class */
                          .replace(/id=''/g, '')      /* empty id */
                          .replace(/id=""/g, '')      /* empty id */
                    );
        } else {
            if (elt.tagName === 'BODY') {
                w.alert('Can not edit body');
            } else {
                w.alert('Can not edit this element, select its parent (press W and retry)');
            }
        }
    } else {
        w.alert('Select an element !');
    }
}

function isolateSelectedElements() {
    var i, len;
    for (i = 0, len = sel.length; i < len; i++) {
        markChildren(sel[i], 'kpk');
        generateKeptElements(sel[i], true);
    }
    generateStyle(b);
    removeChildren(b);
    for (i = 0, len = sel.length; i < len; i++) {
        b.appendChild(sel[i]);
    }
    reset(true);
}

function javascriptList() {
    deselectSelected();
    if (d.getElementById('kpj')) {
        b.removeChild(kpj);
    } else {
        var i, elts = d.getElementsByTagName('script'), inner = '';

        inner = '<ol>';
        for (i = 0; i < elts.length; i++) {
            if (elts[i].src) {
                inner += '<li><a href="' + elts[i].src + '">' + elts[i].src + '</a>';
            } else {
                inner += '<li>no src';
            }
            if (elts[i].innerHTML !== '') {
                inner += ' <button onclick="if (this.nextSibling.style.display===\'none\'){this.nextSibling.style.display=\'block\';}else{this.nextSibling.style.display=\'none\';}">details</button>'
                       + '<div style="display:none">'
                       + nl2br(elts[i].innerHTML, false)
                       + '</div>';
            }
            inner += '</li>';
        }
        inner += '</ol>';
        kpj.innerHTML = inner;
        b.appendChild(kpj);
    }
}

function keepSelectedElements() {
    var i, len;
    for (i = 0, len = sel.length; i < len; i++) {
        markParent(sel[i], 'kpk');
        markChildren(sel[i], 'kpk');
    }
    generateKeptElements(b, false);
    reset();
}

function onOff() {
    if (onImagesBase64 === 0) {
        menu.innerHTML = menu.innerHTML.replace(/ff images base64/g, 'n images base64');
        onImagesBase64 = 1;
    } else {
        menu.innerHTML = menu.innerHTML.replace(/n images base64/g, 'ff images base64');
        onImagesBase64 = 0;
    }
}

function removeNoneDisplayElements() {
    while (hist.length) {
        removeElement(hist.pop());
    }
}

function removeSelectedElements() {
    var i, len;
    if (sel.length === 0) {
        removeNoneDisplayElements();
    } else {
        for (i = 0, len = sel.length; i < len; i++) {
            removeElement(sel[i]);
        }
        reset();
    }
}

function styleList() {
    deselectSelected();
    if (d.getElementById('kps')) {
        b.removeChild(kps);
    } else {
        var i, elts = d.getElementsByTagName('style'), eltl = d.getElementsByTagName('link'), inner = '';

        inner = '<ol>';
        /* elts.length - 1 to remove kriss pin style */
        for (i = 0; i < elts.length - 1; i++) {
            inner += '<li>style';

            if (elts[i].innerHTML !== '') {
                inner += ' <button onclick="if (this.nextSibling.style.display===\'none\'){this.nextSibling.style.display=\'block\';}else{this.nextSibling.style.display=\'none\';}">details</button>'
                       + '<div style="display:none">'
                       + nl2br(elts[i].innerHTML, false)
                       + '</div>';
            }
            inner += '</li>';
        }
        for (i = 0; i < eltl.length; i++) {
            if (eltl[i].rel.indexOf('stylesheet') > -1) {
                inner += '<li>link: <a href="' + eltl[i].href + '">' + eltl[i].href + '</a>';
            }
            inner += '</li>';
        }
        inner += '</ol>';
        kps.innerHTML = inner;
        b.appendChild(kps);
    }
}

function toggleCurrentSelected() {
    if (!kpec && !kpeh && currentSel !== null) {
        if (hasClass(currentSel, 'kps')) {
            unSelectElement(currentSel);
        } else {
            selectElement(currentSel);
        }
    }
}

function marginAutoOnLastSelected() {
    if (sel.length > 0) {
        sel[sel.length - 1].style.margin = 'auto';
        unSelectElement(sel[sel.length - 1]);
    }
}

function noneDisplaySelected() {
    var elt;
    while (sel.length) {
        elt = sel[0];
        unSelectElement(elt);
        hist.push(elt);
        elt.style.display = 'none';
    }
}

function undoNoneDisplay() {
    if (hist.length) {
        hist.pop().style.display = '';
    }
}

function exitPin() {
    var i = 0, elt;

    removeElement(kpb);
    removeElement(kpj);
    removeElement(kps);
    removeElement(kpx);
    removeElement(menu);
    removeElement(overlay);
    removeElement(style);

    while ((elt = allElt.item(i++)) !== null) {
        changeClass(elt);
        elt.onmouseover = elt.onmouseoverSaved || null;
        elt.onmouseout = elt.onmouseoutSaved || null;
        elt.onclick = elt.onclickSaved || null;
        elt.onmouseoverSaved = null;
        elt.onmouseoutSaved = null;
        elt.onclickSaved = null;
    }
    d.onkeydown = d.onkeydownSaved || null;
}

function viewCode() {
    reset(true);
    var div = d.createElement('div');
    div.innerHTML = escapeHtml(generateCode());
    removeChildren(b);
    b.style.cssText = '';
    b.appendChild(div);
    exitPin();
}

function widenLastSelected() {
    var elt;
    if (sel.length > 0 && sel[sel.length - 1] !== b) {
        elt = sel[sel.length - 1];
        unSelectElement(elt);
        selectElement(elt.parentNode);
    } else {
        unSelectElement(b);
    }
}

/**
 * http://www.betterprogramming.com/downloads/htmlclipper.js
 */
function getXPathForElement(el) {
    var xml = d,
    xpath = '',
    pos,
    tempitem2;

    while (el !== xml.documentElement) {
        pos = 0;
        tempitem2 = el;
        while (tempitem2) {
            if (tempitem2.nodeType === 1 && tempitem2.nodeName === el.nodeName) {
                /* If it is ELEMENT_NODE of the same name */
                pos += 1;
            }
            tempitem2 = tempitem2.previousSibling;
        }
        xpath = el.nodeName + '[' + pos + ']' + '/' + xpath;
        el = el.parentNode;
    }
    xpath = '/' + xml.documentElement.nodeName + '/' + xpath;
    xpath = xpath.replace(/\/$/, '');
    return xpath;
}

function xrayLastSelected() {
    if (d.getElementById('kpx')) {
        b.removeChild(kpx);
    } else {
        if (sel.length > 0) {
            var elt  = sel[sel.length - 1],
                xpath = getXPathForElement(elt),
                rect = elt.getBoundingClientRect(),
                position = w.getComputedStyle(elt, null).getPropertyValue('position'),
                top = w.getComputedStyle(elt, null).getPropertyValue('top'),
                left = w.getComputedStyle(elt, null).getPropertyValue('left'),
                width = w.getComputedStyle(elt, null).getPropertyValue('width'),
                height = w.getComputedStyle(elt, null).getPropertyValue('height'),
                floatCSS = w.getComputedStyle(elt, null).getPropertyValue('float'),
                border = [],
                margin = [],
                padding = [];


            kpx.style.top = (rect.top + w.scrollY + rect.height) + 'px';
            kpx.style.left = rect.left + 'px';

            border[0] = w.getComputedStyle(elt, null).getPropertyValue('border-top-width');
            border[1] = w.getComputedStyle(elt, null).getPropertyValue('border-right-width');
            border[2] = w.getComputedStyle(elt, null).getPropertyValue('border-bottom-width');
            border[3] = w.getComputedStyle(elt, null).getPropertyValue('border-left-width');
            margin[0] = w.getComputedStyle(elt, null).getPropertyValue('margin-top');
            margin[1] = w.getComputedStyle(elt, null).getPropertyValue('margin-right');
            margin[2] = w.getComputedStyle(elt, null).getPropertyValue('margin-bottom');
            margin[3] = w.getComputedStyle(elt, null).getPropertyValue('margin-left');
            padding[0] = w.getComputedStyle(elt, null).getPropertyValue('padding-top');
            padding[1] = w.getComputedStyle(elt, null).getPropertyValue('padding-right');
            padding[2] = w.getComputedStyle(elt, null).getPropertyValue('padding-bottom');
            padding[3] = w.getComputedStyle(elt, null).getPropertyValue('padding-left');

            kpx.innerHTML = '<table>'
                          + '<tr><td colspan="4"><strong>element:</strong> ' + elt.nodeName + '</td></tr>'
                          + '<tr><td colspan="4"><strong>id:</strong> ' + elt.id + '</td></tr>'
                          + '<tr><td colspan="4"><strong>class:</strong> ' + elt.className.replace(/kps/g, '') + '</td></tr>'
                          + '<tr><td colspan="4"><hr></td></tr>'
                          + '<tr><td colspan="4"><strong>inheritance hierarchy:</strong></td></tr>'
                          + '<tr><td colspan="4">' + xpath + '</td></tr>'
                          + '<tr><td colspan="4"><hr></td></tr>'
                          + '<tr><td><strong>position:</strong> ' + position
                          + '</td><td><strong>border</strong></td><td><strong>margin</strong></td><td><strong>padding</strong></td></tr>'
                          + '<tr><td><strong>top:</strong> ' + top
                          + '</td><td><strong>top:</strong> ' + border[0]
                          + '</td><td><strong>top:</strong> ' + margin[0]
                          + '</td><td><strong>top:</strong> ' + padding[0] + '</td></tr>'
                          + '<tr><td><strong>left:</strong> ' + left
                          + '</td><td><strong>right:</strong> ' + border[1]
                          + '</td><td><strong>right:</strong> ' + margin[1]
                          + '</td><td><strong>right:</strong> ' + padding[1] + '</td></tr>'
                          + '<tr><td><strong>width:</strong> ' + width
                          + '</td><td><strong>bottom:</strong> ' + border[2]
                          + '</td><td><strong>bottom:</strong> ' + margin[2]
                          + '</td><td><strong>bottom:</strong> ' + padding[2] + '</td></tr>'
                          + '<tr><td><strong>height:</strong> ' + height
                          + '</td><td><strong>left:</strong> ' + border[3]
                          + '</td><td><strong>left:</strong> ' + margin[3]
                          + '</td><td><strong>left:</strong> ' + padding[3] + '</td></tr>'
                          + '<tr><td colspan="4"><strong>float:</strong> ' + floatCSS + '</td></tr>'
                          + '</table>';
            b.appendChild(kpx);
        }
    }
}

function yourBrowser() {
    w.alert('Browser CodeName: ' + navigator.appCodeName + '\n'
           + 'Browser Name: ' + navigator.appName + '\n'
           + 'Browser Version: ' + navigator.appVersion + '\n'
           + 'Cookies Enabled: ' + navigator.cookieEnabled + '\n'
           + 'Platform: ' + navigator.platform + '\n'
           + 'User-agent header: ' + navigator.userAgent);
}

function zoom() {
    var elt;
    if (sel.length > 0) {
        elt = sel[sel.length - 1];
        if (elt.style.zoom === zoomValue || elt.style.MozTransform === 'scale(' + zoomValue + ')' || elt.style.WebkitTransform === 'scale(' + zoomValue + ')') {
            elt.style.zoom = '';
            elt.style.MozTransform = '';
            elt.style.WebkitTransform = '';
        } else {
            elt.style.zoom = zoomValue;
            elt.style.MozTransform = 'scale(' + zoomValue + ')';
            elt.style.WebkitTransform = 'scale(' + zoomValue + ')';
        }
    }
}

function initPin() {
    var i, len, elt, eltStyle;

    /* add events to all elements */
    i = 0;
    while ((elt = allElt.item(i++)) !== null) {
        addEvents(elt);
    }

    /* defaultStyle for generated css edition */
    /* do not append to body otherwise style will be modified */
    eltStyle = w.getComputedStyle(d.createElement('div'), null);
    for (i = 0, len = eltStyle.length; i < len; i++) {
        if (alwaysKeepStyle.indexOf(eltStyle.item(i)) === -1) {
            defaultStyle[eltStyle.item(i)] = eltStyle.getPropertyValue(eltStyle.item(i));
        }
    }

    /* overlay */
    overlay.id = 'kpo';
    b.appendChild(overlay);

    /* body, javascript, xray div */
    kpb.id = 'kpb';
    kpj.id = 'kpj';
    kps.id = 'kps';
    kpx.id = 'kpx';

    /* menu */
    menu.id = 'kpm';
    menu.innerHTML = '<span>?</span><div style="text-align:center;text-decoration:underline;"><a href="' + pinUrl + '">KrISS pin bookmarklet</a></div><div style="text-align:center;">by <a href="http://tontof.net">Tontof</a></div><div><em>&uarr;</em>parent node<br><em>&darr;</em>child back node<br><em>&larr;</em>previous sibling<br><em>&rarr;</em>next sibling<br><em>A</em>bout KrISS pin<br><em>B</em>ody tree<br><em>C</em>ss edit last selected<br><em>D</em>eselect all<br><em>E</em>xport<br><em>F</em>irst child selection<br><em>G</em>enerate style for selected<br><em>H</em>tml edit last selected<br><em>I</em>solate selected<br><em>J</em>avascript information<br><em>K</em>eep selected<br><em>L</em>ast child selection<br><em>M</em>argin auto on last selected<br><em>N</em>one display for selected<br><em>O</em>' + (onImagesBase64 === 1 ? 'n' : 'ff') + ' images base64<br><em>P</em>rint<br><em>Q</em>uit KrISS pin<br><em>R</em>emove selected or none<br><em>S</em>tyle information<br><em>T</em>oggle selection current over<br><em>U</em>ndo none display<br><em>V</em>iew code<br><em>W</em>iden last selected<br><em>X</em>ray last selected<br><em>Y</em>our browser<br><em>Z</em>oom last selected<br><div style="text-align:center;text-decoration:underline;">ESC to exit</div><br>';
    b.appendChild(menu);

    /* set style */
    css = '#kpm{background-color:#ddd;color:#000;text-decoration:none;position:fixed;top:0;right:0;padding:0.24em;font-size:.9em;overflow:auto;height:100%;width:auto;z-index:99999;}'
        + '#kpm em{background-color:#999;color:#000;display:inline-block;font-style:italic;font-weight:bold;margin:.2em;padding:0.2em;text-align:center;width:1em;}'
        + '#kpm div{display:none;}'
        + '#kpe{position:absolute;left:0;right:0;padding:5px 10px;background:#fdd;}'
        + '#kpe textarea{width:99%;display:block;}'
        + '#kpm:hover div{display:block;}'
        + '#kpm:hover span{display:none;}'
        + '#kpo{pointer-events:none}'
        + '#kpb{width:100%;position:absolute;top:0;left:0;z-index:99999;background-color:#ddd;}'
        + '#kpj{width:100%;position:absolute;top:0;left:0;z-index:99999;padding-left:30px;background-color:#ddd;}'
        + '#kps{width:100%;position:absolute;top:0;left:0;z-index:99999;padding-left:30px;background-color:#ddd;}'
        + '#kpx{position:absolute;top:0;left:0;z-index:99999;padding:10px;background-color:#ddd;width:auto;}'
        + ('.kph{background:#ff9;}'.replace(/;/g, ' !important;'));
    style.appendChild(d.createTextNode(css));
    d.getElementsByTagName('head')[0].appendChild(style);

    /* add key features */
    d.onkeydownSaved = d.onkeydown;
    d.onkeydown = function (evt) {
           if (!evt) {
               evt = window.event;
           }
           if (kpec || kpeh) {
               return true;
           }

           switch (evt.keyCode) {
               case 27: /* esc = exit, cleanup events */
               exitPin();
               break;
               case 37: /* left arrow = previous sibling */
               moveTo('previous');
               return false;
               case 38: /* up arrow = select parent */
               moveTo('parent');
               return false;
               case 39: /* right arrow = next sibling */
               moveTo('next');
               return false;
               case 40: /* down arrow = select back child */
               moveTo('child');
               return false;

               case 65: /* a = about */
               w.alert('              KrISS pin bookmarklet\n'
                      + 'Copyleft - 2012 Tontof - http://tontof.net\n'
                      + '(use KrISS pin bookmarklet at your own risk)');
               break;
               case 66: /* b = body tree */
               bodyTree();
               break;
               case 67: /* c = css edit last selected */
               cssEditLastSelected();
               break;
               case 68: /* d = deselect selected */
               deselectSelected();
               break;
               case 69: /* e = export */
               exportElements();
               break;
               case 70: /* f = first child selection */
               moveTo('first');
               break;
               case 71: /* g = generate selected style */
               generateStyleSelectedElements();
               break;
               case 72: /* h = html edit last selected */
               htmlEditLastSelected();
               break;
               case 73: /* i = isolate selected elements */
               isolateSelectedElements();
               break;
               case 74: /* j = javascript list */
               javascriptList();
               break;
               case 75: /* k = keep selected elements */
               keepSelectedElements();
               break;
               case 76: /* l = last child selection */
               moveTo('last');
               break;
               case 77: /* m = margin auto on last selected */
               marginAutoOnLastSelected();
               break;
               case 78: /* n = none display for selected */
               noneDisplaySelected();
               break;
               case 79: /* o = on/off */
               onOff();
               break;
               case 80: /* p = put in order */
               putInOrder();
               break;
               case 81: /* q = quit */
               exitPin();
               break;
               case 82: /* r = remove selected elements */
               removeSelectedElements();
               break;
               case 83: /* s = style list */
               styleList();
               break;
               case 84: /* t = toggle current selected */
               toggleCurrentSelected();
               break;
               case 85: /* u = undo */
               undoNoneDisplay();
               break;
               case 86: /* v = view code */
               viewCode();
               break;
               case 87: /* w = widen last selected */
               widenLastSelected();
               break;
               case 88: /* x = Xray last selected */
               xrayLastSelected();
               break;
               case 89: /* y = your browser */
               yourBrowser();
               break;
               case 90: /* z = Zoom last selected */
               zoom();
               break;
               case 112: /* ? = show/hide menu */
               toggleMenu();
               break;
               default:
               break;
           }
       };
}

if (d.getElementById('kpm') === null) {
    initPin();
}

})();