function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}


var APP = angular.module('AppTab', []);

// APP.config(['$compileProvider', function($compileProvider) {
//   $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|tel|chrome|chrome-extension):/);
// }]);

angular.module('AppTab').config( ['$compileProvider',
    function( $compileProvider ) {
        var currentImgSrcSanitizationWhitelist = $compileProvider.imgSrcSanitizationWhitelist();
        var newImgSrcSanitizationWhiteList = currentImgSrcSanitizationWhitelist.toString().slice(0,-1)
        + '|https|file|chrome|http:'
        +currentImgSrcSanitizationWhitelist.toString().slice(-1);

        console.log("Changing imgSrcSanitizationWhiteList from "+currentImgSrcSanitizationWhitelist+" to "+newImgSrcSanitizationWhiteList);
        $compileProvider.imgSrcSanitizationWhitelist(newImgSrcSanitizationWhiteList);
    }
]);
APP.directive('fallbackSrc', function () {
  var fallbackSrc = {
    link: function postLink(scope, iElement, iAttrs) {
      iElement.bind('error', function() {
        angular.element(this).attr("src", iAttrs.fallbackSrc);
      });
    }
   }
   return fallbackSrc;
});




PLUG = {
    facebook: function(item){
        if(item.url.indexOf('facebook.com/')==-1) return false;
        var name = item.url.split('facebook.com/')[1];
        name = name.split('?')[0];
        if(!name.trim()) return false;
        if(name.indexOf('/')!=-1) return false;
        if(name.substr(-4)=='.php') return false;
        if(name=='#') return false;
        return {ID:name, title:item.title, url:item.url, time:item.time};
    },

    youtube: function(item){
        if(item.url.indexOf('youtube.com/watch')==-1) return false;
        var name = item.url.split('youtube.com/watch?v=')[1];
        name = name.split('?')[0];
        name = name.split('#')[0];
        name = name.split('&')[0];
        var title = item.title.split('-')[0];
        if(!name.trim()) return false;
        return {ID:name, url:item.url, title:title, time:item.time};
    },

    google: function(item){
        if(item.url.indexOf('.google.')==-1) return false;
        var search = item.title.split('-')[0];
        if(!search) return false;
        if(search.indexOf('Image Result')!=-1) return false;
        // var t = new Date(item.lastVisitTime);
        // var time = padDigits(t.getHours(),2) + ':' + padDigits(t.getMinutes(),2);
        return {ID:item.time, query:search, url:item.url, time:item.time};
    },

    maps: function(item){
        if(item.url.indexOf('.google.')==-1) return false;
        if(item.url.indexOf('/maps/')==-1) return false;
        // console.log(item.url);
        var search = item.url.split('/place/')[1];
        if(!search) return false;
        search = search.split('/')[0];
        // console.log('---->>>',search);
        var title = search.replace('+',' ').replace('+',' ').replace('+',' ').replace('+',' ').replace('+',' ').replace('+',' ').replace('+',' ').replace('+',' ').replace('+',' ').replace('+',' ');        
        if(!search) return false;
        return {ID:search, query:title, title:item.title, url:item.url, time:item.time};
        // var search = item.url.split('/@')[0];
        // var search = item.url.split('q=')[1];
        // search = search.split('&')[0];
    },

    wikipedia: function(item){
        if(item.url.indexOf('wikipedia.org/')==-1) return false;
        var title = item.title.split('-')[0].split('–')[0];
        if(title.indexOf(':')!=-1) return false;
        // var t = new Date(item.lastVisitTime);
        // var time = padDigits(t.getHours(),2) + ':' + padDigits(t.getMinutes(),2);
        return {ID:title, title:title, url:item.url, time:item.time};
    },

    images: function(item){
        var ext = item.url.split('.').slice(-1)[0];
        if('jpg,jpeg,gif,png'.indexOf(ext)==-1) return false;
        item.ID = item.url;
        return item;
    },
    amazon: function(item){
        if(item.url.indexOf('http://www.amazon.')==-1) return false;
        if( (item.url.indexOf('/dp/')==-1) && (item.url.indexOf('/gp/')==-1) ) return false;

        if(item.url.indexOf('/s/')!=-1) return false;
        if(item.url.indexOf('/wishlist/')!=-1) return false;
        if(item.url.indexOf('/main/')!=-1) return false;
        if(item.url.indexOf('view.html')!=-1) return false;
        if(item.url.indexOf('feature.html')!=-1) return false;
        if(item.url.indexOf('display.html')!=-1) return false;
        if(item.url.indexOf('/details/')!=-1) return false;
        if(item.url.indexOf('/search')!=-1) return false;
        var url = item.url.split("/ref=")[0].trim('/');
        if(url.split('/').length<4) return false;
        if(url.substr(-1)=='/') url = url.substr(0,url.length-1);
        var asin = url.split('/').slice(-1)[0];
        // if(!asin) console.log('amazon:', asin, url, item.url);
        // else console.log('.');
        // console.log('amazon:', asin, url);
        // console.log('---', item.title);
        return {ID:asin, title:item.title, url:item.url, time:item.time};
        // http://images.amazon.com/images/P/B00NHKF64K.01.MZZZZZZZ.jpg
        // http://images.amazon.com/images/P/B00NHKF64K.01.LZZZZZZZ.jpg
    }
}

STORE = {
    load: function(key){
        var val = localStorage.getItem(key);
        console.log("STORE ",key);
        return val ? JSON.parse(val) : {};
    },
    save: function(key,val){
        localStorage.setItem(key, JSON.stringify(val));
    }
}

DATA = {
    save: function(typ){
        STORE.save(typ, DATA[typ]);
    },
    load: function(typ){
        DATA[typ] = STORE.load(typ);
    },
    add: function(typ,item){
        if( add = PLUG[typ](item) ) DATA[typ][add.ID] = add;
    },

    facebook: {},
    google: {},
    amazon: {},
    favorites: {},
    wikipedia: {},
    images: {},
    youtube: {},
    maps: {},
    
    saveAll: function(){
        DATA.save('amazon');
        DATA.save('facebook');
        DATA.save('favorites');
        DATA.save('google');
        DATA.save('wikipedia');
        DATA.save('images');
        DATA.save('youtube');
        DATA.save('maps');
    },
    loadAll: function(){
        DATA.load('amazon');
        DATA.load('facebook');
        DATA.load('favorites');
        DATA.load('google');
        DATA.load('wikipedia');
        DATA.load('images');
        DATA.load('youtube');
        DATA.load('maps');
    },

    list: function(typ,limit,order){
        var tmp = [];
        for(var ID in DATA[typ]) 
            tmp.push(DATA[typ][ID])
        tmp.sort(function(a, b){ return b[order]-a[order] });
        return tmp.slice(0,limit);
    }

}



APP.controller('AppCtrl', function($scope, $location) { 
    $app = $scope;
    $scope.offline = [];
    $scope.apps = [];
    $scope.links = [];
    $scope.topsites = [];
    $scope.history = [];
    $scope.images = [];
    $scope.downloads = [];
    $scope.facebook = [];
    $scope.youtube = [];
    $scope.amazon = [];
    $scope.google = [];
    $scope.wikipedia = [];
    $scope.favorites = [];
    $scope.maps = [];


    $scope.launch = function(app){
        console.log('launch:',app.appLaunchUrl);
        if(app.appLaunchUrl) document.location = app.appLaunchUrl;
        else chrome.management.launchApp(app.id);
    }
    
    $scope.call = function(site){
        document.location = site.url;
    }
    
    $scope.showAll = function(){
        $scope.amazon = DATA.list('amazon',20,'time');
        $scope.facebook = DATA.list('facebook',18,'time');
        $scope.favorites = DATA.list('favorites',36,'count');
        $scope.google = DATA.list('google',36,'time');
        $scope.wikipedia = DATA.list('wikipedia',36,'time');
        $scope.images = DATA.list('images',20,'time');
        $scope.youtube = DATA.list('youtube',10,'time');
        $scope.maps = DATA.list('maps',12,'time');
        // $scope.$apply();
    }    

    $scope.loadCache = function(key, time){
        setTimeout( function(){
            $scope[key] = STORE.load(key);
            $scope.$apply();
        }, time);
    }

    $scope.loadHistory = function(){
        var historyCheck = localStorage.getItem('historyCheck');
        // var historyCheck = 0;
        if(!historyCheck) historyCheck = 0;
        chrome.history.search({text:'', maxResults: 1000000000, startTime: historyCheck*1}, function(list){
            localStorage.setItem('historyCheck', new Date().getTime());
            console.log('HISTORY:',list.length);

            counter = {};
            for(var i in list){
                var item = list[i];
                item.time = Math.round(item.lastVisitTime);
                DATA.add('facebook',item);
                DATA.add('amazon',item);
                DATA.add('google',item);
                DATA.add('wikipedia',item);
                DATA.add('images',item);
                DATA.add('youtube',item);
                DATA.add('maps',item);

                var domain = item.url.split('/').slice(2,3).join('/').replace('www.','');
                if(DATA.favorites[domain]) DATA.favorites[domain].count++;
                else DATA.favorites[domain] = {domain:domain, count:1};
                // DATA.favorites[domain] = DATA.favorites[domain] ? DATA.favorites[domain].count++ : {domain:domain,count:1};
            }
            DATA.saveAll();
            $scope.showAll();
            $scope.$apply();
        });
    }

    $scope.loadDownloads = function(){
        chrome.downloads.search({limit:24, orderBy:['-startTime']},function(list){
            for(var i in list){
                list[i].name = list[i].filename.split('/').slice(-1)[0];
                list[i].cleanUrl = list[i].url.split('://')[1].replace('www.','');
                list[i].domain = list[i].url.split('/').slice(2,3).join('/').replace('www.','');
                list[i].kb = Math.round(list[i].bytesReceived/1024);
                list[i].mb = Math.round(list[i].bytesReceived/1024/1024);
                list[i].size = list[i].mb < 1 ? list[i].kb+'K' : list[i].mb+'M';
                list[i].local = 'file://'+list[i].filename;
                list[i].icon = 'error.jpg';
                list[i].time = list[i].startTime;

                var mime = list[i].mime.split('/');
                var ext = list[i].filename.split('.').slice(-1)[0];
                list[i].ext = ext;

                // COLORS
                if(mime[0]=='image')                        list[i].class = 'image';
                if('jpg,jpeg,gif,png'.indexOf(ext)!=-1)     list[i].class = 'image';
                if('doc,xls,ppt,pdf,txt'.indexOf(ext)!=-1)  list[i].class = 'document';

                $scope.downloads.push(list[i]);
            }            
            STORE.save('downloads', $scope.downloads);
            // setTimeout(function(){ $app.$apply(); },10);
            setTimeout(defaultImage, 10);
        });
    }

    $scope.init = function(){

        chrome.management.getAll(function(list){
            // console.log(list);
            for(var i in list){
                // console.log('app',list[i]);
                var app = list[i];
                if(app.icons) app.icon = app.icons[app.icons.length-1].url;//.replace('chrome://','');
                else app.icon = '';
                // app.icon2 = "<img src='"+app.icon+"'/>";
                // console.log(app.appLaunchUrl);
                // if(app.offlineEnabled) $scope.offline.push(app); //  && app.type=='packaged_app'
                if(app.type=='packaged_app') $scope.apps.push(app);
                else if(app.type=='legacy_packaged_app') $scope.apps.push(app);
                else if(app.type=='hosted_app') $scope.apps.push(app); //$scope.links.push(app);
            }
            // setTimeout(function(){ $app.$apply(); },10);
            setTimeout(defaultImage, 10);
        });

        DATA.loadAll();
        setTimeout($scope.loadHistory, 500);
        // setTimeout($scope.loadDownloads, 1000);
    };

    $scope.init();
});

                // if('png,jpeg,gif,pdf,zip,html'.split(',').indexOf(mime[1])!=-1) list[i].icon = mime[1]+'.png';
                // list[i].size = (list[i].bytesReceived/1024/1024).toFixed(2);

defaultImage = function(){
    $app.$apply();
    var imgs = document.getElementsByClassName('defaultImage');
    for(var i=0;i<imgs.length;i++){
        // console.log('IMG',imgs[i]);
        imgs[i].addEventListener('error',function(ev){
            // console.log("LOAD ERROR!!!!");
            ev.target.src='ico/error.jpg'
        });
        imgs[i].removeAttribute('class');
    }
}






        // console.time('H-load');
        // $scope.loadCache('favorites',100);
        // $scope.loadCache('google',200);
        // $scope.loadCache('facebook',300);
        // $scope.loadCache('wikipedia',400);
        // $scope.loadCache('youtube',500);
        // $scope.loadCache('images',600);
        // $scope.loadCache('downloads',700);
        // setTimeout(function(){ $scope.loadHistory(); },1000);
        // setTimeout(function(){ $scope.loadDownloads(); },1000);



                // if( add = PLUG.facebook(item) ) DATA.facebook[add.ID] = add;
                // if( add = PLUG.amazon(item) )   DATA.amazon[add.ID] = add;


                // if( add = PLUG.facebook(item) ) $scope.facebook.push(add);
                // if( add = PLUG.google(item) ) $scope.google.push(add);
                // if( add = PLUG.wikipedia(item) ) $scope.wikipedia.push(add);
                // if( add = PLUG.youtube(item) ) $scope.youtube.push(add);
                // if( add = PLUG.amazon(item) ) $scope.amazon.push(add);
                // if( add = PLUG.images(item) ) $scope.images.push(add);

            // favorites
            // for(var domain in counter)
            //     if(counter[domain]>9)
            //         $scope.favorites.push( {domain:domain, count:counter[domain]} );
            // $scope.favorites.sort(function(a, b){return b.count-a.count});

            // STORE.save('google', $scope.google);
            // STORE.save('facebook', $scope.facebook);
            // STORE.save('wikipedia', $scope.wikipedia);
            // STORE.save('youtube', $scope.youtube);
            // STORE.save('images', $scope.images);
            // STORE.save('favorites', $scope.favorites);







        // chrome.history.search({text:'', maxResults:63},function(list){
        //     for(var i in list){
        //         if(list[i].url.indexOf('facebook.com/')!=-1) continue;
        //         var t = new Date(list[i].lastVisitTime);
        //         // console.log('hist',list[i],t);
        //         list[i].time = padDigits(t.getHours(),2) + ':' + padDigits(t.getMinutes(),2);
        //         list[i].icon = list[i].url.split('/').slice(0,3).join('/')+'/favicon.ico';
        //         list[i].domain = list[i].url.split('/').slice(2,3).join('/').replace('www.','');
        //         list[i].cleanUrl = list[i].url.split('://')[1].replace('www.','');
        //         if( (list[i].url.indexOf('.google.')!=-1) && (list[i].url.indexOf('/url?')!=-1) ) continue;
        //         // if(!list[i].title) list[i].title = list[i].url;
        //         $scope.history.push(list[i]);
        //     }            
        //     // setTimeout(function(){ $app.$apply(); },10);
        //     setTimeout(defaultImage, 10);
        // });



        // chrome.topSites.get(function(list){
        //     for(var i in list){
        //         // console.log('top',list[i]);
        //         list[i].icon = list[i].url.split('/').slice(0,3).join('/')+'/favicon.ico';
        //         list[i].domain = list[i].url.split('/').slice(2,3).join('/').replace('www.','');
        //         // console.log('icon',list[i].icon);
        //         $scope.topsites.push(list[i]);
        //     }
        //     // setTimeout(function(){ $app.$apply(); },10);
        //     setTimeout(defaultImage, 10);
        // });



// error = function(ev){
//     console.log('ERROR:',ev.target);
//     // this.src='error.png'
// }




                // if('dmg,torrent,zip,jpg'.indexOf(ext)!=-1) list[i].icon = ext+'.png';
                // if('jpg,jpeg,gif,png'.indexOf(ext)!=-1) list[i].icon = 'image.png';
                // if(mime[0]=='image') list[i].icon = 'image.png';
                // if(mime[0]=='image') list[i].icon = 'image.png';
                // if(mime[1]=='pdf') list[i].icon = 'document.png';
                // if('jpg,jpeg,gif,png'.indexOf(ext)!=-1) ;//$scope.images.push(list[i]);
                // else 





// var app = angular.module( 'myApp', [] )
// .config( [
//     '$compileProvider',
//     function( $compileProvider )
//     {   
//         $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
//         // Angular before v1.2 uses $compileProvider.urlSanitizationWhitelist(...)
//     }
// ]);
// angular.module('AppTab')
//     .filter('trusted', ['$sce', function($sce){
//         return function(text) {
//             return $sce.trustAsHtml(text);
//         };
//     }]);
