let activeImageItem = "product_image_item_0";
var askBeforeReload = true;
var islocal = window.location.hostname == "localhost" ? true : false;
const Month = ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"];
const FullMonth = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottombre", "Novembre", "Dicembre"];
const skipToSearchAttr = ["banner_link", "image"];
//Token
const AuthorizationTokenHeader = () => {
    return { Authorization: "Bearer " + accessCookie(appConfig.clientConfig.token_key) };
};

const checkTokenValidity = () => {
    if (typeof accessCookie(appConfig.clientConfig.token_key) === "undefined") {
        ThrowAuthenticationException();
    }
};
//Exceptions
const ThrowAuthenticationException = (exceptionTitle, message, func) => {
    func = func ? func : session_logout;
    alertSystem.alert(exceptionTitle != null ? exceptionTitle : "Sessione scaduta", message != null ? message : "Effettua nuovamente il login", {
        alertType: defineAlertType.ok,
        alertSystemParam_Width: "40%",
        alertSystemParam_Left: "30%",
        alertSystemParam_Closable: false,
        alertSystemParam_AcceptFunction: func,
    });
};
const ThrowException = (message) => alertSystem.notify(message, { alertType: defineNotifyType.error });
//tree link
const TitleArray = (title, func, id) => {
    return "<a " + (id != null ? "id='" + id + "'" : "") + " class='static_link' " + (func != null ? "href='" + func + "'" : "") + ">" + title + "</a>";
};
const buttonArray = (title, func, icon, id, dataAttr, bgColor) => {
    return `<li  ${dataAttr != null ? dataAttr : ""} >
    <a class="maincontent_buttons_color_${bgColor ? bgColor : "DEFAULT"}" ${id != null ? "id='" + id + "'" : ""} 
    ${typeof func === "function" ? "onclick='" + func.name + "()'" : func != null ? "href='" + func + "'" : ""}>${title}
    ${icon ? "<span class='" + icon + "'></span>" : ""}</a></li>`;
};
const getArhivePath = (ImageFullName) =>
    ImageFullName === null || ImageFullName === undefined
        ? `/Img/no_image.png`
        : `${appConfig.serverConfig.fileServer.serverLocation}${appConfig.serverConfig.fileServer.arhivePrefix}${ImageFullName}`;
const getThemePath = (themePreviewImageFullName) =>
    themePreviewImageFullName === null || themePreviewImageFullName === undefined
        ? `/Img/no_image.png`
        : `${appConfig.serverConfig.fileServer.serverLocation}${appConfig.serverConfig.fileServer.themesPrefix}${themePreviewImageFullName}`;

function preProcessBody(callbackFunction) {
    $(`#loading-content-${callbackFunction.body}`).children().remove();
    $(`#loading-spinner-${callbackFunction.body}`).show();
}
function postProcessBody(callbackFunction) {
    activeTableCallback.push({ funcName: `${callbackFunction.output.name}`, func: callbackFunction.output });
}
function showCaricamentoInCorsoGIF(progress) {
    $("body").append(
        `<div id="caricamentoincorsogif" style="width: 100vw; height: 100vh; background: #b0b0b099; position: fixed; top: 0; z-index: 3222;display: flex;justify-content: center;align-items: center; flex-direction: column;">${
            progress
                ? `<h1 style="text-shadow: 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff;" id="verifiedFiles_index">${verifiedFiles_index}/${verifiedFiles.length}  File caricati</h1>`
                : ""
        }<img style="width: 40%;    display: block;min-width: 350px;max-width: 600px;" src="Img/caricamentoincorso.gif"></div>`
    );
}
function hideCaricamentoInCorsoGIF() {
    $("#caricamentoincorsogif").remove();
}
function updateTable(operation, index, callingFunction, param) {
    let v = parseInt($(`#table_page_${index}`).val());
    if (operation == 1) {
        let maxv = parseInt($(`#table_maxpag_${index}`).html());
        if (v >= maxv) return;

        let value = parseInt(v) + 1;
        $(`#table_page_${index}`).val(value);
        param.page = value;
    } else if (operation == 2) {
        if (v <= 1) return;

        let value = parseInt(v) - 1;
        $(`#table_page_${index}`).val(value);
        param.page = value;
    }
    callingFunction(index, param, true, false);
}

let library_all_media = [];
let library_seleced_media = [];

//let selectedImages = [];
let singleImage = false;

let multipleImages = [];

function library_selectImage(e) {
    let element = $(e);
    let mediaId = parseInt(element.attr("data-mediaid"));
    //console.log("new selection", mediaId);
    if (singleImage) {
        selectedImagesIdForForm.forEach((v) => {
            let c = $(`[data-mediaid=${v}]`);
            c.css("background", "rgb(244, 223, 223) none repeat scroll 0% 0%;");
            c.css("border", "6px solid rgb(255, 20, 20);");
            //console.log("removing color from", v);
        });
        if (multipleImages.length > 0) {
            if (multipleImages[0].media_id == undefined) {
                multipleImages.forEach((v) => {
                    let c = $(`[data-mediaid=${v.attr("data-mediaid")}]`);
                    c.css("background", "#f7f8fb");
                    c.css("border", "6px solid #dfe3ed");
                    //console.log("removing color from", v.attr("data-mediaid"));
                });
            }
        }
        multipleImages = [];
        library_seleced_media = [];
    } else {
        //console.log("print ", mediaId);
    }

    if (library_seleced_media.includes(mediaId)) {
        library_seleced_media.splice(library_seleced_media.indexOf(mediaId), 1);
        if (multipleImages.length > 0) {
            if (multipleImages[0].media_id == undefined) {
                if (multipleImages.find((i) => i.attr("data-mediaid") == mediaId)) {
                    multipleImages.splice(multipleImages.indexOf(multipleImages.find((i) => i.attr("data-mediaid") == mediaId)), 1);
                }
            } else {
                if (multipleImages[multipleImages.indexOf(mediaId)] == mediaId) {
                    multipleImages.splice(multipleImages.indexOf(mediaId), 1);
                }
            }
        }

        element.css("background", "#f7f8fb");
        element.css("border", "6px solid #dfe3ed");
    } else {
        if (getParameterByName("prodotti") != null) {
            if (library_seleced_media.length >= 8) {
                alertSystem.notify("IL limite massimo di immagini sono 8", { alertType: defineNotifyType.warning });
                return;
            }
        }

        console.log("new color to media", mediaId);
        multipleImages.push(element);
        library_seleced_media.push(mediaId);
        element.css("background", "rgb(244, 223, 223)");
        element.css("border", "6px solid rgb(255, 20, 20)");
    }

    if (library_seleced_media.length > 0) {
        $("#library_delete_selected").show();
    } else {
        $("#library_delete_selected").hide();
    }
}
function selectUploadImage(method, itemdisplay) {
    let bodyName = "media";
    if (method == "single") {
        singleImage = true;
    } else {
        singleImage = false;
    }
    library_all_media = [];
    GET_userMedia(bodyName, display_MediaList);
    let preview = `
  <div id="main-content-${bodyName}">
  <div id="header-content-${bodyName}" style="border-bottom: 1px solid #6f6f6f;">
    <div class="content-tools" id="content-tools-${bodyName}">
    <div style="border-bottom: none; order: 1;" class="maincontent_header">
      
      <div  class="maincontent_buttons">
        <ul id="main-content-buttons-${bodyName}">
          <li>
            <a id='media_loadNew' onclick='addLibraryMedia()'>Carica nuova immagine</a>
          </li>
        </ul>
      </div>
    </div>

      <div style="order: 0;" class='searchbar_table'>
       <input id='searchinput_table_${bodyName}' onkeyup='searchJson("${bodyName}", this.value , "media")' type='text' placeholder='Cerca...'>
      <button><span  class="search-icon"></span></button>
    </div>
    
    </div>
    
  </div>
          <!--Elemento di caricamento-->
          <div id="loading-spinner-${bodyName}" class="loadingio-spinner-spinner-z8fn5y1gppi">
            <div class="ldio-c0onf6yfw5a">
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <!--Il contenuto dinamico-->
          <div id="loading-content-${bodyName}">
          
          </div>
          <div class="maincontent_header" style="border-bottom: 0">
            <div class="maincontent_buttons"><ul id="footer-content-buttons-${bodyName}"></ul></div>
          </div>
  </div>`;
    alertSystem.alert("Seleziona l'immagine", `${preview}`, {
        alertType: defineAlertType.yesno,
        alertSystemParam_Id: "alertTypeMedia",
        alertSystemParam_Width: "80%",
        alertSystemParam_Left: "10%",
        alertSystemParam_AcceptFunction: function () {
            validateAndUpload(multipleImages, itemdisplay);
            //addUploadImage();
        },
    });
}

/*function addUploadImage(fileIndex) {
  let concatenateFile = true;
  if(!fileIndex){
    fileIndex = 0;
    concatenateFile = false;
  }

  if(concatenateFile || $(`#prev_${fileIndex}`).length < 2) {
    $("#uploader__").html($("#uploader__").html() + `
    <div id="prev_${fileIndex}">
    <input id="getFile_${fileIndex}" style="display: none;" type="file" name="fileUpload[]" 
    onChange="validateAndUpload(this);" />
    </div>
  `)
  }
  
  $(`#getFile_${fileIndex}`).click();
  }
*/
class split_tableInPages {
    constructor(tableindex, data) {
        this.records_perPage = $(`#table_limit_${tableindex}`).val();
        localStorage.setItem(`table_limit_${tableindex}`, this.records_perPage);
        this.maxPage = Math.ceil(data.totalResult / this.records_perPage);
        this.tp = $(`#table_page_${tableindex}`);
        this.table_page = parseInt(this.tp.val());

        if (this.table_page > this.maxPage || this.table_page <= 0 || !$.isNumeric(this.table_page)) {
            this.tp.val(1);
            this.table_page = 1;
        }

        $(`#table_maxpag_${tableindex}`).html(this.maxPage);
    }
}

const text_splitter = (text, maxlenght) => {
    if (!text) {
        return "";
    }
    text = text.length > maxlenght ? text.substr(0, maxlenght) + "..." : text;
    return text;
};

const getParameterByName = (name, url) => {
    if (!url) url = "&" + atob(window.location.search.substr(1, window.location.search.length));
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[&]" + name + "(=([^&#]*)|&|#|$)");
    let results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const translator = (textRequest) => {
    return TRANSLATOR_MAP.has(textRequest) ? TRANSLATOR_MAP.get(textRequest) : textRequest;
};

const DateConvert_ITtoENG_toMiliseconds = (gg_mm_yyyy) => {
    if (!gg_mm_yyyy) {
        return null;
    }
    let day = gg_mm_yyyy.substr(0, gg_mm_yyyy.indexOf("/"));
    let month = gg_mm_yyyy.substr(gg_mm_yyyy.indexOf("/") + 1, 2);
    let year = gg_mm_yyyy.substr(gg_mm_yyyy.lastIndexOf("/") + 1, 4);
    let ENGdate = new Date();
    ENGdate.setFullYear(year, month - 1, day);
    return ENGdate.getTime();
};
const DateConvert_ENGtoIT_toGG_MM_YYYY = (miliseconds) => {
    if (!miliseconds) {
        return null;
    }
    miliseconds += 3600000; //ADD 1H For Rome TimeZone
    let date = new Date(miliseconds);

    return `${date.getDate().toString().length === 1 ? `0${date.getDate()}` : `${date.getDate()}`}/${
        (date.getMonth() + 1).toString().length === 1 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`
    }/${date.getFullYear()}`;
};

function localMoneyToIntCents(s) {
    return Number(String(s).replace(/[^0-9]+/g, ""));
}

function localStringToNumber(s) {
    let a = String(s).replace(/[^0-9,-]+/g, "");
    b = Number(String(a).replace(",", "."));
    return b;
}

function localStringToB(s) {
    let a;
    a = Number(String(s).replace(",", "."));
    if (!a && a != 0) {
        alertSystem.notify("Formato incoretto per il prezzo", { alertType: defineNotifyType.error });
        return 0;
    }
    if (a.toString().length > 9) {
        alertSystem.notify("Il prezzo supera il limite massimo", { alertType: defineNotifyType.error });
        return 0;
    }
    return a;
}

function valuateAs_priceOnFocus(input) {
    let value = input.value;
    input.value = value ? localStringToNumber(value) : "";
}

function valuateAs_priceOnBlur(input) {
    let value = input.value;
    input.value =
        value || value === 0
            ? new Intl.NumberFormat("it-IT", {
                  style: "currency",
                  currency: "EUR",
              }).format(localStringToB(value))
            : "";
}

/*
function valuateAs_price(input) {
    if (input.value.match(/\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?/) && /\d{1,4}(?:[.,]\d{3})*(?:[.,]\d{2})?/.exec(input.value)[0] === input.value) {
        input.style.border = "1px solid #ccc";
        input.style.boxShadow = "0px 1px 2px #eee inset";
    } else {
        input.style.border = "1px solid rgb(242, 110, 110)";
        input.style.boxShadow = "rgb(255, 195, 195) 0px 1px 2px inset";
    }
}*/

function valuateAs_integer(input) {
    console.log(input.value);
    input.value = input.value.replace(/[^\d]+/, "");
    input.value = input.value;
}

function goBackPage() {
    window.history.go(-1);
}

function priceValidation(price) {
    if (price || price === 0) {
        price = price.toString();
        return (price.length >= 3 ? price.substr(0, price.length - 2) + "," + price.substr(price.length - 2, 2) : price + ",00") + "&nbsp;&euro;";
    } else {
        return "Prezzo non disponibile";
    }
}
function undoZoomImage(el) {
    el.remove();
}
function zoomImage(el) {
    let src = $(el).children("img").attr("src");
    let zoomModal = `
    <div onclick="undoZoomImage(this)" style="cursor: pointer;position: fixed;top: 0;width: 100vw;height: 100vh;background: #0909093b;display: flex;">
        <div class="product_image_inside" style="border: 5px solid; border-color: #e1dfd4 #c1c1c1 #acacab; background: #f7f7f7;width: 50vw;height: 50vw;z-index: 18;max-width: 560px;max-height: 560px;min-width: 300px;min-height: 300px;margin: auto;">
            <div style="width: 100%; height: 100%; background-image: url(${src});background-size:contain;background-position:center;background-repeat:no-repeat;"></div>
        </div>
    <div>`;
    $("body").append(zoomModal);
}
function show_productinfo(data) {
    var controlpanel = $("#content");
    controlpanel.css("display", "flex");
    controlpanel.css("justify-content", "center");
    controlpanel.css("align-items", "center");
    controlpanel.css("height", "100vh");
    info = `<div style="border: solid 6px; border-color: #e0c849 #c4ac35 #dbc032;" class='product_main'>
            <div style="display: flex;flex-direction: row;flex-wrap: wrap;">
                <div  class='product_image_wrap'>
                    <div  class='product_image'>
                        <div class='product_image_inside' onclick="zoomImage(this)">
                            <img class="image_insideRelativeContainer" id='product_main_image' src='${
                                data.preview_media != null
                                    ? getArhivePath(
                                          `${
                                              data.item_media.filter((x) => {
                                                  return x.media_id == data.preview_media;
                                              })[0].media_owner
                                          }/${
                                              data.item_media.filter((x) => {
                                                  return x.media_id == data.preview_media;
                                              })[0].media_path
                                          }`
                                      )
                                    : data.item_media.length > 0
                                    ? getArhivePath(`${data.item_media[0].media_owner}/${data.item_media[0].media_path}`)
                                    : getArhivePath()
                            }'>
                        </div>
                     </div>
                </div>
            <div class='product_info'>
        <div style="background: #f7f7f7; border: 5px solid; border-color: #e1dfd4 #c1c1c1 #acacab;  display: flex;flex-direction: column;"><h1 style="border-bottom: 1px solid #ccc; padding: 4px 7px;">${
            data.item_name
        }</h1>
            <p style='max-height: 195px; min-height: 125px; overflow-y: auto; padding: 0px 7px;'>${translator(data.item_description)}</p>
            <div style="margin: 0 5px;" class='product_info_availability'>
                <span style="display: none;" id="product_info_price">${priceValidation(data.unit_price)}${
        data.shipment_included
            ? "&nbsp;<span style='text-decoration: underline;'>SPEDIZIONE A PARTE</span>"
            : "&nbsp;<span style='text-decoration: underline;'>SPEDIZIONE GRATIS</span>"
    }</span>
                <p>${data.quantity > 0 ? "<span style='color: forestgreen;'>Disponibile</span>" : "<span style='color: red;'>Non disponibile</span>"}</p>
            </div>
        </div><div class='store_products_buttons'>
        <button style='background-color: #ff4747;'>Aquista</button>
        <button style='background-color: #47a9ff;'>Prenota</button>
        </div>
        </div></div>`;

    if (data.item_media.length > 1) {
        info += `<div class='product_image_view'><ul>`;

        for (let product_image = 0; product_image < data.item_media.length; product_image++) {
            var image_item = getArhivePath(`${data.item_media[product_image].media_owner}/${data.item_media[product_image].media_path}`);
            var product_image_itemid = "product_image_item_" + product_image;
            info += `<li>
                <div onclick="replace_mainproduct_image('${product_image_itemid}','${image_item}')"  class='product_image_view_item'>
                    <img class="image_insideRelativeContainer" id='${product_image_itemid}' 
                    src='${image_item}' > 
                </div>
                </li>`;
        }

        info += `</ul></div>`;
    }

    controlpanel.html(info);
    if (data.unit_price) {
        $("#product_info_price").show();
    }
    $("#" + activeImageItem).addClass("product_image_view_item_active");
}

function replace_mainproduct_image(id, image_src) {
    $("#" + activeImageItem).removeClass("product_image_view_item_active");
    activeImageItem = id;
    $("#" + id).addClass("product_image_view_item_active");
    $("#product_main_image").attr("src", image_src);
}
function _display_usersLoginList(result, selected) {
    users = result;
    $.each(result, function (i, item) {
        $("#store_owner").append(
            $(`<option ${selected == item.usr_id ? "selected" : ""}>`)
                .val(item.usr_id)
                .text(item.usr_username)
        );
    });
}
function _display_storesCategoriesList(result) {
    $.each(result, function (i, item) {
        store_categories.push(item);
    });
}

var selectedTheme = {};
var store_categories = [];

function confirmTheme() {
    //selectedTheme
    let storeThemePreview = $("#store_theme_preview");
    let storeThemePreviewPath = undefined;
    let storeThemeId = undefined;
    for (let t = 0; t < memoryJson.length; t++) {
        if (memoryJson[t].themeName === selectedTheme.name) {
            storeThemeId = memoryJson[t].themeId;
            storeThemePreviewPath = memoryJson[t].themePreviewImage;
            break;
        }
    }
    storeThemePreview.find("img").attr("src", getThemePath(`${storeThemeId}/${storeThemePreviewPath}`));
    $("#store_theme_name").html(`<span style="font-weight: 700;">L'impaginazione selezionata:</span> ${selectedTheme.name}`);

    storeThemePreview.show();
}

function selectTheme(e) {
    let themesCount = document.getElementsByName("themeDisplay").length;

    for (let t = 0; t < themesCount; t++) {
        $(`#theme_${t}`).removeClass("storeForm_themeActive");
    }

    let themeId = e.firstChild.id;
    $(`#${themeId}`).addClass("storeForm_themeActive");
    let theme_originalid = $(`#${themeId}`).attr("data-themeid");
    selectedTheme = { name: e.firstChild.lastChild.textContent, id: theme_originalid };
}

const get_themes = (depth) => {
    let content = "<div class='storeForm_theme'><div>";
    for (let y = 0; y < memoryJson.length; y++) {
        if (memoryJson[y].depth == depth) {
            content +=
                `<div style="max-width: 370px;" name='themeDisplay' onclick='selectTheme(this)' ><div data-themeid="${memoryJson[y].themeId}"  id='theme_` +
                memoryJson[y].themeId +
                "'>L'impaginazione: <span>" +
                memoryJson[y].themeName +
                "</span></div><img style='width: 100%' src='" +
                getThemePath(`${memoryJson[y].themeId}/${memoryJson[y].themePreviewImage}`) +
                "'></div>";
        }
    }
    content += "</div></div>";
    return content;
};

function getDocHeight() {
    var D = document;
    return Math.max(D.body.scrollHeight, D.documentElement.scrollHeight, D.body.offsetHeight, D.documentElement.offsetHeight, D.body.clientHeight, D.documentElement.clientHeight);
}

function session_logout() {
    User.user_temp_location = window.location;
    logout();
}
function forced_logout() {
    User.user_temp_location = false;
    User.user_name = false;
    logout();
}
function logout() {
    User.usr_token = false;
    User.user_role = false;
    User.user_id = false;
    askBeforeReload = false;
    window.location.href = "login.html";
}
function cookieRights(accepted) {
    if (accepted === true) {
    }
}
function scroll_manage_check() {
    var w = window.innerHeight;
    var h = document.documentElement.scrollHeight;

    if (h > w) {
        $("#scroll_down").show();
        $("#scroll_up").show();
    }
}
function scroll_manage() {
    $("#scroll_down").on("click", function () {
        $(window).scrollTop($(window).scrollTop() + $(window).height() - 220);
    });
    $("#scroll_up").on("click", function () {
        $(window).scrollTop($(window).scrollTop() - $(window).height() + 220);
    });
}
function display_tuttocitta_ads(data) {
    let info = `<img style="-webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; max-width: 100%;
    max-height: 100%;
    display: block;
    margin: auto;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: auto;
    height: auto;
    position: absolute;" src="${getArhivePath(`${data.item_media.media_owner}/${data.item_media.media_path}`)}" /> `;
    $("#tuttocitta_ads_show").unbind();
    $("#tuttocitta_ads_show").on("click", () => {
        window.location.href = `?${btoa(`store=${getParameterByName("store")}&product=${data.item_id}`)}`;
    });
    $("#tuttocitta_ads_show").html(info);
}
const User = {
    set usr_token(user_token) {
        if (!user_token) {
            console.error("Token deleted!");
            document.cookie = `${appConfig.clientConfig.token_key}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
        } else {
            var tokenExpire = new Date();
            tokenExpire.setTime(tokenExpire.getTime() + parseInt(appConfig.clientConfig.token_expire) * 60 * 1000);
            document.cookie = `${appConfig.clientConfig.token_key}=${user_token}; expires=${tokenExpire}; Secure`;
            //$.cookie(appConfig.clientConfig.token_key, user_token, { expires: tokenExpire });
        }
    },
    set user_name(user_name) {
        if (!user_name) {
            localStorage.removeItem(appConfig.clientConfig.username_key);
        } else {
            localStorage.setItem(appConfig.clientConfig.username_key, user_name);
        }
    },
    get user_name() {
        return localStorage.getItem(appConfig.clientConfig.username_key);
    },
    set user_role(user_role) {
        if (!user_role) {
            localStorage.removeItem(appConfig.clientConfig.role_key);
        } else {
            localStorage.setItem(appConfig.clientConfig.role_key, user_role);
        }
    },
    set user_id(user_id) {
        if (user_id === null || user_id === undefined || user_id === false) {
            localStorage.removeItem(appConfig.clientConfig.id_key);
        } else {
            localStorage.setItem(appConfig.clientConfig.id_key, user_id);
        }
    },
    get user_id() {
        return localStorage.getItem(appConfig.clientConfig.id_key);
    },
    get user_role() {
        return localStorage.getItem(appConfig.clientConfig.role_key);
    },

    set user_temp_location(lastPage) {
        console.log("last");
        if (!lastPage) {
            document.cookie = `${appConfig.clientConfig.temp_location}= ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
            //$.removeCookie(appConfig.clientConfig.temp_location);
        } else {
            createCookie(appConfig.clientConfig.temp_location, lastPage, 1);
            //$.cookie(appConfig.clientConfig.temp_location, lastPage, { expires: 1 });
        }
    },
    get user_temp_location() {
        return accessCookie(appConfig.clientConfig.temp_location);
        //return $.cookie(appConfig.clientConfig.temp_location);
    },

    set usr_cookieRights(accepted) {
        createCookie(appConfig.clientConfig.cookieRights, accepted, 365);
        //$.cookie(appConfig.clientConfig.cookieRights, true);
    },
    get usr_cookieRights() {
        return accessCookie(appConfig.clientConfig.cookieRights);
    },
};
function createCookie(cookieName, cookieValue, daysToExpire) {
    var date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    document.cookie = cookieName + "=" + cookieValue + "; expires=" + date.toGMTString();
}
function accessCookie(cookieName) {
    var name = cookieName + "=";
    var allCookieArray = document.cookie.split(";");
    for (var i = 0; i < allCookieArray.length; i++) {
        var temp = allCookieArray[i].trim();
        if (temp.indexOf(name) == 0) return temp.substring(name.length, temp.length);
    }
    return undefined;
}
function reloadWithAsk() {
    askBeforeReload = true;
    location.reload();
}
function reloadWithoutAsk() {
    askBeforeReload = false;
    location.reload();
}
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a,
            b,
            i,
            val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) {
            //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = x.length - 1;
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}

function getResponseError(jqXHR, exception, errorThrown) {
    hideCaricamentoInCorsoGIF();
    let error_message = `Errore : ${jqXHR.status.toString()}`;
    if (jqXHR.status === 401) {
        error_message = "Si &egrave; verificato un errore durante l'accesso";
        if (jqXHR.responseText.includes("Authentication Failed")) {
            User.usr_token = null;
        }
        checkTokenValidity();
    } else if (jqXHR.status >= 400 && jqXHR.status < 500) {
        error_message = "Il server non &egrave; stato in grado di elaborare (comprendere) la richiesta inviata";
    } else if (jqXHR.status >= 500) {
        error_message = "&Egrave; stato impossibile elaborare la richiesta inviata dal browser per un motivo non identificabile";
    } else if (jqXHR.status === 0) {
        return;
    }
    ThrowException(error_message);
}
//Define default params
var col_num = 1;
var isFirstBanner = false;
var stores_order = [];

function display_homePage(result, preview) {
    let cur_col_num = 0;

    let html_stores = `<table style="max-width: 950px; margin: auto; border-spacing: 7px;"><tbody>`;
    for (let index_result = 0; index_result < result.length; index_result++) {
        //let store_data = stores_order.length < index_result ? result.filter(function (s) {
        //     return s.store_id == stores_order[index_result];
        // }) : result
        store_data = result[index_result];
        console.log(preview);
        let storeId = store_data.store_id;
        let storageId = store_data.storage.length > 0 ? store_data.storage[0].storage_id : undefined;
        let storename = store_data.store_name;
        if (cur_col_num == 0) {
            html_stores += `<tr>`;
        }
        html_stores += `<td ${
            index_result == 0 && isFirstBanner ? `colspan="${col_num}"` : `style="${preview ? "cursor: default;" : ""} position: relative; width: ${100 / col_num}%"`
        } ${
            preview ? "" : ` onclick="window.location.href='store.html?${btoa(`store=${storeId}${storageId != undefined ? "&storage=" + storageId : ""}&page=1&per_page=20`)}'" `
        } data-storeid="${storeId}" style="${preview ? "cursor: default;" : ""} overflow: hidden;" class="store_banner storeWithoutImage">
          <img loading="lazy" ${
              (index_result != 0 && isFirstBanner) || !isFirstBanner ? `style="max-width: ${950 / col_num - 7 * col_num}px; ${col_num > 1 ? "max-height: 100px;" : ""}"` : ""
          } id='st_${storeId}'- ${
            store_data.media
                ? `src="${appConfig.serverConfig.fileServer.serverLocation}${appConfig.serverConfig.fileServer.arhivePrefix}${store_data.media.media_owner}/${store_data.media.media_path}"`
                : ""
        }/>
          <div id='sn_${storeId}' style="display: none; width: 100%; position: absolute; ">
            <h1 style="font-size: 40px; margin: auto;position: absolute;line-height: 100px;left: 50%;bottom: 0;">${storename}</h1>
          </div>
          </td>`;
        cur_col_num++;
        if (cur_col_num == col_num || (isFirstBanner && index_result == 0)) {
            html_stores += "</tr>";
            cur_col_num = 0;
        }
    }
    html_stores += "</tbody></table>";
    //Verifica ogni immagine di ogni negozio per la dimensione
    $("#store")
        .append(html_stores)
        .ready(function () {
            for (let index_result = 0; index_result < result.length; index_result++) {
                let store_data = result.filter(function (s) {
                    return s.store_id == stores_order[index_result];
                });
                let storeId = store_data.store_id;
                $(`#st_${storeId}`)
                    .one("load", function () {
                        if ($(this).width() < 600 / col_num) {
                            $(this).css("margin", "0");
                            $(`#sn_${storeId}`).show();
                            $(`#sn_${storeId}`).css("display", "flex");
                        }
                        scroll_manage_check();
                    })
                    .each(function () {
                        if (this.complete) {
                            $(this).trigger("load");
                        }
                    });
            }
        });
}

function location_home() {
    window.location.href = "/";
}
