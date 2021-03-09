const express = require("express");
const app = express();
const open = require("open");
const { StringDecoder } = require("string_decoder");
const decoder = new StringDecoder("utf8");
var os = require("os");
console.log("\x1b[36m%s\x1b[0m", "#####################################################################");
const OStype = os.type();
console.log("\x1b[36m%s\x1b[0m", "Operating System: " + OStype);
const OSrelease = os.release();
console.log("\x1b[36m%s\x1b[0m", "Version: " + OSrelease);
const OSplatform = os.platform();
console.log("\x1b[36m%s\x1b[0m", "Platform: " + OSplatform);
console.log("\x1b[36m%s\x1b[0m", "#####################################################################");
const windowsPrefixPATH = "C:/Users/H17/Desktop/NJS/";
const androidPrefixPATH = "/data/data/com.termux/files/home/NJS/";
const OSPrefixPATH = OSplatform == "android" ? androidPrefixPATH : OSplatform == "win32" ? windowsPrefixPATH : null;
const { exec } = require("child_process");
//const liveServer = require("live-server");
const { Console, error } = require("console");
const fs = require("fs");
const configFile = fs.readFileSync(OSPrefixPATH + "config.json");
const contentFile = fs.readFileSync(OSPrefixPATH + "content.json");
const itemsContentFile = fs.readFileSync(OSPrefixPATH + "webTree/items_content.json");
const webConfig = JSON.parse(configFile);
const webContent = JSON.parse(contentFile);
const webitemsContent = JSON.parse(itemsContentFile);

const http = require("http");
var https = require("https");
var path = require("path");
const e = require("express");
const { relative } = require("path");
//hello
checkLocalStorage();
var isMediaDownloading = false;
var isServerStarting = false;

function checkLocalStorage() {
    let defaultDirectories = ["/css", "/fileStorage", "/fileStorage/archive", "/fileStorage/themes", "/JS", "/JS/addons", "/JS/scripts", "/Img"];
    for (let dd = 0; dd < defaultDirectories.length; dd++) {
        let _localdefaultDirectories = OSPrefixPATH + "webTree" + defaultDirectories[dd];
        if (!fs.existsSync(_localdefaultDirectories)) {
            console.log("Creazione della cartella necessaria...", _localdefaultDirectories);
            fs.mkdirSync(_localdefaultDirectories, { recursive: true });
            //Quando la directory vieni create (per linux/android) ci sta il bisogno di cambiare il permesso del file per poter salvare dentro altri file
            fs.chmod(_localdefaultDirectories, 0777, (error) => {
                if (error) console.error(`Impossibile cambiare il permesso del file per (${_localdefaultDirectories})`);
            });
        }
        if (dd == defaultDirectories.length - 1) {
            checkWebIntegrity();
        }
    }
}

function checkWebIntegrity() {
    if (!isOnline) {
        console.log(
            "\x1b[32m",
            "\n#####################################################################\nNessuna conessione internet trovata...\n#####################################################################\n"
        );
        console.log("\n#####################################################################\nRichiesta di avvio del server locale");
        setTimeout(function () {
            startWebServer();
        }, 5000);
    }

    console.log(
        "\x1b[32m",
        "\n#####################################################################\nAvvio del aggiornamento dei file in corso...\n#####################################################################\n"
    );

    if (webConfig.baseURL == undefined) {
        console.error("Nessun URL specificato nel file config...");
        process.exit(1);
    }

    var _done_HTML = false;
    var _done_CSS = false;
    var _done_JS = false;

    //?Getting HTML
    for (let webPathIndex = 0; webPathIndex < webConfig.webTree.length; webPathIndex++) {
        var options = {
            host: webConfig.baseURL,
            port: 443,
            path: webConfig.webTree[webPathIndex],
            method: "GET",
        };

        let data = "null";
        var req = https.request(options, function (res) {
            console.log(`Controllo (${webConfig.webTree[webPathIndex]})`);
            let headers = res.headers;

            let acessPath = "null";
            try {
                acessPath = webContent.content[webPathIndex].urlPath;
            } catch (error) {
                console.error("\x1b[35m", "Aggiornamento del contenuto nel config: ", webConfig.webTree[webPathIndex]);
            }

            fs.access(OSPrefixPATH + "webTree" + acessPath, (error) => {
                if (
                    !error &&
                    headers["content-length"] == webContent.content[webPathIndex].contentlength &&
                    headers["last-modified"] == webContent.content[webPathIndex].lastmodified
                ) {
                    console.log(`Nessun aggiornamento per (${webContent.content[webPathIndex].urlPath})`);
                    if (webPathIndex == webConfig.webTree.length - 1) {
                        //Indica che il controllo dei file HTML Г© finito
                        _done_HTML = true;
                        redyForWebProductsIntegrityCheck(_done_HTML, _done_JS, _done_CSS);
                    }
                    return;
                } else {
                    console.error("\x1b[35m", "Aggiornamento del contenuto nei file locali: ", webConfig.webTree[webPathIndex]);
                    data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        let fileName = `${OSPrefixPATH}webTree${webConfig.webTree[webPathIndex]}.html`;
                        fs.writeFileSync(fileName, data, "utf8", function (err) {
                            if (err) return console.log(err);
                            fs.chmod(fileName, 0777, (error) => {
                                if (error) console.error(`Impossibile cambiare il permesso del file per (${webConfig.webTree[webPathIndex]})`);
                            });
                        });
                        webContent.content[webPathIndex] = {
                            urlPath: webConfig.webTree[webPathIndex],
                            contentlength: headers["content-length"],
                            lastmodified: headers["last-modified"],
                        };
                        fs.writeFileSync(OSPrefixPATH + "content.json", JSON.stringify(webContent));

                        if (webPathIndex == webConfig.webTree.length - 1) {
                            //Indica che il controllo dei file HTML Г© finito
                            _done_HTML = true;
                            redyForWebProductsIntegrityCheck(_done_HTML, _done_JS, _done_CSS);
                        }
                    });
                }
            });
        });
        req.end();
    }

    //?Getting JS
    for (let jsPathIndex = 0; jsPathIndex < webConfig.webTreeJS.jsFilesPath.length; jsPathIndex++) {
        var options = {
            host: webConfig.baseURL,
            port: 443,
            path: webConfig.webTreeJS.dirName + webConfig.webTreeJS.jsFilesPath[jsPathIndex],
            method: "GET",
        };
        let data = "null";
        var req = https.request(options, function (res) {
            console.log(`Controllo (${webConfig.webTreeJS.dirName + webConfig.webTreeJS.jsFilesPath[jsPathIndex]})`);
            let headers = res.headers;
            let acessPath = "null";
            try {
                acessPath = webContent.jscontent[jsPathIndex].urlPath;
            } catch (error) {
                console.error("\x1b[35m", "Aggiornamento del contenuto nel config: ", webConfig.webTreeJS.dirName + webConfig.webTreeJS.jsFilesPath[jsPathIndex]);
            }

            fs.access(OSPrefixPATH + "webTree" + acessPath, (error) => {
                if (
                    !error &&
                    headers["content-length"] == webContent.jscontent[jsPathIndex].contentlength &&
                    headers["last-modified"] == webContent.jscontent[jsPathIndex].lastmodified
                ) {
                    console.log(`Nessun aggiornamento per (${webContent.jscontent[jsPathIndex].urlPath})`);
                    if (jsPathIndex == webConfig.webTreeJS.jsFilesPath.length - 1) {
                        _done_JS = true;
                        redyForWebProductsIntegrityCheck(_done_HTML, _done_JS, _done_CSS);
                    }
                    return;
                } else {
                    console.error("\x1b[35m", "Aggiornamento del contenuto nei file locali: ", webConfig.webTreeJS.dirName + webConfig.webTreeJS.jsFilesPath[jsPathIndex]);

                    data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        let fileName = `${OSPrefixPATH}webTree${webConfig.webTreeJS.dirName + webConfig.webTreeJS.jsFilesPath[jsPathIndex]}`;
                        fs.writeFileSync(fileName, data, "utf8", function (err) {
                            if (err) return console.log(err);
                            fs.chmod(fileName, 0777, (error) => {
                                if (error) console.error(`Impossibile cambiare il permesso del file per (${webConfig.webTreeJS.jsFilesPath[jsPathIndex]})`);
                            });
                        });
                        webContent.jscontent[jsPathIndex] = {
                            urlPath: webConfig.webTreeJS.dirName + webConfig.webTreeJS.jsFilesPath[jsPathIndex],
                            contentlength: headers["content-length"],
                            lastmodified: headers["last-modified"],
                        };
                        fs.writeFileSync(OSPrefixPATH + "content.json", JSON.stringify(webContent));
                        if (jsPathIndex == webConfig.webTreeJS.jsFilesPath.length - 1) {
                            _done_JS = true;
                            redyForWebProductsIntegrityCheck(_done_HTML, _done_JS, _done_CSS);
                        }
                    });
                }
            });
        });
        req.end();
    }

    //?Getting CSS
    for (let cssPathIndex = 0; cssPathIndex < webConfig.webTreeCSS.cssFilesPath.length; cssPathIndex++) {
        var options = {
            host: webConfig.baseURL,
            port: 443,
            path: webConfig.webTreeCSS.dirName + webConfig.webTreeCSS.cssFilesPath[cssPathIndex],
            method: "GET",
        };
        let data = "null";
        var req = https.request(options, function (res) {
            console.log(`Controllo (${webConfig.webTreeCSS.dirName + webConfig.webTreeCSS.cssFilesPath[cssPathIndex]})`);
            let headers = res.headers;
            let acessPath = "null";
            try {
                acessPath = webContent.csscontent[cssPathIndex].urlPath;
            } catch (error) {
                console.error("\x1b[35m", "Aggiornamento del contenuto nel config: ", webConfig.webTreeCSS.dirName + webConfig.webTreeCSS.cssFilesPath[cssPathIndex]);
            }

            fs.access(OSPrefixPATH + "webTree" + acessPath, (error) => {
                if (
                    !error &&
                    headers["content-length"] == webContent.csscontent[cssPathIndex].contentlength &&
                    headers["last-modified"] == webContent.csscontent[cssPathIndex].lastmodified
                ) {
                    console.log(`Nessun aggiornamento per (${webContent.csscontent[cssPathIndex].urlPath})`);
                    if (cssPathIndex == webConfig.webTreeCSS.cssFilesPath.length - 1) {
                        _done_CSS = true;
                        redyForWebProductsIntegrityCheck(_done_HTML, _done_JS, _done_CSS);
                    }
                    return;
                } else {
                    console.error("\x1b[35m", "Aggiornamento del contenuto nei file locali: ", webConfig.webTreeCSS.dirName + webConfig.webTreeCSS.cssFilesPath[cssPathIndex]);

                    data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        let fileName = `${OSPrefixPATH}webTree${webConfig.webTreeCSS.dirName + webConfig.webTreeCSS.cssFilesPath[cssPathIndex]}`;
                        fs.writeFileSync(fileName, data, "utf8", function (err) {
                            if (err) return console.log(err);
                            fs.chmod(fileName, 0777, (error) => {
                                if (error) console.error(`Impossibile cambiare il permesso del file per (${webConfig.webTree[webPathIndex]})`);
                            });
                        });
                        webContent.csscontent[cssPathIndex] = {
                            urlPath: webConfig.webTreeCSS.dirName + webConfig.webTreeCSS.cssFilesPath[cssPathIndex],
                            contentlength: headers["content-length"],
                            lastmodified: headers["last-modified"],
                        };
                        fs.writeFileSync(OSPrefixPATH + "content.json", JSON.stringify(webContent));

                        if (cssPathIndex == webConfig.webTreeCSS.cssFilesPath.length - 1) {
                            _done_CSS = true;
                            redyForWebProductsIntegrityCheck(_done_HTML, _done_JS, _done_CSS);
                        }
                    });
                }
            });
        });
        req.end();
    }
}
//Questa funziona viene chiamato ogni volta che un modulo (HTML/JS/CSS) ha finito il controllo
//Quando tutti 3 moduli hanno finito il controllo la funziona chiama il prossimo passaggio
function redyForWebProductsIntegrityCheck(__done_HTML, __done_JS, __done_CSS) {
    if (__done_HTML && __done_JS && __done_CSS) {
        console.log("\x1b[32m", "Aggiornamento dei file eseguito...");
        checkStaticImages();
        checkThemes();
    }
}

function checkStaticImages() {
    var options = {
        host: webConfig.baseURL,
        port: 8443,
        path: "/materialeinvendita/stores/staticontent",
        method: "GET",
    };

    var req = https.request(options, function (res) {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });

        res.on("end", () => {
            data = JSON.parse(data);
            downloadStaticImages(data);
        });
    });
    req.end();
}

function downloadThemes(themesList) {
    for (let themes_indx = 0; themes_indx < themesList.length; themes_indx++) {
        var options = {
            host: webConfig.baseURL,
            port: 443,
            path: `/fileStorage/themes/${themesList[themes_indx].themeId}/${themesList[themes_indx].themePath}`,
            method: "GET",
        };

        let _localThemesDirectory = OSPrefixPATH + `webTree/fileStorage/themes/${themesList[themes_indx].themeId}`;
        if (!fs.existsSync(_localThemesDirectory)) {
            console.log("Creazione della cartella dei temi...", _localThemesDirectory);
            fs.mkdirSync(_localThemesDirectory, { recursive: true });
            //Quando la directory vieni create (per linux/android) ci sta il bisogno di cambiare il permesso del file per poter salvare dentro altri file
            fs.chmod(_localThemesDirectory, 0777, (error) => {
                if (error) console.error(`Impossibile cambiare il permesso del file per (${_localdefaultDirectories})`);
            });
        }

        var req = https.request(options, function (res) {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                let fileName = `${OSPrefixPATH}webTree/fileStorage/themes/${themesList[themes_indx].themeId}/${themesList[themes_indx].themePath}`;
                fs.writeFileSync(fileName, data, "utf8", function (err) {
                    if (err) return console.log(err);
                    fs.chmod(fileName, 0777, (error) => {
                        if (error) console.error(`Impossibile cambiare il permesso del file per (${webConfig.webTree[webPathIndex]})`);
                    });
                });
            });
        });
        req.end();
    }
}

function downloadStaticImages(staticImagesList) {
    let static_images_list_indxREQUEST_COMPLETED = [];
    for (let staticImages_indx = 0; staticImages_indx < staticImagesList.length; staticImages_indx++) {
        var options = {
            host: webConfig.baseURL,
            port: 443,
            path: `/Img/${staticImagesList[staticImages_indx]}`,
            method: "GET",
        };

        var req = https.request(options, function (res) {
            let data = "";
            res.setEncoding("binary");

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                let _file = `${OSPrefixPATH}webTree/Img/${staticImagesList[staticImages_indx]}`;
                static_images_list_indxREQUEST_COMPLETED.push(staticImages_indx);

                fs.writeFile(_file, data, "binary", function (err) {
                    if (err) {
                        console.log(err);
                        console.error(`Il file : ${_file} Г© corrotto e non si Г© salvato sul disco locale...`);
                    } else {
                        fs.chmod(_file, 0777, (error) => {
                            if (error) console.error(`Impossibile cambiare il permesso del file per (${_file})`);
                        });
                    }
                    console.log("\x1b[32m", `(${staticImages_indx})Fine del salvataggio del file: `, _file);
                });

                if (static_images_list_indxREQUEST_COMPLETED.length == staticImagesList.length) {
                    setTimeout(function () {
                        checkWebProductsIntegrity();
                    }, 3000);
                }
            });
        });
        req.end();
    }
}

function checkThemes() {
    var options = {
        host: webConfig.baseURL,
        port: 8443,
        path: "/materialeinvendita/themes",
        method: "GET",
    };

    var req = https.request(options, function (res) {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });

        res.on("end", () => {
            data = JSON.parse(data);
            downloadThemes(data);
        });
    });
    req.end();
}

function checkWebProductsIntegrity() {
    console.log(
        "\n#####################################################################\nAvvio del aggiornamento dei dati in corso...\n#####################################################################\n"
    );
    if (webConfig.baseURL == undefined) {
        console.error("Nessun URL specificato nel file config...");
        process.exit(1);
    }

    //?STORES
    var options = {
        host: webConfig.baseURL,
        port: 8443,
        path: "/materialeinvendita/stores?cA=na",
        method: "GET",
    };

    var req = https.request(options, function (res) {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });

        res.on("end", () => {
            data = JSON.parse(data);

            for (let store = 0; store < data.length; store++) {
                let content = {
                    store_id: data[store].store_id,
                    store_name: data[store].store_name,
                    category: data[store].category,
                    media: data[store].media,
                    storage: data[store].storage,
                };
                webitemsContent.stores[store] = content;

                fs.writeFile(OSPrefixPATH + "webTree/items_content.json", JSON.stringify(webitemsContent), function (err) {
                    if (err) return console.error(err);
                    if (store == data.length - 1) {
                        checkWebProductsIntegrity_STORAGES();
                    }
                });
            }
        });
    });
    req.end();
}

function checkWebProductsIntegrity_STORAGES() {
    //?STORE STORAGE
    let store_id_list = [];

    webitemsContent.stores.filter(function (x) {
        store_id_list.push(x.store_id);
    });

    //console.log(store_id_list);

    let store_id_list_indxREQUEST_COMPLETED = [];

    for (let store_id_list_indx = 0; store_id_list_indx < store_id_list.length; store_id_list_indx++) {
        var options = {
            host: webConfig.baseURL,
            port: 8443,
            path: `/materialeinvendita/stores/${store_id_list[store_id_list_indx]}`,
            method: "GET",
        };

        var req = https.request(options, function (res) {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                data = JSON.parse(data);
                store_id_list_indxREQUEST_COMPLETED.push(store_id_list[store_id_list_indx]);
                for (let _storage_inx = 0; _storage_inx < data.storage.length; _storage_inx++) {
                    let content = {
                        storage_id: data.storage[_storage_inx].storage_id,
                        store_ref: data.storage[_storage_inx].store_ref,
                        storage_name: data.storage[_storage_inx].storage_name,
                        storage_media: data.storage[_storage_inx].storage_media,
                        theme: data.storage[_storage_inx].theme,
                        product: data.storage[_storage_inx].product,
                    };
                    webitemsContent.stores[store_id_list_indx].storage[_storage_inx] = content;
                    //console.error("REQUEST FROM STORE > ", store_id_list[store_id_list_indx]);
                    fs.writeFile(OSPrefixPATH + "webTree/items_content.json", JSON.stringify(webitemsContent), function (err) {
                        if (err) return console.error(err);
                        if (store_id_list_indxREQUEST_COMPLETED.length == store_id_list.length) {
                            //console.error("CONTINUE");
                            checkWebProductsIntegrity_PRODUCTS();
                        }
                    });
                }
            });
        });
        req.end();
    }
}

function checkWebProductsIntegrity_PRODUCTS() {
    //?STORE STORAGE ITEMS
    let storage_id_list = [];

    webitemsContent.stores.filter(function (x) {
        for (let st = 0; st < x.storage.length; st++) {
            storage_id_list.push({ stores: x.storage[st].store_ref, storage_id: x.storage[st].storage_id });
        }
    });
    let storage_id_list_indxREQUEST_COMPLETED = [];
    for (let storage_id_list_indx = 0; storage_id_list_indx < storage_id_list.length; storage_id_list_indx++) {
        var options = {
            host: webConfig.baseURL,
            port: 8443,
            path: `/materialeinvendita/stores/${storage_id_list[storage_id_list_indx].stores}/storage/${storage_id_list[storage_id_list_indx].storage_id}/allproducts`,
            method: "GET",
        };

        var req = https.request(options, function (res) {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                data = JSON.parse(data);
                //console.log(data);
                storage_id_list_indxREQUEST_COMPLETED.push(storage_id_list_indx);

                var store_index = -1;
                var storage_index = -1;

                var store_needle = storage_id_list[storage_id_list_indx].stores;
                webitemsContent.stores.find(function (sid, i) {
                    if (sid.store_id === store_needle) {
                        store_index = i;
                    }
                });

                var storage_needle = storage_id_list[storage_id_list_indx].storage_id;
                webitemsContent.stores[store_index].storage.find(function (stid, i) {
                    if (stid.storage_id === storage_needle) {
                        storage_index = i;
                    }
                });

                //Mettiamo la variabile dei prodotti come un Array perchГ© con la richiesta di prima i prodotti sono un null e non si possono aggiungere all'array
                webitemsContent.stores[store_index].storage[storage_index].product = [];

                for (let _item_inx = 0; _item_inx < data.storage[0].product.length; _item_inx++) {
                    let _storage_item_content = {
                        storage_id: data.storage[0].product[_item_inx].storage_id,
                        product_id: data.storage[0].product[_item_inx].product_id,
                        name: data.storage[0].product[_item_inx].name,
                        comment: data.storage[0].product[_item_inx].comment,
                        category: data.storage[0].product[_item_inx].category,
                        prezzo: data.storage[0].product[_item_inx].prezzo,
                        stato: data.storage[0].product[_item_inx].stato,
                        spedizione: data.storage[0].product[_item_inx].spedizione,
                        qualita: data.storage[0].product[_item_inx].qualita,
                        quantita: data.storage[0].product[_item_inx].quantita,
                        data_creazione: data.storage[0].product[_item_inx].data_creazione,
                        sub_store: data.storage[0].product[_item_inx].sub_store,
                        preferred_media: data.storage[0].product[_item_inx].preferred_media,
                        item_media: data.storage[0].product[_item_inx].item_media,
                        prezzo: data.storage[0].product[_item_inx].prezzo,
                    };
                    //console.log(_item_inx, _storage_item_content);
                    webitemsContent.stores[store_index].storage[storage_index].product[_item_inx] = _storage_item_content;

                    fs.writeFile(OSPrefixPATH + "webTree/items_content.json", JSON.stringify(webitemsContent), function (err) {
                        if (err) {
                            return console.error("Errore: ", err);
                        }
                        if (storage_id_list_indxREQUEST_COMPLETED.length == storage_id_list.length && _item_inx == data.storage[0].product.length - 1) {
                            //console.log("DONE");
                            readLocalUsersDirectory();
                        } else {
                            //console.log("not yet...", storage_id_list_indxREQUEST_COMPLETED, storage_id_list.length);
                        }
                    });
                }
            });
        });
        req.end();
    }
}

function readLocalUsersDirectory() {
    //Controllo delle directory dei utenti
    //Sono le directory che si trovano sul disco locale
    let _usersDirectory = [];
    fs.readdir(OSPrefixPATH + "webTree/fileStorage/archive/", (err, files) => {
        if (err) {
            console.log(err);
        } else {
            files.map(function (f) {
                _usersDirectory.push(f);
            });
            console.log("Lettura della directory locale finita. Inizio controllo sui media....");
            checkWebImagesIntegrity(_usersDirectory);
        }
    });
}

function checkWebImagesIntegrity(__usersDirectory) {
    console.log(
        "\n#####################################################################\nAvvio del aggiornamento dei media...\n#####################################################################\n"
    );
    //?INDEX MEDIA
    //Prendiamo dal file content.json l'informazione delle immagini dinamiche che servono per le locandine dei negozi
    let _indexMedia = [];
    /*webitemsContent.stores.filter(function (x) {
        console.log("Pushing ... ", x.media);
        if (x.media) {
            if (!_indexMedia.includes(x.media)) {
                _indexMedia.push(x.media);
            }
        }
    });*/
    let temp_ids = [];
    for (let _store_indx = 0; _store_indx < webitemsContent.stores.length; _store_indx++) {
        if (webitemsContent.stores[_store_indx].media) {
            let wssim = webitemsContent.stores[_store_indx].media;
            if (!temp_ids.includes(wssim.media_id)) {
                //console.log("Pushing store media: ", webitemsContent.stores[_store_indx].media);
                _indexMedia.push(wssim);
                temp_ids.push(wssim.media_id);
            }
        }
        for (let _storage_indx = 0; _storage_indx < webitemsContent.stores[_store_indx].storage.length; _storage_indx++) {
            if (webitemsContent.stores[_store_indx].storage[_storage_indx].storage_media) {
                let wssissis = webitemsContent.stores[_store_indx].storage[_storage_indx].storage_media;
                if (!temp_ids.includes(wssissis.media_id)) {
                    //console.log("Pushing storage media: ", webitemsContent.stores[_store_indx].storage[_storage_indx].storage_media);
                    _indexMedia.push(wssissis);
                    temp_ids.push(wssissis.media_id);
                }
            }
            for (let _items_indx = 0; _items_indx < webitemsContent.stores[_store_indx].storage[_storage_indx].product.length; _items_indx++) {
                if (webitemsContent.stores[_store_indx].storage[_storage_indx].product[_items_indx].item_media) {
                    let wssissipiii = webitemsContent.stores[_store_indx].storage[_storage_indx].product[_items_indx].item_media;
                    for (let _item_multimedia = 0; _item_multimedia < wssissipiii.length; _item_multimedia++) {
                        if (!temp_ids.includes(wssissipiii[_item_multimedia].media_id)) {
                            //console.log(`Pushing item media  ${_item_multimedia + 1}/${webitemsContent.stores[_store_indx].storage[_storage_indx].product[_items_indx].item_media.length} : `,webitemsContent.stores[_store_indx].storage[_storage_indx].product[_items_indx].item_media[_item_multimedia]);
                            _indexMedia.push(wssissipiii[_item_multimedia]);
                            temp_ids.push(wssissipiii[_item_multimedia].media_id);
                        }
                    }
                }
            }
        }
    }

    checkUnusedMedia(_indexMedia, __usersDirectory);
    //console.log(_indexMedia);
    //let allMedia = [];
}

function downloadMedia(_indexMedia, _localDirMedia, __usersDirectory) {
    if (!isMediaDownloading) {
        isMediaDownloading = true;
    } else {
        return;
    }
    //console.log("Media da scaricare prima del controllo: ", _indexMedia.length);
    let _indexDoubleMediaIndexOf = [];
    for (let _dim = 0; _dim < _indexMedia.length; _dim++) {
        for (let _dm = 0; _dm < _localDirMedia.length; _dm++) {
            if (_localDirMedia[_dm].media_path == _indexMedia[_dim].media_path) {
                _indexDoubleMediaIndexOf.push(_dim);
            }
        }
    }
    for (let idmio = 0; idmio < _indexDoubleMediaIndexOf.length; idmio++) {
        _indexMedia.splice(_indexDoubleMediaIndexOf[idmio], 1);
    }
    console.log("Media da scaricare: ", _indexMedia.length);
    if (_indexMedia.length > 0) {
        let saved_media_list_indxREQUEST_COMPLETED = [];
        for (let _im = 0; _im < _indexMedia.length; _im++) {
            //Controlliamo se sulla pagina index le immagini che derivano dalle directory dei utenti siano presenti anche sul disco locale
            if (!__usersDirectory.includes(_indexMedia[_im].media_owner.toString())) {
                let _localArchive_directory = OSPrefixPATH + "webTree/fileStorage/archive/" + _indexMedia[_im].media_owner;
                fs.mkdirSync(_localArchive_directory, { recursive: true });
                //Quando la directory vieni create (per linux/android) ci sta il bisogno di cambiare il permesso del file per poter salvare dentro altri file
                fs.chmod(_localArchive_directory, 0777, (error) => {
                    if (error) console.error(`Impossibile cambiare il permesso del file per (${_localArchive_directory})`);
                });
            }
            console.log("Controllo media: ", _indexMedia[_im].media_path);
            var options = {
                host: webConfig.baseURL,
                port: 443,
                path: `/fileStorage/archive/${_indexMedia[_im].media_owner}/${_indexMedia[_im].media_path}`,
                method: "GET",
            };

            var req = https
                .request(options, function (res) {
                    let data = "";
                    let headers = res.headers;

                    console.log(_im + ". Media: (" + _indexMedia[_im].media_path + ") si sta scaricando nel archivio locale.");
                    res.setEncoding("binary");
                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        //let _media_data = data.replace(/^data:image\/\w+;base64,/, "");
                        //let buf = Buffer.from(_media_data, "base64");
                        let _file = `${OSPrefixPATH}webTree/fileStorage/archive/${_indexMedia[_im].media_owner}/${_indexMedia[_im].media_path}`;
                        console.log("\x1b[33m", "Inizio del salvataggio del file: ", _file);
                        saved_media_list_indxREQUEST_COMPLETED.push(_im);
                        fs.writeFile(_file, data, "binary", function (err) {
                            if (err) {
                                console.log(err);
                                console.error(`Il file : ${_file} Г© corrotto e non si Г© salvato sul disco locale...`);
                            } else {
                                fs.chmod(_file, 0777, (error) => {
                                    if (error) console.error(`Impossibile cambiare il permesso del file per (${_file})`);
                                });
                            }
                            console.log("\x1b[32m", `(${_im})Fine del salvataggio del file: `, _file);
                        });

                        let seconds = 1;
                        var waitTill = new Date(new Date().getTime() + seconds * 150);
                        while (waitTill > new Date()) {}

                        if (saved_media_list_indxREQUEST_COMPLETED.length == _indexMedia.length) {
                            console.log("\n#####################################################################\nRichiesta di avvio del server locale");
                            setTimeout(function () {
                                startWebServer();
                            }, 5000);
                        } else {
                            console.log("STIAMO SU ", saved_media_list_indxREQUEST_COMPLETED.length, _indexMedia.length);
                        }
                    });
                })
                .on("error", (e) => {
                    console.error(e);
                });
            req.end();
        }
    } else {
        console.log("\n#####################################################################\nRichiesta di avvio del server locale");
        setTimeout(function () {
            startWebServer();
        }, 5000);
    }
}

function checkUnusedMedia(media, existingLocalDirs) {
    let _localDirMedia = [];
    let _mediaToDelete = [];
    let _mediaToDownload = [];
    if (existingLocalDirs.length > 0) {
        for (let existingLocalDirs_indx = 0; existingLocalDirs_indx < existingLocalDirs.length; existingLocalDirs_indx++) {
            fs.readdir(OSPrefixPATH + `webTree/fileStorage/archive/${existingLocalDirs[existingLocalDirs_indx]}`, (err, files) => {
                if (err) {
                    console.log(err);
                } else {
                    files.map(function (f) {
                        _localDirMedia.push({ media_owner: existingLocalDirs[existingLocalDirs_indx], media_path: f });
                    });

                    if (existingLocalDirs_indx == existingLocalDirs.length - 1) {
                        //console.log(`LocalFilesList of dir (${existingLocalDirs[existingLocalDirs_indx]}):`, _localDirMedia);

                        let cm = [];
                        media.forEach((e) => {
                            cm.push(e.media_path);
                        });

                        _localDirMedia.find(function (j) {
                            if (!cm.includes(j.media_path)) {
                                _mediaToDelete.push({ j });
                            }
                        });

                        let ldml = [];

                        _localDirMedia.forEach((e) => {
                            ldml.push(e.media_path);
                        });

                        media.find(function (g) {
                            if (!ldml.includes(g.media_path)) {
                                _mediaToDownload.push(g);
                            }
                        });

                        //console.log("localmedias ", _localDirMedia);
                        deleteUnusedMedia(_mediaToDelete);
                        console.log("\x1b[44m", "\x1b[30m", "Inizio del scaricamento dei file...");
                        downloadMedia(_mediaToDownload, _localDirMedia, existingLocalDirs);
                    }
                }
            });
        }
    } else {
        console.log("\x1b[44m", "\x1b[30m", "Inizio del scaricamento dei file...");
        downloadMedia(media, _localDirMedia, existingLocalDirs);
    }
}

function deleteUnusedMedia(__mediaToDelete) {
    for (let h = 0; h < __mediaToDelete.length; h++) {
        let _file = `${OSPrefixPATH}webTree/fileStorage/archive/${__mediaToDelete[h].j.media_owner}/${__mediaToDelete[h].j.media_path}`;
        console.log("Sto eliminando:", _file);
        try {
            fs.unlinkSync(_file);
        } catch (error) {
            console.error(`Il file (${_file}) ha dato un errore durante l'elliminazione. Probabilmente il file non esiste o pure non ha i permessi per essere modificato...`);
        }
    }
}

function startWebServer() {
    if (!isServerStarting) {
        isServerStarting = true;
    } else {
        return;
    }

    console.log("Avvio del server locale\n#####################################################################\n");
    http.createServer(function (request, response) {
        console.log("Richiesta per... " + request.url);

        var filePath = OSPrefixPATH + "webTree" + request.url.split("?")[0];
        console.log(filePath);
        if (filePath == OSPrefixPATH + "webTree/") {
            filePath = OSPrefixPATH + "webTree/index.html";
        }

        var extname = path.extname(filePath);
        var contentType = "text/html";
        switch (extname) {
            case ".js":
                contentType = "text/javascript";
                break;
            case ".css":
                contentType = "text/css";
                break;
            case ".json":
                contentType = "application/json";
                break;
            case ".png":
                contentType = "image/png";
                break;
            case ".jpg":
                contentType = "image/jpg";
                break;
            case ".gif":
                contentType = "image/gif";
                break;
            case ".wav":
                contentType = "audio/wav";
                break;
        }

        fs.readFile(filePath, function (error, content) {
            if (error) {
                if (error.code == "ENOENT") {
                    fs.readFile("./404.html", function (error, content) {
                        response.writeHead(200, { "Content-Type": contentType });
                        response.end(content, "utf-8");
                    });
                } else {
                    response.writeHead(500);
                    response.end("Errore lato server: " + error.code + " ..\n");
                    response.end();
                }
            } else {
                response.writeHead(200, { "Content-Type": contentType });
                response.end(content, "utf-8");
            }
        });
        console.log("Risposta del server locale... " + filePath);
    }).listen(8853);
    console.log("Il server locale lavora su http://127.0.0.1:8853/");

    var interfaces = os.networkInterfaces();
    var addresses = [];
    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === "IPv4" && !address.internal) {
                addresses.push(address.address);
            }
        }
    }

    console.log("L'indirizzo della macchina sulla rete locale:");
    console.log(addresses);

    setTimeout(function () {
        startWebBrowser();
    }, 1000);
}

function startWebBrowser() {
    console.log(
        "\n#####################################################################\nAvvio del browser\n#####################################################################\n"
    );
    if (OSplatform == "android") {
        exec("am start --user 0 -n com.materialeinvendita.kiosk/com.materialeinvendita.kiosk.MainActivity", (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            if (stderr) {
                console.log(`stderr: ${stderr}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
        });
    }
}

function isOnline() {
    return navigator.onLine;
}
