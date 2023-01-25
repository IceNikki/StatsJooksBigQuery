/* ---------------------------------------------- */
/* --------- Fonctions utiles délocalisées------- */
/* ---------------------------------------------- */

import html2canvas from 'html2canvas';

// Permet de transformer en composant html en image
export function exportAsPicture () {

    const html = document.getElementsByTagName('HTML')[0];
    const body =  document.getElementsByTagName('BODY')[0]
    let htmlWidth = html.clientWidth;
    let bodyWidth = body.clientWidth;
    

    const data = document.getElementById('modalGraph')
    const newWidth = data.scrollWidth - data.clientWidth


    if (newWidth > data.clientWidth){
        htmlWidth += newWidth
        bodyWidth += newWidth
    }

    html.style.width = htmlWidth + 'px'
    body.style.width = bodyWidth + 'px'

    html2canvas(data).then((canvas)=>{
        return canvas.toDataURL('image/jpg', 1.0)
    }).then((image)=>{
        let currDate = new Date()
        currDate = currDate.toISOString().split('T')[0] + currDate.getHours()
        saveAs(image, 'graph_'+currDate.toString()+'.jpg')
        html.style.width = null
        body.style.width = null
    })
}


// enregistre une image sur un pc
export function saveAs (blob, fileName) {
    const elem = window.document.createElement('a');
    elem.href = blob
    elem.download = fileName;
    (document.body || document.documentElement).appendChild(elem);
    if (typeof elem.click === 'function') {
        elem.click();
    } else {
        elem.target = '_blank';
        elem.dispatchEvent(new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        }));
    }
    URL.revokeObjectURL(elem.href);
    elem.remove()
}

// retourne un nombre décimal au centième après virgule
export function roundToTwo(num) {
    return +(Math.round(num + "e+2")  + "e-2");
}