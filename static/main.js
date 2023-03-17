var globalIndex = 1;
var hashList = {};
var hashListAnime = {};



SERVER = "http://"+window.location.hostname+":8090";
SERVER2 = "http://"+window.location.host;


function startPlayer(m3u, name,hash,playlist=null,ids=null) {
    $('.plyr__controls__item.plyr__control').attr('href', m3u);
    $.ajax({
        url: SERVER2 + '/player',
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            action: "play",
            "m3u": m3u,
            "name": name,
            "playlist":playlist,
            "ids":ids,
            "hash":hash
        }),
        complete: function(data) {
            console.log(data);
        }
    });
    //-player info
}

function setSlider(val, video) {
    if (video) {
        $("input#plyr-seek-7469").val(val);
        $("input#plyr-seek-7469").css({
            "--value": val + "%"
        });
    } else {
        $("input#plyr-volume-7469").val(val);
        $("input#plyr-volume-7469").css({
            "--value": val + "%"
        });
    }
}

function uploadData(fd) {
    $.ajax({
        url: SERVER + '/torrent/upload',
        method: 'post',
        contentType: false,
        processData: false,
        data: fd,
        success: function(data) {
            console.log(data);
        }
    });
}

function addAnime(ids){
    anime = hashListAnime[ids];
    console.log("https://"+anime.player.host + anime.player.playlist[1].hls.hd);
    console.log(ids);

    $('#livesearch').html('');
    $("#my-input-anime").val('');
    
    //startPlayer("https://"+anime.player.host + anime.player.playlist[1].hls.hd, anime.names.ru);



    $("#series").html('');
//console.log("len: "+ Object.keys(anime.player.playlist).length);
            if (Object.keys(anime.player.playlist).length > 1) {
                $(".btn-prew").removeAttr("disabled");
                $(".btn-next").removeAttr("disabled");

                $.each(anime.player.playlist, function(key, item) {
                    //path = "https://"+anime.player.host + (item.hls["fhd"] ? item.hls["fhd"]: (item.hls["hd"] ? item.hls["hd"]: item.hls["sd"]))
                    path = "https://"+anime.player.host + (item.hls["hd"] ? item.hls["hd"]: item.hls["sd"])

                    $(`<button id="SeriesId` + item.serie + `" cleanName="` + anime.names.ru +" "+ item.serie + `" data-path="` + encodeURI(path) + `" id_="` + item.serie + `" class="series">` + item.serie + `</button>`).appendTo('#series');
                });
                $('.series').on('click', function(e) {
                    globalIndex = parseInt($(e.target).attr("id_"), 10);
                    //btnPushed
                    $("#series button").removeClass("btnPushed");
                    $(e.target).addClass("btnPushed");


                    var playlist = {};
                    $.each(anime.player.playlist, function(key, item){

                        path = "https://"+anime.player.host + (item.hls["hd"] ? item.hls["hd"]: item.hls["sd"]);

                    
                        playlist[key]=path;
                    });


                    startPlayer($(e.target).attr("data-path"), $(e.target).attr("cleanName"), playlist, globalIndex);
                    //startPlayer(SERVER + `/stream/` + $(e.target).attr("data-path") + `?link=` + hash + `&index=` + $(e.target).attr("id_") + `&play`, $(e.target).attr("cleanName"))
                });
            } else {
                $(".btn-prew").attr("disabled", true);
                $(".btn-next").attr("disabled", true);
                hls = anime.player.playlist[1].hls;
                path = "https://"+anime.player.host + (item.hls["hd"] ? item.hls["hd"]: item.hls["sd"]);

                //startPlayer(SERVER + `/stream/` + encodeURI(path) + `?link=` + hash + `&index=1&play`, path)

                startPlayer(path,anime.names.ru,null,1);
            }


}


//https://de1.libria.fun/videos/media/ts/8586/1/720/8d3eedf6a773f42d3214a55bf5d11f57.m3u8
//https://de1.libria.fun/videos/media/ts/8586/1/720/8d3eedf6a773f42d3214a55bf5d11f57.m3u8

function addTorrent(torrent) {
    $.ajax({
        url: SERVER + '/torrents',
        method: 'post',
        contentType: false,
        processData: false,
        data: JSON.stringify({
            action: "add",
            link: torrent,
            poster: "",
            save_to_db: true,
            title: ""
        }),
        complete: function(data) {
            console.log(data);
            $('#livesearch').html('');
            $("#my-input").val('');
        }
    });
}

function Bclick(action, hash = null) {
    switch (action) {
        case 'info':
            var series = JSON.parse(hashList[hash][4]);
            $("#series").html('');
            if (series["TorrServer"]["Files"].length > 1) {
                $(".btn-prew").removeAttr("disabled");
                $(".btn-next").removeAttr("disabled");

                $.each(series["TorrServer"]["Files"], function(key, item) {
                    path = item.path
                    path = path.substr(path.lastIndexOf('/') + 1);
                    $(`<button id="SeriesId` + item.id + `" cleanName="` + path + `" data-path="` + encodeURI(path) + `" id_="` + item.id + `" class="series">` + item.id + `</button>`).appendTo('#series');
                });
                $('.series').on('click', function(e) {
                    globalIndex = parseInt($(e.target).attr("id_"), 10);
                    //btnPushed
                    $("#series button").removeClass("btnPushed");
                    $(e.target).addClass("btnPushed");

                    var playlist = {};
                    $.each((JSON.parse(hashList[hash][4]))["TorrServer"]["Files"], function(key, item){
                        path = item.path
                        path = path.substr(path.lastIndexOf('/') + 1);

                    
                        playlist[item.id]=SERVER + `/stream/` + encodeURI(path) + `?link=` + hash + `&index=` + item.id + `&play`;
                    });

                    startPlayer(SERVER + `/stream/` + $(e.target).attr("data-path") + `?link=` + hash + `&index=` + $(e.target).attr("id_") + `&play`, $(e.target).attr("cleanName"),hash, playlist, $(e.target).attr("id_"))
                });
            } else {
                $(".btn-prew").attr("disabled", true);
                $(".btn-next").attr("disabled", true);
                path = series["TorrServer"]["Files"][0]["path"];
                path = path.substr(path.lastIndexOf('/') + 1);
                startPlayer(SERVER + `/stream/` + encodeURI(path) + `?link=` + hash + `&index=1&play`, path, null,1)
            }

            console.log();
            break;
        case 'playlist':
            const url = SERVER + "/stream/fname?link=" + hash + "&index=1&m3u&fromlast";
            const a = document.createElement('a')
            a.href = url
            a.download = url.split('/').pop()
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            break;
        case 'drop':
            $.ajax({
                url: SERVER + '/torrents',
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify({
                    action: 'drop',
                    hash: hash
                }),
                dataType: 'json',
                complete: function(data) {
                    console.log(data);
                }
            });
            break;
        case 'play':
            $.ajax({
                url: SERVER2 + '/play',
                method: 'post',
                contentType: 'application/json',
                data: JSON.stringify({
                    link: SERVER + "/stream/fname?link=" + hash + "&index=1&m3u&fromlast"
                }),
                dataType: 'json',
                complete: function(data) {
                    console.log(data);
                }
            });
            break;
        case 'delete':
            $.ajax({
                url: SERVER + '/torrents',
                method: 'post',
                dataType: 'html',
                contentType: 'application/json',
                data: JSON.stringify({
                    action: 'rem',
                    hash: hash
                }),
                dataType: 'json',
                complete: function(data) {
                    console.log(data);
                    delete hashList[hash];
                    $("div[hash='" + hash + "']").remove();
                }
            });
            break;
        default:
            alert(action);
            break;
    }
}

function buildBlock(item) {
    var block = `
        <div class="sc-cTkxnA fvPHuo" hash="` + item.hash + `">
          <div class="sc-jNMcJZ fhIcLP">
            <svg height="80px" width="80px" fill="#00a572" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve">
              <g>
                <path d="M18.293,93.801c0.066,0.376,0.284,0.718,0.597,0.937c0.313,0.219,0.708,0.307,1.085,0.241l70.058-12.353   c0.376-0.066,0.718-0.284,0.937-0.597c0.219-0.313,0.307-0.708,0.24-1.085l-9.502-53.891c-0.139-0.79-0.892-1.317-1.682-1.178   l-19.402,3.421L47.997,14.16c0.241-0.706,0.375-1.456,0.375-2.229c0-0.399-0.035-0.804-0.106-1.209C47.671,7.363,44.757,5,41.455,5   c-0.4,0-0.804,0.035-1.209,0.106h0c-3.359,0.595-5.723,3.509-5.723,6.812c0,0.4,0.035,0.804,0.106,1.209   c0.178,1.005,0.567,1.918,1.109,2.709l-6.875,19.061L9.968,38.228c-0.79,0.139-1.317,0.892-1.177,1.682L18.293,93.801z    M40.75,7.966L40.75,7.966c0.239-0.042,0.474-0.062,0.705-0.062c1.909,0,3.612,1.373,3.953,3.324v0   c0.042,0.238,0.062,0.473,0.062,0.704c0,1.908-1.373,3.612-3.323,3.953h0.001c-0.238,0.042-0.473,0.062-0.705,0.062   c-1.908,0-3.612-1.373-3.953-3.323c-0.042-0.238-0.062-0.473-0.062-0.705C37.427,10.01,38.799,8.306,40.75,7.966z M38.059,17.96   c1.012,0.569,2.17,0.89,3.383,0.89c0.399,0,0.804-0.034,1.208-0.106h0.001c1.48-0.263,2.766-0.976,3.743-1.974l10.935,13.108   L32.16,34.315L38.059,17.96z M29.978,37.648c0.136-0.004,0.268-0.029,0.396-0.07l29.75-5.246c0.134-0.006,0.266-0.027,0.395-0.07   l18.582-3.277l8.998,51.031L20.9,91.867l-8.998-51.032L29.978,37.648z"></path>
                <path d="M49.984,75.561c0.809,0,1.627-0.065,2.449-0.199l0.001,0c7.425-1.213,12.701-7.627,12.701-14.919   c0-0.809-0.065-1.627-0.199-2.449c-1.213-7.425-7.626-12.701-14.919-12.701c-0.808,0-1.627,0.065-2.45,0.199   c-7.425,1.213-12.701,7.626-12.701,14.918c0,0.808,0.065,1.627,0.199,2.449C36.278,70.284,42.692,75.561,49.984,75.561z    M51.967,72.496c-0.668,0.109-1.33,0.161-1.983,0.161c-5.883,0-11.079-4.265-12.053-10.265c-0.109-0.668-0.161-1.33-0.161-1.983   c0-2.108,0.555-4.123,1.534-5.892l19.693,14.176C57.206,70.645,54.782,72.039,51.967,72.496z M48.034,48.357L48.034,48.357   c0.668-0.109,1.329-0.161,1.983-0.161c5.882,0,11.079,4.265,12.053,10.265c0.109,0.667,0.161,1.329,0.161,1.983   c0,2.109-0.556,4.127-1.536,5.897L41.001,52.163C42.791,50.21,45.217,48.814,48.034,48.357z"></path><polygon points="47.567,45.492 47.567,45.492 47.568,45.491  "></polygon>
              </g>
            </svg>
          </div>
          <div class="sc-dOSRxR jWqpqx">
            <button class="sc-cOajNj liiHkJ" onclick="Bclick('info','` + item.hash + `')">
              <svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z">
                  
                </path>
              </svg>
              <span>Play</span>
            </button>
            <button class="sc-cOajNj liiHkJ" onclick="Bclick('delete','` + item.hash + `')">
              <svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
              </svg>
              <span>Delete</span>
            </button>
          </div>
          <div class="sc-bBrNTY fzzIMe">
            <div class="description-title-wrapper">
              <div class="description-section-name">Название</div>
              <div class="description-torrent-title">` + item.title + `</div>
            </div>
            <div class="description-statistics-wrapper">
              <div class="description-statistics-element-wrapper">
                <div class="description-section-name">Размер</div>
                <div class="description-statistics-element-value size">` + (item.torrent_size / 1024 / 1024 / 1024).toFixed(2) + ` ГБ</div>
              </div>
              <div class="description-statistics-element-wrapper">
                <div class="description-section-name">Скорость</div>
                <div class="description-statistics-element-value speed">` + (item.download_speed ? (item.download_speed / 1024 / 1024).toFixed(2) + "Mb/s" : "---") + `</div>
              </div>
              <div class="description-statistics-element-wrapper">
                <div class="description-section-name">Пиры</div>
                <div class="description-statistics-element-value peers">` + (item.connected_seeders && item.active_peers && item.half_open_peers ? item.connected_seeders + " : " + item.active_peers + "/" + item.half_open_peers : "---") + `</div>
              </div>
            </div>
          </div>
        </div>`
    $(block).appendTo('#root .sc-gTgzoy.hWsYTo');
}

$('.btn-pause').on('click', function(e) {
    $.ajax({
        url: SERVER2 + '/player',
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            action: "pause"
        }),
        complete: function(data) {
            console.log(data);
            console.log(data.responseText);
            if (data.responseText === "1") {
                $(".btn-pause").removeClass('plyr__control--pressed');
            } else {
                $(".btn-pause").addClass('plyr__control--pressed');
            }
        }
    });
});

$('.btn-stop').on('click', function(e) {
    $.ajax({
        url: SERVER2 + '/player',
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            action: "stop"
        }),
        complete: function(data) {
            console.log(data);
        }
    });
});

$('.btn-next').on('click', function(e) {
    //console.log(1);
    globalIndex = globalIndex + 1;
    console.log(globalIndex);
    $("#SeriesId" + globalIndex).click();
});

$('.btn-prew').on('click', function(e) {
    console.log(globalIndex);
    globalIndex = globalIndex - 1;
    $("#SeriesId" + globalIndex).click();
});


var $input0 = $('#my-input-anime');
var getAjaxObject1 = function(str) {
    return {
        url: "http://api.anilibria.tv/v2/searchTitles?search="+$input0.val(),
        success: function(data) {
            //console.log(data);
            $('#livesearch').html('');
            hashListAnime = {};
            $.each(data, function(key, item) {
                console.log(item.names.ru);

                hashListAnime[item.id] = item;
                $(`<div onclick="addAnime(` + item.id + `)">` + item.names.ru + `</div><br>`).appendTo('#livesearch');


                //var torrentLink = "";
                //item.torrents.list.forEach(function(entry) {
                    //if(entry.quality.encoder == "h264"){
                        //$(`<div onclick="addAnime('http://api.anilibria.tv` + entry.url + `')">` + item.names.ru + ` - ` + (entry.total_size / 1024 / 1024 / 1024).toFixed(2) + " ГБ" + ` (` + entry.seeders + `)</div><br>`).appendTo('#livesearch');
                    //}
                    //console.log(entry.quality.encoder);
                //});

                //$(`<div onclick="addTorrent('` + item.torrents.list + `')">` + key + ` - ` + item.size + ` (` + item.peers + `)</div><br>`).appendTo('#livesearch'); //_____item.link______
            });
        },
        error: function(xhr, status, error) {}
    };
}

$input0.keyup(function() {
    $.ajaxDebounce({
        delay: 1000,
        ajax: getAjaxObject1()
    });
});


var $input = $('#my-input');
var getAjaxObject = function(str) {
    return {
        url: SERVER2 + "/api",
        data: {
            req: "search",
            q: $input.val()
        },
        success: function(data) {
            console.log(data);
            $('#livesearch').html('');
            $.each(data["data"], function(key, item) {
                $(`<div onclick="addTorrent('` + item.magnetLink + `')">` + item.film + ` - ` + item.size + ` (` + item.peers + `)</div><br>`).appendTo('#livesearch'); //_____item.link______
            });
        },
        error: function(xhr, status, error) {}
    };
}
$input.keyup(function() {
    $.ajaxDebounce({
        delay: 1000,
        ajax: getAjaxObject()
    });
});

var $input1 = $("input#plyr-seek-7469");
$input1.change(function() {
    $input1.css({
        "--value": $input1.val() + "%"
    });
    $.ajax({
        url: SERVER2 + '/player',
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            action: "setPosition",
            position: $input1.val()
        }),
        complete: function(data) {
            console.log(data);
        }
    });
});

var $input2 = $('input#plyr-volume-7469');
$input2.change(function() {
    $input2.css({
        "--value": $input2.val() + "%"
    });
    $.ajax({
        url: SERVER2 + '/player',
        method: 'post',
        contentType: 'application/json',
        data: JSON.stringify({
            action: "setVolume",
            position: $input2.val()
        }),
        complete: function(data) {
            console.log(data);
        }
    });
});

$("html").on("dragover", function(e) {
    e.preventDefault();
    e.stopPropagation();
    $("#dragAndDrop").text("Drag here");
});

$("html").on("drop", function(e) {
    e.preventDefault();
    e.stopPropagation();
});

$('.upload-area').on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $("h1").text("Upload");
    var file = e.originalEvent.dataTransfer.files[0];
    var fd = new FormData();
    //fd.append('file', file[0]);
    fd.append('file', file);
    fd.append('safe', 'true');
    fd.append('poster', 'https://image.tmdb.org/t/p/w300/ypakHp2MsOq1AMPhM3jEGg5EzBL.jpg');
    uploadData(fd);
});

//---------deselector---------
function deselect(e) {
    $('.pop').slideFadeToggle(function() {
        e.removeClass('selected');
    });
}
$(function() {
    $('#contact').on('click', function() {
        if ($(this).hasClass('selected')) {
            deselect($(this));
        } else {
            $(this).addClass('selected');
            $('.pop').slideFadeToggle();
        }
        return false;
    });
    $('.close').on('click', function() {
        deselect($('#contact'));
        return false;
    });
});
$.fn.slideFadeToggle = function(easing, callback) {
    return this.animate({
        opacity: 'toggle',
        height: 'toggle'
    }, 'fast', easing, callback);
};
//---------deselector---------


let timerId = setInterval(() => {
    $.ajax({
        url: SERVER + '/torrents',
        method: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'list'
        }),
        dataType: 'json',
        success: function(data) {
            $.each(data, function(key, item) {
                if (hashList[item.hash]) {
                    if (hashList[item.hash].toString() !== [item.download_speed, item.connected_seeders, item.active_peers, item.half_open_peers, item.data, item.title].toString()) {
                        hashList[item.hash] = [item.download_speed, item.connected_seeders, item.active_peers, item.half_open_peers, item.data, item.title];

                        $("div[hash='" + item.hash + "'] .sc-bBrNTY.fzzIMe .description-statistics-wrapper .size").html((item.torrent_size / 1024 / 1024 / 1024).toFixed(2) + " ГБ");
                        $("div[hash='" + item.hash + "'] .sc-bBrNTY.fzzIMe .description-torrent-title").html(item.title);
                        $("div[hash='" + item.hash + "'] .sc-bBrNTY.fzzIMe .description-statistics-wrapper .speed").html((item.download_speed ? (item.download_speed / 1024 / 1024).toFixed(2) + "Mb/s" : "---"));
                        $("div[hash='" + item.hash + "'] .sc-bBrNTY.fzzIMe .description-statistics-wrapper .peers").html((item.connected_seeders && item.active_peers && item.half_open_peers ? item.connected_seeders + " : " + item.active_peers + "/" + item.half_open_peers : "---"));
                    }
                } else {
                    hashList[item.hash] = [item.download_speed, item.connected_seeders, item.active_peers, item.half_open_peers, item.data, item.title];
                    buildBlock(item);
                }
            });
        }
    });
}, 3000);

let timerId1 = setInterval(() => {
    $.ajax({
        url: SERVER2 + '/player',
        method: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: "getPosition"
        }),
        complete: function(res) {
            console.log(res.responseJSON);
            console.log(typeof(res.responseJSON));
            data = res.responseJSON;
            console.log(data["position"]);

            setSlider(parseFloat(data["position"]), true);
            $('#title').html(data["title"]);
            $('.plyr__controls__item.plyr__time--current.plyr__time').html(data["time"]);
            $('.plyr__controls__item.plyr__time--duration.plyr__time').html(data["duration"]);
            /*if (data["time"] == data["duration"] && data["duration"] != "00:00") {
                $(".btn-next").click();
            }*/ 
            /*if (data["status"] == "State.Ended"){
                $(".btn-next").click();
            }*/

            /*switch (data["action"]) {
              case "ch+":
                $(".btn-next").click();
                break;
              case "ch-":
                $(".btn-prew").click();
                break;
            }*/

            if (data["pause"] === "0") {
                $(".btn-pause").removeClass('plyr__control--pressed');
            } else {
                $(".btn-pause").addClass('plyr__control--pressed');
            }
        }
    });
}, 1000);

$.ajax({
    url: SERVER2 + '/player',
    method: 'post',
    contentType: 'application/json',
    data: JSON.stringify({
        action: "getVolume"
    }),
    complete: function(data) {
        console.log(data);
        setSlider(parseFloat(data.responseText), false);
    }
});