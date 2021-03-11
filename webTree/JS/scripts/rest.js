var $message_badcredential;

//-----FUNZIONI REST-----

function get_storeThemesListData(bodyName, callback) {
    $.ajax({
        url: `${appConfig.serverConfig.restServer}themes`,
        contentType: "application/json; charset=utf-8",
        type: "GET",
        success: function (result, status, request) {
            if (callback) {
                callback(bodyName, result);
            } else {
                memoryJson = result;
            }
        },
        error: function (jqXHR, exception, errorThrown) {
            if (jqXHR.status === 401) {
                checkTokenValidity();
            }
            if (jqXHR.status >= 400) {
                ThrowException(`${exception} : ${jqXHR.status.toString()}`);
            }
        },
    });
}

function get_storeCategoriesList(displayFunction) {
    $.ajax({
        url: `${appConfig.serverConfig.restServer}stores/categories`,
        contentType: "application/json; charset=utf-8",
        type: "GET",
        success: function (result, status, request) {
            displayFunction(result);
        },
        error: function (jqXHR, exception, errorThrown) {
            if (jqXHR.status === 401) {
                checkTokenValidity();
            }
            if (jqXHR.status >= 400) {
                ThrowException(`${exception} : ${jqXHR.status.toString()}`);
            }
        },
    });
}
/*
function fff(dataStoreId, storeName, append) {
  let banner = $(`[data-storeid=${dataStoreId}]`);
  banner.addClass("storeWithoutImage");

  if(!append){
    //banner.find("img").remove();
  } else {
    banner.find("img").css("float","left");
  }
  

  let content = document.createElement("h1");
  content.setAttribute("style","float:right;");
  content.innerHTML = storeName;
  banner.append(content);
}*/
function get_store(callback) {
    if (!local) {
        $.ajax({
            url: `${appConfig.serverConfig.restServer}stores?cA=${User.usr_cookieRights === "ac" ? "ac" : "na"}`,
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            type: "GET",
            success: function (result) {
                if (callback != "preview") {
                    col_num = parseInt(result.hs.cn);
                    isFirstBanner = result.hs.ifb == "true" ? true : false;
                    let a = result.stores.filter(function (q) {
                        return q.place_exipre > new Date().getTime();
                    });
                    stores_order = [1];
                }
                store_result = result.stores;

                if (callback === "first_preview" || callback === "preview") {
                    display_homePage(store_result, true);
                } else {
                    display_homePage(store_result);
                }

                if (callback === "first_preview") {
                    $("#homeSet_col_num").val(col_num);
                    $("#homeSet_col_num").show();
                    $("#homeSet_isFirstBanner").prop("checked", isFirstBanner);
                    $("#homeSet_isFirstBanner").show();
                    let s_order_info;
                    for (let s_order_inx = 0; s_order_inx < stores_order.length; s_order_inx++) {
                        s_order_info += `
                        <tr>
                            <td>${s_order_inx == 4311 ? "" : `<img style="max-height: 50px;" src="../Img/go_up.gif"/>`}<img style="max-height: 50px;" src="../Img/go_down.gif"/><td>
                            <td><td>
                            <td><td>
                        </tr>`;
                    }
                    $("#home_oderstore_table > thead").append(s_order_info);
                }
            },
            error: function (jqXHR, exception, a) {
                console.error(`${exception} : ${jqXHR.status}`);
            },
        });
    } else {
        var result = $.getJSON("items_content.json")
            .done(function () {
                result = result.responseJSON.stores;
                let html_stores = "";
                for (let index_result = 0; index_result < result.length; index_result++) {
                    let storeId = result[index_result].store_id;
                    let storageId = result[index_result].storage.length > 0 ? result[index_result].storage[0].storage_id : undefined;
                    let storename = result[index_result].store_name;
                    html_stores += `<div onclick="window.location.href='store.html?${btoa(
                        `store=${storeId}${storageId != undefined ? "&storage=" + storageId : ""}&page=1&per_page=20`
                    )}'" data-storeid="${storeId}" style="display:flex;overflow: hidden;" class="store_banner storeWithoutImage">
          <img loading="lazy" id='st_${storeId}' ${
                        result[index_result].media
                            ? `src="${appConfig.serverConfig.fileServer.serverLocation}${appConfig.serverConfig.fileServer.arhivePrefix}${result[index_result].media.media_owner}/${result[index_result].media.media_path}"`
                            : ""
                    }/>
          <div id='sn_${storeId}' style="display: none; width: 100%;">
            <h1 style="font-size: 6ch; margin: auto;">${storename}</h1>
          </div>
          </div>`;
                }

                $("#store")
                    .append(html_stores)
                    .ready(function () {
                        for (let index_result = 0; index_result < result.length; index_result++) {
                            let storeId = result[index_result].store_id;

                            $(`#st_${storeId}`)
                                .one("load", function () {
                                    if ($(this).width() < 600) {
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
                        if (callback) {
                            callback();
                        }
                    });
            })
            .fail(function () {
                console.log("error");
            })
            .always(function () {
                console.log("Completato");
            });
    }
}

//Ritorna un prodotto casuale per far vedere nel tuttocitta
function get_RandomItemTCt_rand(callback) {
    //if (!local) {
    $.ajax({
        url: `${appConfig.serverConfig.restServer}stores/tuttocittaads`,
        contentType: "application/json; charset=utf-8",
        type: "GET",
        dataType: "json",
        success: function (result) {
            if (callback) {
                callback(result);
            }
        },
        error: function (jqXHR, exception, a) {
            if (jqXHR.status >= 400) {
                console.error("Errore: x5313");
            }
        },
    });
}
//}

function get_storeproducts(storeid, callback) {
    if (!local) {
        $.ajax({
            url: `${appConfig.serverConfig.restServer}stores/${storeid}/products`,
            contentType: "application/json; charset=utf-8",
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (callback) {
                    callback(result);
                }
            },
            error: function (jqXHR, exception, a) {
                //$("#loading-spinner").hide();
                if (jqXHR.status >= 400) {
                    //alertify.alert('Sessione scaduta', 'Effettua nuovamente il login', function(){ logout(); });
                }
            },
        });
    } else {
        var result = $.getJSON("items_content.json", function () {
            console.log("success");
        })
            .done(function () {
                console.log("success", result);
                if (callback) {
                    callback(result);
                }
            })
            .fail(function () {
                console.log("error");
            })
            .always(function () {
                console.log("complete");
            });
    }
}

function get_storageproducts(storeId, storageId, page, per_page, callback) {
    if (!local) {
        $.ajax({
            url: `${appConfig.serverConfig.restServer}stores/${storeId}/storage/${storageId}/products?page=${page}&per_page=${per_page}`,
            contentType: "application/json; charset=utf-8",
            type: "GET",
            dataType: "json",
            success: function (result) {
                if (callback) {
                    callback(result);
                }
            },
            error: function (jqXHR, exception, a) {
                //$("#loading-spinner").hide();
                if (jqXHR.status >= 400) {
                    //alertify.alert('Sessione scaduta', 'Effettua nuovamente il login', function(){ logout(); });
                }
            },
        });
    } else {
        var result = $.getJSON("items_content.json")
            .done(function () {
                result = result.responseJSON;

                let storeRes = result.stores.filter(function (e) {
                    return e.store_id == storeId;
                });
                storeRes = storeRes[0];
                let totalResult = storeRes.storage.filter(function (t) {
                    return t.storage_id == storageId;
                });

                totalResult = totalResult[0];
                totalResult = totalResult.product.length;

                let dataRes = storeRes;
                let localResult = { totalResult: totalResult, data: dataRes };

                if (callback) {
                    callback(localResult);
                }
            })
            .fail(function () {
                console.log("error");
            })
            .always(function () {
                console.log("Completato");
            });
    }
}

function get_storeinfo(storeId) {
    $.ajax({
        url: `${appConfig.serverConfig.restServer}stores/${storeId}`,
        contentType: "application/json; charset=utf-8",
        type: "GET",
        success: function (result, status, request) {
            //$("#loading-spinner").hide();
            //setJwtToken(request.getResponseHeader('id_token'));
            //memoryJson = result;
            SetTheme(result.theme.themeId, result.theme.themeName);
            let headerCnt = $("#header_content");
            headerCnt.children("img").attr("src", getImagePath(result.store_id, result.banner_link));
        },
        error: function (jqXHR, exception, a) {
            //$("#loading-spinner").hide();
            if (jqXHR.status >= 400) {
                //alertify.alert('Sessione scaduta', 'Effettua nuovamente il login', function(){ logout(); });
            }
        },
    });
}

function get_storeproductinfo(productId) {
    $.ajax({
        url: `${appConfig.serverConfig.restServer}stores/products/${productId}`,
        contentType: "application/json; charset=utf-8",
        type: "GET",
        success: function (result, status, request) {
            //$("#loading-spinner").hide();
            //setJwtToken(request.getResponseHeader('id_token'));
            show_productinfo(result);
        },
        error: function (jqXHR, exception, a) {
            //$("#loading-spinner").hide();
            if (jqXHR.status >= 400) {
                //alertify.alert('Sessione scaduta', 'Effettua nuovamente il login', function(){ logout(); });
            }
        },
    });
}

//manda i dati del form al server per effetuare il login
function post_loginData(loginData) {
    $.ajax({
        url: appConfig.serverConfig.restServer + "login",
        data: JSON.stringify(loginData),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        type: "POST",
        success: function (result, textStatus, jqXHR) {
            let lastUsername = User.user_name;
            User.user_name = result.username;
            User.user_role = result.role;
            User.usr_token = result.token;
            User.user_id = result.id;
            if (User.user_role === "ROLE_USER") {
                window.location.href =
                    lastUsername === loginData.usr_username && accessCookie(appConfig.clientConfig.temp_location)
                        ? accessCookie(appConfig.clientConfig.temp_location)
                        : "user-controlpanel.html";
            } else if (User.user_role === "ROLE_ADMIN") {
                window.location.href =
                    lastUsername === loginData.usr_username && accessCookie(appConfig.clientConfig.temp_location)
                        ? accessCookie(appConfig.clientConfig.temp_location)
                        : "admin-controlpanel.html";
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            $("#send_text").show();
            $("#loader").hide();
            waitforresponse = false;

            if (jqXHR.status === 401) {
                $message_badcredential.html("*Nome utente o password errata");
                $message_badcredential.show();
            }
            if (jqXHR.status === 403) {
                $message_badcredential.html("*Questo utente &eacute; stato bloccato");
                $message_badcredential.show();
            }
        },
    });
}

function get_NotificationsListData(callback, param) {
    $.ajax({
        url: `${appConfig.serverConfig.restServer}notifications/all?page=${param.page}&per_page=${param.per_page}`,
        contentType: "application/json; charset=utf-8",
        headers: AuthorizationTokenHeader(),
        type: "GET",
        success: function (result, status, request) {
            User.usr_token = request.getResponseHeader("id_token");
            callback.output(callback.body, result);
        },
        error: function (jqXHR, exception, errorThrown) {
            getResponseError(jqXHR, exception, errorThrown);
        },
    });
}
