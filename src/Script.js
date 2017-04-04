(function () {
    if(location.host === "oauth.vk.com") {
        var params = getParamsObject(window.location.href.split("#")[1]);
        window.opener.postMessage({token: params.access_token, user_id: params.user_id}, '*');
        window.close();

        console.info(params);
        return true;
    }

    const s = document.createElement('script');
    const vars = document.createElement('script');

    vars.innerHTML = "window.UserTagAuthUrl='"+chrome.extension.getURL('auth.html')+"';";
    s.src = chrome.extension.getURL('UserTag.js');

    window.onload = () => {
        document.body.appendChild(s);
        document.body.appendChild(vars);
    };

    function getParamsObject(paramString) {
        var paramsArray = paramString.split("&");
        var paramsObject = {};

        paramsArray.forEach(function(paramVal){
            var paramValArray = paramVal.split("=");

            paramsObject[paramValArray[0]] = decodeURIComponent(paramValArray[1]);
        });

        return paramsObject;
    }
})();