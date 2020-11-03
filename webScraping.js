const TikaServer = require("tika-server");
const rp = require('request-promise');
const cheerio = require('cheerio');

// Télécharger un pdf
const getPdf = (url) => {
    if(url) {
        return rp({
            url: url,
            encoding: null
        }).then(function (pdf) {
            // console.log("PDF download");
            return pdf;
        }).catch(function (err) {
            console.error("getPdf :: RP ERROR:", err);
        });
    } else {
        console.error("getPdf :: url undefined");
        return Promise.resolve(undefined);
    }
}

// Télécharger une page HTML
const getHtml = (url) => {
    if(url) {
      return rp(url)
      .then(function (htmlString) {
        // console.log(htmlString);
        return htmlString;
      })
      .catch(function (err) {
        //console.error("getHtml :: RP ERROR:", err)
      });
    } else {
      //console.error("getHtml :: url undefined")
      return Promise.resolve(undefined);
    }
  }

// Analyser du html
const extractUrlPdfs = (url) => {
    return getHtml(url).then((html) => {
      const $ = cheerio.load(html);
      const urls = $('#block-system-main .content-offre-formations table a').map(function() {
        return $(this).attr('href');
      }).get()
      //console.log("urls:", urls);
      return urls;
    })
  }

// Lance le serveur Tika
// Doc : https://www.npmjs.com/package/tika-server
const ts = new TikaServer();

// Lance le serveur tika
ts.start().then(() => {
    // liste de mes urls de pdf
    /*const listeUrlPdfs = [
        'https://cours.reimert.fr/TC-4-I-ASY.pdf',
        'http://planete.insa-lyon.fr/scolpeda/f/ects?id=40925&_lang=fr'
    ]*/
    //extractUrlPdfs('https://www.insa-lyon.fr/fr/formation/diplomes/ING').then( (urlsUE) => {
        //urlsUE.map( (lienURL) => {
            //return console.log('https://www.insa-lyon.fr'+lienURL);
            //extractUrlPdfs('https://www.insa-lyon.fr'+lienURL).then( (urlsListe) => {
            extractUrlPdfs('https://www.insa-lyon.fr/fr/formation/parcours/1333/4/2').then( (urlsListe) => {
                // Pour chaque url ...
                //return console.log(urlsListe);
                Promise.all(urlsListe.map((url) => {
                    // Extraction du texte.
                    getPdf(url).then((pdf) => {
                        // console.log("pdf", pdf);
                        if(pdf) {
                            return ts.queryText(pdf).then((data) => {
                                console.log(data);
                                let code = /CODE : ([^\n]*)/.exec(data)[1];
                                //let ects = /ECTS : ([^\n]*)/.exec(data)[1];
                                //let cours = /Cours : ([^\n]*)/.exec(data)[1];
                                //let TD = /TD : ([^\n]*)/.exec(data)[1];
                                //let TP = /TP : ([^\n]*)/.exec(data)[1];
                                //let Projet = /Projet : ([^\n]*)/.exec(data)[1];
                                //let travailPerso = /Travail personnel : ([^\n]*)/.exec(data)[1];
                                console.log("Code :", code);
                                //pdfData = {
                                    //"Code" :  code,
                                    //"ects" :  ects,
                                    //"cours" :  cours,
                                    //"td" :  TD,
                                    //"tp" :  TP,
                                    //"projet" :  Projet,
                                    //"travil perso" :  travailPerso
                                //}

                                //console.log(JSON.stringify(pdfData, null, 2))
                            });
                        }
                    })
                }))
            })
        //})
    //})
}).then(() => {
    return ts.stop()
}).catch((err) => {
    console.log(`TIKA ERROR: ${err}`)
})