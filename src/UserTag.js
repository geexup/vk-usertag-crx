(function() {
    class UserListsTags {
        constructor() {
            this.isLoading = false;
            this.authorizated = false;
            this.banUrl = '';

            this.lists = null;
            this.friends = null;

            this.accessToken = null;
            this.userId = null;

            this.Auth();
        }

        Init() {
            const initNotification = () => { if(!!this.lists && !!this.friends){ console.info('[UserTag] Initialized!'); } };

            //  Getting All ListsNames //  Getting All friends with listsIds
            this.ApiReq('friends.getLists', { return_system: true }, (data) => { this.lists = data.items; initNotification(); });
            this.ApiReq('friends.get', { order: 'hints', fields: 'lists' }, (data) => { this.friends = data.items; initNotification(); });

            setInterval(() => {if (this.authorizated && !!this.lists && !!this.friends && this.isPageCanBeTagged() && !this.isLoading && this.banUrl !== window.location.pathname) {
                this.TagUser();
            }}, 100);
        }

        Auth() {
            this.accessToken = localStorage.accessToken;
            this.userId = localStorage.userId;

            this.ApiReq('friends.getLists', { count: 1 }, (data, error) => {
                if(!error) {
                    console.info('[UserTag] Auth Complete');

                    this.authorizated = true;
                    this.Init();
                } else {
                    const httpParams = {
                        "client_id": 3740897,
                        "display": "popup",
                        "scope": "2",
                        "response_type": "token",
                        "v": "5.63"
                    };

                    window.addEventListener("message", (ev) => {
                        if(ev.origin == "https://oauth.vk.com" && ev.data.token) {
                            localStorage.accessToken = this.accessToken = ev.data.token;
                            localStorage.userId = this.userId = ev.data.user_id;

                            console.info('[UserTag] Auth Complete');
                            this.authorizated = true;
                            this.Init();
                        }
                    });

                    console.log(`https://oauth.vk.com/authorize?${this.httpParamsFromObject(httpParams)}`);

                    const authDialogue = window.open(`https://oauth.vk.com/authorize?${this.httpParamsFromObject(httpParams)}`,
                        "Authorization", ["width=500", "height=300", "left=490", "top=300"].join(','));

                    authDialogue.focus();
                }
            });
        }


        ApiReq(method, params, callback) {
            const oReq = new XMLHttpRequest();
            const defParams = {
                v: 5.59,
                format: 'json',
                user_id: this.userId,
                access_token: this.accessToken,
                method: method,
                oauth: 1
            };

            oReq.addEventListener("load", function() {
                var res = JSON.parse(this.response);

                if(!res.error)
                    callback(res.response);
                else
                    callback(null, res.error);
            });
            oReq.open("GET", '/api.php?' + this.httpParamsFromObject(defParams, params));
            oReq.send();
        };


        getListsHTML(lists) {
            const cssGroups = [
                { 'background-color': '#f5e9e2', 'color': '#8b4c23' },
                { 'background-color': '#faead8', 'color': '#764f14' },
                { 'background-color': '#faf3d8', 'color': '#817945' },
                { 'background-color': '#e8f2dc', 'color': '#37702a' },
                { 'background-color': '#e0ecea', 'color': '#4c7171' },
                { 'background-color': '#e4ebf1', 'color': '#0b5588' },
                { 'background-color': '#e4e7f2', 'color': '#2f54aa' },
                { 'background-color': '#ede5f0', 'color': '#80478f' },
                { 'background-color': '#f5e9e2', 'color': '#8b4c23' },
                { 'background-color': '#faead8', 'color': '#764f14' },
            ];
            const listStyle = {
                'padding': '3px 8px 3px 8px',
                'border-radius': '50px',
                'margin-right': '5px',
                'margin-bottom': '5px',
                'text-decoration': 'none',
                'flex': 'auto'
            };
            const wrapStyle = {
                'display': 'flex',
                'padding-top': '20px',
                'flex-wrap': 'wrap',
                'border-top': '1px solid #e7e8ec',
                'margin-top': '15px',
                'text-align': 'center'
            };

            let html = '';

            lists.forEach((list) => {
                const groupNum = (list.id < 9 ?  list.id : ( list.id < 17 ? list.id - 8:  (list.id < 25 ? list.id - 16 : list.id - 24))) - 1;

                html += `<a href="/al_friends.php?section=list${list.id}" class="lists_list" style="${this.cssFromStyleObject(listStyle, cssGroups[groupNum])}">${list.name}</a>`;
            });

            return `<div class="lists" style="${this.cssFromStyleObject(wrapStyle)}">${html}</div>`;
        };


        //  Get HTTP params string from Object
        httpParamsFromObject(...params) {
            const HTTParams = Object.assign({}, ...params);
            const HTTParamsArray = [];

            Object.getOwnPropertyNames(HTTParams).forEach(function(name) {
                HTTParamsArray.push(name + '=' + encodeURIComponent(HTTParams[name]));
            });

            return HTTParamsArray.join('&');
        }


        //  Get CSS string from Object
        cssFromStyleObject(...styles) {
            const style = Object.assign({}, ...styles);
            const StyleArray = [];
            Object.getOwnPropertyNames(style).forEach(function(name) {
                StyleArray.push(name + ':' + style[name]);
            });

            return StyleArray.join(';') + ';';
        }


        //  Is user page with userId
        isPageCanBeTagged() {
            return !!document.querySelector('.profile_action_btn.profile_msg_split a');
        }


        TagUser() {
            //  This page is already Tagged
            if (!!document.querySelector('.page_current_info .lists')) {
                return false;
            }

            //  No Multiple Request
            this.isLoading = true;

            const openedUserId = document.querySelector('.profile_action_btn.profile_msg_split a').href.split('write')[1];
            const user = this.friends.find((user) => user.id == openedUserId);
            const userLists = [];

            //  Not in Friends
            if (!user) {
                this.banUrl = window.location.pathname;
                this.isLoading = false;

                return false;
            }

            //  Getting Lists Names For Current UserPage
            user.lists.forEach((listId) => { userLists.push(this.lists.find((list) => list.id == listId)); });

            //  No Status Fix
            if (!document.querySelector('.page_current_info')) {
                document.querySelector('.page_info_wrap .page_top').innerHTML += '<div class="page_current_info" id="page_current_info"></div>';
            }

            // Adding Tags to Page
            document.querySelector('.page_current_info').innerHTML += this.getListsHTML(userLists.sort((a, b) => a.name.length - b.name.length));
            this.isLoading = false;
        }
    }

    new UserListsTags();
})();
