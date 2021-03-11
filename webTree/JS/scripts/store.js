var StoreContent;
//Salva l'id del tema scelto per lo storage per metterlo davanti alla classe t1_nomeclasse, t2_nomeclasse, ...
var storage_theme_id;

function pageload() {
    try {
        if (getParameterByName("store") != null) {
            if (getParameterByName("store") == "") {
                location_home();
            } else {
                if (getParameterByName("storage") != null && getParameterByName("storage") != "") {
                    if (getParameterByName("product") != null && getParameterByName("product") != "") {
                        showproduct(getParameterByName("product"));
                    } else {
                        showstorage(getParameterByName("storage"));
                    }
                } else if (getParameterByName("product") != null) {
                    if (getParameterByName("product") != "") {
                        $("#footer_content").css("display", "none");
                        $("#go_back1").css("display", "none");
                        $("#go_back3").css("display", "none");
                        $("#index_search_").css("display", "none");
                        showproduct(getParameterByName("product"));
                    } else {
                        location_home();
                    }
                } else {
                    showstore(getParameterByName("store"));
                }
            }
        } else if (window.location.pathname == "/store") {
            location_home();
        }
    } catch (e){
        location_home();
    }

    //$("#loading-spinner").hide();
}

$(function () {
    StoreContent = $("#content");
    checkCookiesRights();
    pageload();
});

function checkCookiesRights() {
    if (User.usr_cookieRights != "ac") {
        let cookieRights = $(`
    <div class='cookieRights' id='cookieRights'>
      <div>
        <div>
          <h2>Informativa Cookies<h2/>
        </div>
        <div>
          <p>Per migliorare la navigazione su questo sito vengono utilizzati i cookies ed altre tecnologie che ci permettono di riconoscerti. Cliccando su "Accetta e chiudi" acconsenti all'uso dei cookies.</p>
        </div>
        <div>
          <div id='cookieAccept'><p>Accetta e chiudi</p></div>
        </div>
      </div>
    </div>`);
        $("body").append(cookieRights);
        $("#cookieAccept").on("click", () => {
            User.usr_cookieRights = "ac";
            $("#cookieRights").remove();
        });
    }
}

function showstore(storeid) {
    get_storeproducts(storeid, show_storeproducts, islocal);
}
function showstorage(storageid) {
    let page = getParameterByName("page") != undefined ? getParameterByName("page") : 1;
    let per_page = getParameterByName("per_page") != undefined ? getParameterByName("per_page") : 20;
    let storeId = getParameterByName("store");
    get_storageproducts(storeId, storageid, page, per_page, show_storeproducts);
}

function show_storeproducts(data) {
    try {
        let totalResult = data.totalResult;
        if (data.data) {
            data = data.data;
        }

        //$("#store_image").attr("src", getImagePath(data.store_id, data.banner_link))
        let info = "";
      
        if (data.store_depth == 0 || (getParameterByName("storage") != "" && getParameterByName("storage") != null && getParameterByName("products") == null)) {
            //! THEME SetTheme(data.storage[0].theme.themeId);
            storage_theme_id = data.storage[0].theme.themeId;
            if(data.store_depth == 0){
                $("#page_title").html(data.store_name);
            } else {
                $("#page_title").html(data.storage[0].storage_name);
            }
            
            let maxPage = Math.ceil(totalResult / parseInt(getParameterByName("per_page")));
            if (getParameterByName("page") == maxPage) {
                $("#go_back1").hide();
            } else {
                $("#go_back1").on("click", function () {
                    window.location.href = `?${btoa(
                        `store=${getParameterByName("store")}&storage=${getParameterByName("storage")}&page=${
                            parseInt(getParameterByName("page")) + 1
                        }&per_page=${getParameterByName("per_page")}`
                    )}`;
                });
            }

            $("#go_back2").on("click", function () {
                if (getParameterByName("page") == 1) {
                    location_home();
                }

                //window.location.href = `?${btoa(
                //    `store=${getParameterByName("store")}&storage=${getParameterByName("storage")}`
                //)}`;
            });

            $("#go_back3").on("click", function (e) {
                e.preventDefault();
                if (getParameterByName("page") == 1) {
                    location_home();
                }

                //window.location.href = `?${btoa(
                //    `store=${getParameterByName("store")}&storage=${getParameterByName("storage")}`)}`;
            });

            info = `<div id="store_products"><ul class='t${storage_theme_id}_store_prducts_list'>`;
            //<a href="store.html?${btoa(`store=${data.store_id}&product=${data.storage[0].product[p].product_id}`)}">
            for (let p = 0; p < data.storage[0].product.length; p++) {
                info += `<li>
      <div id="product">
      <div onclick="window.location.href='store.html?${btoa(
          `store=${data.store_id}&storage=${data.storage[0].storage_id}&product=${data.storage[0].product[p].product_id}`
      )}'" class="t${storage_theme_id}_store_products_image">
      
      <img class="image_insideRelativeContainer" src="${
          data.storage[0].product[p].item_media.length > 0
              ? getArhivePath(`${data.storage[0].product[p].item_media[0].media_owner}/${data.storage[0].product[p].item_media[0].media_path}`)
              : getArhivePath()
      }" /> </div>
      
      <div class='t${storage_theme_id}_store_products_info'><a href='store.html?${btoa(
                    `store=${data.store_id}&storage=${data.storage[0].storage_id}&product=${data.storage[0].product[p].product_id}`
                )}'>${data.storage[0].product[p].item_name}</a>
      <p>${text_splitter(translator(data.storage[0].product[p].item_description), 240, 2)}</p>
      ${data.storage[0].product[p].unit_price ? `<h6>${priceValidation(data.storage[0].product[p].unit_price)}</h6>` : ""}
      </div></div></li>`;
            }
            info += `</ul></div>`;
        } else if (data.store_depth == 1) {
            //! THEME SetTheme(data.theme.themeId);
            storage_theme_id = data.theme.themeId;
            $("#page_title").html(data.store_name);
            info = `<div id="store_storages">
            <ul class='t${storage_theme_id}_store_storage_list'>`;
            for (let s = 0; s < data.storage.length; s++) {
                if (data.storage[s].store_ref == 81 && s == 3) {
                    info += `
                <li>
                    <div style="margin-top: 62px;" id="tuttocitta_ads">
                      <div style="position: relative; cursor: pointer;" id="tuttocitta_ads_show" class="t${storage_theme_id}_store_products_image">
                            <img class="image_insideRelativeContainer" src="${"Img/tuttocitta_ads.jpg"}" /> 
                      </div>
                    </div>
                </li>`;
                    get_RandomItemTCt_rand(display_tuttocitta_ads);
                    setInterval(function () {
                        get_RandomItemTCt_rand(display_tuttocitta_ads);
                    }, 5000);
                }

                info += `<li>
      <div id="product">
      <div class="t${storage_theme_id}_store_storage_itemname"><h3>${data.storage[s].storage_name}</h3></div>
      <a href="store.html?${btoa(`store=${data.store_id}&storage=${data.storage[s].storage_id}`)}">
      <div class="t${storage_theme_id}_store_products_image">
      
      <img class="image_insideRelativeContainer" src="${
          data.storage[s].storage_media ? getArhivePath(`${data.storage[s].storage_media.media_owner}/${data.storage[s].storage_media.media_path}`) : "Img/no_image.svg"
      }" /> 
      </div></a>
      </div></li>`;
            }
            info += `</ul></div>`;
        }
        StoreContent.html(info);
        setTimeout(() => {
            calcHeight();
        }, 500);
    } catch (err) {
        console.error(err);
        location_home();
    }
}

function f_getStoreMain(storeId) {
    get_storeinfo(storeId);
}

function showproduct(productid) {
    get_storeproductinfo(productid);
}

function calcHeight() {
    scroll_manage();
}
