const local = window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1" ? true : false;
//localStorage.username == "1centurami594" ? "http://localhost:8080/materialeinvendita/" :
const appConfig = {
    serverConfig: {
        restServer: "https://tuttocitta.data-smart.it:8443/materialeinvendita/",
        fileServer: {
            serverLocation: "/fileStorage",
            arhivePrefix: "/archive/",
            themesPrefix: "/themes/",
        },
    },
    clientConfig: {
        token_key: "token",
        token_expire: "60",
        username_key: "username",
        role_key: "user_role",
        id_key: "user_id",
        temp_location: "last_page",
        cookieRights: "cookieAccepted",
    },
};

const TRANSLATOR_MAP = new Map([
    ["", "-"],
    [null, "-"],
    [true, "Si"],
    [false, "No"],
    ["account_false", "Blocca"],
    ["account_true", "Sblocca"],
    ["access_false", "<span style='color: forestgreen'>Garantito</span>"],
    ["access_true", "<span style='color: red'>Negato</span>"],
    ["store_false", "<span style='color: red'>Chiuso</span>"],
    ["store_true", "<span style='color: forestgreen'>Aperto</span>"],
    ["product_false", "<span style='color: #3033ff'>Non disponibile</span>"],
    ["product_true", "<span style='color: forestgreen'>Disponibile</span>"],
    ["confirm_false", "<span style='color: red'>No</span>"],
    ["confirm_true", "<span style='color: forestgreen'>Si</span>"],
    ["ROLE_0", "Utente"],
    ["ROLE_1", "Moderatore"],
    ["ROLE_2", "Amministratore"],
    ["DETRANSLATE_Utente", 0],
    ["DETRANSLATE_Moderatore", 1],
    ["DETRANSLATE_Amministratore", 2],
    ["STORE_DEPTH_0", "Prodotti sulla prima pagina"],
    ["STORE_DEPTH_1", "Prodotti nelle categorie"],
    ["sped_true", "<span style='color: #ff8f00'>A PARTE</span>"],
    ["sped_false", "<span style='color: #00abff'>GRATIS</span>"],
]);

function PAGE_SWICH_000(index) {
    let mp = localStorage.getItem(`table_limit_${index}`);
    return `<div class="manage_table">
    <div class="selectmenu-perpage_value">
    <select name="table_limit_${index}" id="table_limit_${index}">
    <option ${mp == 10 ? "selected" : ""} value="10">10</option>
    <option ${mp == 20 ? "selected" : ""} value="20">20</option>
    <option ${mp == 50 ? "selected" : ""} value="50">50</option>
    <option ${mp == 100 ? "selected" : ""} value="100">100</option>
    </select>
    </div>
    <div class="selectmenu_value">
    <label style="margin-right: 20px;">per pagina</label>
    <a id="tablePrevPage_${index}"><span class="leftarrow-icon selectmenu_icon"></span></a>
    <input id="table_page_${index}" type="text" value='1'>
    <label>su <span id="table_maxpag_${index}"></span></label>
    <a id="tableNextPage_${index}"><span class="rightarrow-icon selectmenu_icon"></span></a>
    </div>
    </div>`;
}

function SEARCH_BAR_000(index, offlineSearch) {
    return `<div class='searchbar_table'>
  <input id='searchinput_table_${index}' onkeyup='searchJson("${index}", this.value ${offlineSearch ? `, "${offlineSearch}"` : ""})' type='text' placeholder='Cerca...'>
  </div>`;
}
