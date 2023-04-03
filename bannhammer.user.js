// ==UserScript==
// @name            TwitchModsDACH Bann-Hammer (by RaidHammer)
// @description     A tool for moderating Twitch easier during hate raids
// @namespace       https://github.com/TwitchmodsDACH/Bann-Hammer
// @version         1.1.4.7
// @match           *://*.twitch.tv/*
// @run-at          document-idle
// @author          victornpb
// @homepageURL     https://github.com/TwitchmodsDACH/Bann-Hammer
// @supportURL      https://github.com/TwitchmodsDACH/Bann-Hammer
// @contributionURL https://github.com/TwitchmodsDACH/Bann-Hammer
// @grant           GM_setValue
// @grant           GM_getValue
// @grant           GM_xmlhttpRequest
// @license         MIT
// ==/UserScript==

/* jshint esversion: 8 */


(function () {
    // This function is requried to disable CORS for the GitHub ban list repository
    // https://portswigger.net/web-security/cors
    // If you didn't require this ban lists you can disable this
    var corsDisable = {
      "id": 1,
      "enabled": true,
      "name": "Allow All",
      "match": "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/*",
      "action": "allow",
      "responseHeaders": [{
        "name": "Access-Control-Allow-Origin",
        "value": "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/*"
      }]
    };
    GM_setValue("corsDisable", corsDisable);

    // Globle required Variables
    let queueList = new Set();
    let ignoredList = new Set();
    let bannedList = new Set();
    const LOGPREFIX = '[RAIDHAMMER]';
    const delay = t => new Promise(r => setTimeout(r, t));


    // Frontend
    var html = /*html*/`
    <div id="raidhammer" class="raidhammer">
    <style>
        .raidhammer {
            position: fixed;
            bottom: 10px;
            right: 800px;
            z-index: 99999999;
            background-color: var(--color-background-base);
            color: var(--color-text-base);
            border: var(--border-width-default) solid var(--color-border-base);
            box-shadow: var(--shadow-elevation-2);
            padding: 5px;
            min-width: 500px;
        }

        .raidhammer .greenhammer {
            color: "#34ae0c"
        }

        .raidhammer .header {
            display: flex;
        }

        .raidhammer .logo {
            font-weight: var(--font-weight-semibold);
            min-height: 30px;
            line-height: 30px;
            --color: var(--color-text-link);
        }

        .raidhammer h6 {
            color: var(--color-hinted-grey-7);
        }

        .raidhammer h6 button {
            height: auto;
            background: none;
        }

        .raidhammer .list {
            padding: 8px;
            min-height: 8em;
            max-height: 350px;
            overflow-y: auto;
            background: var(--color-background-body);
        }

        .raidhammer .list span {
            font-weight: var(--font-weight-semibold);
        }

        .raidhammer .empty {
            padding: 2em;
            text-align: center;
            opacity: 0.85;
        }

        .raidhammer button {
            padding: 0 .5em;
            margin: 1px;
            font-weight: var(--font-weight-semibold);
            border-radius: var(--border-radius-medium);
            font-size: var(--button-text-default);
            height: var(--button-size-default);
            background-color: var(--color-background-button-secondary-default);
            color: var(--color-text-button-secondary);
            min-width: 30px;
            text-align: center;
        }

        .raidhammer button.ban {
            var(--color-text-button-primary);
            background: #f44336;
            min-width: 60px;
        }

        .raidhammer button.banAll {
            var(--color-text-button-primary);
            background: #f44336;
            min-width: 60px;
        }

        .raidhammer button.unbanAll {
            var(--color-text-button-primary);
            background: #34ae0c;
            min-width: 60px;
        }

        .raidhammer button.unban {
            var(--color-text-button-primary);
            background: #34ae0c;
            min-width: 60px;
        }

        .raidhammer .import {
            background: var(--color-background-body);
            border: var(--border-width-default) solid var(--color-border-base);
            padding: 3px;
            min-height: 20px
        }

        .raidhammer textarea {
            background: var(--color-background-base);
            color: var(--color-text-base);
            padding: .5em;
            font-size: 10pt;
            width: 100%;
            min-height: 8em;
        }
        .raidhammer .footer {
            font-size: 7pt;
            text-align: center;
        }

    </style>
    <div class="header">
        <span style="flex-grow: 1;"></span>
        <h5 class="logo">

            <a href="https://github.com/TwitchmodsDACH/Bann-Hammer" target="_blank" style="color: #34ae0c;">Bann-Hammer&nbsp;&nbsp;
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="5 5 1280 1280" style="color: #34ae0c;fill: currentcolor;align:center;">
                <path d="M517 1c-16 3-28 10-41 22l-10 10 161 160 161 161 2-2c6-4 17-19 21-25 10-19 12-44 4-64-6-14-5-13-120-129L576 17c-8-7-18-12-27-15-8-1-25-2-32-1zM249 250 77 422l161 161 161 161 74-74 74-75 18 19 18 18-2 4c-4 6-4 14-1 20a28808 28808 0 0 0 589 621c4 2 6 3 13 3 6 0 8-1 13-3 6-4 79-77 82-83 4-9 4-21-2-29l-97-93-235-223-211-200c-51-47-73-68-76-69-6-3-13-3-19 0l-5 3-18-18-18-18 74-74 74-74-161-161L422 77 249 250zM23 476a75 75 0 0 0-10 95c4 6 219 222 231 232 8 7 16 11 26 14 6 2 10 2 22 2s14 0 22-2l14-6c5-4 20-16 24-21l2-2-161-161L32 466l-9 10z"/>
              </svg>
              &nbsp;&nbsp;TwitchModsDACH Edition&nbsp;v1.1.4.7</a>
        </h5><br \>

        <span style="flex-grow: 1;"></span>
        <button class="closeBtn">_</button>
    </div>
    <div id="import" class="import" style="display:none;">
        <textarea id="textfield" placeholder="Type one username per line"></textarea>
        <div style="text-align:right;">
            <input type="text" id="banReason" style="width:420px" placeholder="Enter ban reason" />
            <button class="importBtn">Add to list</button>
        </div>
        <div style="align:center">
          <button class="mdgBtnTrolls" style="width:32%">Add mdg_hate_trolls</button>
          <button class="mdgBtnViewerBots" style="width:33%">Add mdg_viewer_bots</button>
          <button class="mdgBtnUnban" style="width:32%;color:#34ae0c">Add mdg_unban</button>
        </div>
        <div style="align:center">
          <button class="mdgBtnFlirtyMad" style="width:32%">Add mdg_flirty_mad </button>
          <button class="mdgBtnFollowBot" style="width:33%">Add mdg_follow_bots</button>
          <button class="tmdBtnUnban" style="width:32%;color:#34ae0c">Add TMD_unban</button>
        </div>
        <div style="align:center">
          <button class="mdgBtnAdvertising" style="width:32%">Add mdg_advertising</button>
          <button class="mdgBtnSpamBots" style="width:33%">Add mdg_spam_bots</button>
          <button class="tmdBtnCrossban" style="width:32%">Add TMD_crossbans</button>
        </div>
    </div>
    <div class="body">
        <div class="list"></div>
        <div style="display: flex; margin: 5px;">
          <span style="flex-grow: 2;"></span>
          <div class="buttons">
            <button class="back">Back</button>
            <button class="unbanAll">Unban All</button>
            <button class="ignoreAll">Ignore All</button>
            <button class="banAll">Ban All</button>
          </div>
        </div>
    </div>
    <div class="footer">
    <a href="https://github.com/TwitchmodsDACH/Bannlisten" target="_blank" style="color: #34ae0c;">TwitchModsDACH Bannlisten</a>&nbsp;-&nbsp;
    <a href="https://github.com/TwitchmodsDACH/Bann-Hammer/raw/main/bannhammer.user.js">Aktuellste Version installieren</a>
    </div>`;

    // modal
    const d = document.createElement("div");
    d.style.display = 'none';
    d.innerHTML = html;
    const textarea = d.querySelector("textarea");

    // activation button
    const activateBtn = document.createElement('button');
    activateBtn.innerHTML = `
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 1280 1280" style="color: #34ae0c; fill: currentcolor;">
        <path d="M517 1c-16 3-28 10-41 22l-10 10 161 160 161 161 2-2c6-4 17-19 21-25 10-19 12-44 4-64-6-14-5-13-120-129L576 17c-8-7-18-12-27-15-8-1-25-2-32-1zM249 250 77 422l161 161 161 161 74-74 74-75 18 19 18 18-2 4c-4 6-4 14-1 20a28808 28808 0 0 0 589 621c4 2 6 3 13 3 6 0 8-1 13-3 6-4 79-77 82-83 4-9 4-21-2-29l-97-93-235-223-211-200c-51-47-73-68-76-69-6-3-13-3-19 0l-5 3-18-18-18-18 74-74 74-74-161-161L422 77 249 250zM23 476a75 75 0 0 0-10 95c4 6 219 222 231 232 8 7 16 11 26 14 6 2 10 2 22 2s14 0 22-2l14-6c5-4 20-16 24-21l2-2-161-161L32 466l-9 10z"/>
      </svg>
    `;

    activateBtn.style.cssText = `
        display: inline-flex;
        -webkit-box-align: center;
        align-items: center;
        -webkit-box-pack: center;
        justify-content: center;
        user-select: none;
        height: var(--button-size-default);
        width: var(--button-size-default);
        border-radius: var(--border-radius-medium);
        background-color: var(--color-background-button-text-default);
        color: var(--color-fill-button-icon);
    `;
    activateBtn.setAttribute('title', 'RaidHammer');
    activateBtn.onclick = toggle;

    let enabled;
    let watchdogTimer;

    function appendActivatorBtn() {
        const modBtn = document.querySelector('[data-test-selector="mod-view-link"]');
        if (modBtn) {
            const twitchBar = modBtn.parentElement.parentElement.parentElement;
            if (twitchBar && !twitchBar.contains(activateBtn)) {
                console.log(LOGPREFIX, 'Mod tools available. Adding button...');
                twitchBar.insertBefore(activateBtn, twitchBar.firstChild);
                document.body.appendChild(d);
                /*if (!enabled) {
                    console.log(LOGPREFIX, 'Started chatWatchdog...');
                    watchdogTimer = setInterval(chatWatchdog, 500);
                    enabled = true;
                }*/
            }

        } else if (document.location.toString().includes('/moderator/')){
            const chatBtn = document.querySelector('[data-a-target="chat-send-button"]');
            const twitchBar = chatBtn.parentElement.parentElement.parentElement;
            if (twitchBar && !twitchBar.contains(activateBtn)) {
                console.log(LOGPREFIX, 'Mod tools available. Adding button...');
                twitchBar.insertBefore(activateBtn, twitchBar.firstChild);
                document.body.appendChild(d);
            }
        }
        else {
            if (enabled) {
                console.log(LOGPREFIX, 'Mod tools not found. Stopped chatWatchdog!');
                clearInterval(watchdogTimer);
                watchdogTimer = enabled = false;
                hide();
            }
        }
    }
    setInterval(appendActivatorBtn, 5000);

    //events
    d.querySelector(".ignoreAll").onclick = ignoreAll;
    d.querySelector(".banAll").onclick = banAll;
    d.querySelector(".closeBtn").onclick = hide;
    d.querySelector(".unbanAll").onclick = unbanAll;
    d.querySelector(".back").onclick = toggleBack;
    d.querySelector(".import button.mdgBtnUnban").onclick = importMDGUnban;
    d.querySelector(".import button.mdgBtnTrolls").onclick = importMDGtrolls;
    d.querySelector(".import button.mdgBtnViewerBots").onclick = importMDGViewerBots;
    d.querySelector(".import button.mdgBtnFlirtyMad").onclick = importMDGFlirtyMad;
    d.querySelector(".import button.mdgBtnFollowBot").onclick = importMDGFollowBot;
    d.querySelector(".import button.mdgBtnAdvertising").onclick = importMDGAdvertising;
    d.querySelector(".import button.mdgBtnSpamBots").onclick = importMDGSpamBots;
    d.querySelector(".import button.tmdBtnUnban").onclick = importTMDUnban;
    d.querySelector(".import button.tmdBtnCrossban").onclick = importTMDCrossban;
    d.querySelector(".import button.importBtn").onclick = importList;

    // delegated events
    d.addEventListener('click', e => {
        const target = e.target;
        if (target.matches('.ignore')) ignoreItem(target.dataset.user);
        if (target.matches('.ban')) banItem(target.dataset.user);
        if (target.matches('.unban')) unbanItem(target.dataset.user);
        if (target.matches('.accountage')) accountage(target.dataset.user);
        if (target.matches('.toggleImport')) toggleImport();
        if (target.matches('.start')) toggleImport();

    });

    //Functions
    function show() {
        console.log(LOGPREFIX, 'Show');
        d.style.display = '';
        renderList();
    }

    function hide() {
        console.log(LOGPREFIX, 'Hide');
        d.style.display = 'none';
    }

    function toggle() {
        if (d.style.display !== 'none') hide();
        else show();
    }

    function toggleImport() {
        document.getElementById("textfield").value = "";
        const importDiv = d.querySelector(".import");
        const body = d.querySelector(".body");
        if (importDiv.style.display !== 'none') {
            importDiv.style.display = 'none';
            body.style.display = '';
        }
        else {
            importDiv.style.display = '';
            body.style.display = 'none';
            d.querySelector(".import textarea").focus();
        }
    }

    function toggleBack() {
      queueList.clear();
      document.getElementById("textfield").value = "";
      body = d.querySelector(".body");
      insertText("")
      importDiv = d.querySelector(".import");
      body = d.querySelector(".body");
      if (importDiv.style.display !== 'none') {
            importDiv.style.display = 'none';
            body.style.display = '';
      } else {
            importDiv.style.display = '';
            body.style.display = 'none';
            d.querySelector(".import textarea").focus();
      }

    }

    function importList() {
        const textarea = d.querySelector(".import textarea");
        const lines = textarea.value.split(/\n/).map(line => line.trim()).filter(Boolean);
        for (const line of lines) {
            if (/^[\w_]+$/.test(line)) queueList.add(line);
        }
        textarea.value = '';
        toggleImport();
        renderList();
    }

    function insertText(text) {
        document.getElementById("textfield").value = text;
    }

    function importMDGtrolls() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_hate_troll_list.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function importMDGUnban() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_unbanlist.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function importMDGViewerBots() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_viewer_bot_list.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function importMDGFlirtyMad() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_flirt_mad_manipulate_list.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function importMDGFollowBot() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_follower_bot_list.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function importMDGAdvertising() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_unauthorized_advertising_list.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function importMDGSpamBots() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_spam_bot_list.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function importTMDUnban() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/tmd_unbanlist.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function importTMDCrossban() {
      queueList.clear();
      var usersToBan = [];
      fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/tmd_cross_banlist.txt")
        .then((response) => response.text())
        .then((data) => {
            usersToBan.push(...data.split("\n").filter(Boolean));
            usersToBan.forEach(name => queueList.add(name.replace(/\r/g, "")));
            textarea.value = '';
            insertText(Array.from(queueList))
            if (queueList.size != "0") { toggleImport(); renderList(); }
        });
    }

    function ignoreAll() {
      console.log(LOGPREFIX, 'Ignoring all...', queueList);
      for (const user of queueList) {
            ignoreItem(user);
      }
    }

    async function banAll() {
      console.log(LOGPREFIX, 'Banning all...', queueList);
      for (const user of queueList) {
          banItem(user);
          await delay(125);
      }
    }

    async function unbanAll() {
      console.log(LOGPREFIX, 'Banning all...', queueList);
      for (const user of queueList) {
          unbanItem(user);
          await delay(125);
      }
    }

    function accountage(user) {
      console.log(LOGPREFIX, 'Accountage', user);
      sendMessage('!accountage ' + user);
    }

    function ignoreItem(user) {
      console.log(LOGPREFIX, 'Ignored user', user);
      queueList.delete(user)
      ignoredList.add(user)
      renderList();
    }

    function unbanItem(user) {
      console.log(LOGPREFIX, 'Unban user', user);
      queueList.delete(user);
      bannedList.add(user);
      sendMessage('/unban ' + user);
      renderList();
    }

    function banItem(user) {
      let banReason = document.getElementById("banReason").value;
      console.log(LOGPREFIX, 'Ban user', user);
      queueList.delete(user);
      bannedList.add(user);
      sendMessage('/ban ' + user + ' ' + banReason );
      renderList();
     }

    function sendMessage(msg) {
      try{
        sendMessageOld(msg);
      } catch(_) {
        sendMessageSlate(msg);
      }
    }

    function sendMessageOld(msg) {
      const textarea = document.querySelector("[data-a-target='chat-input']");
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      nativeTextAreaValueSetter.call(textarea, msg);
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);
      document.querySelector("[data-a-target='chat-send-button']").click();
    }

    function sendMessageSlate(msg) {
      function _injectInput(el, data) {[ 'keydown', 'beforeinput'].forEach((event, i) => {
        const eventObj = {
          altKey: false,
          charCode: 0,
          ctrlKey: false,
          metaKey: false,
          shiftKey: false,
          which: '',
          keyCode: '',
          data: data,
          inputType: 'insertText',
          key: data,
        };
      el.dispatchEvent(new InputEvent(event, eventObj));
      });}

      function _triggerKeyboardEvent(el, keyCode) {
        const eventObj = document.createEventObject ? document.createEventObject() : document.createEvent("Events");
        if (eventObj.initEvent) {
            eventObj.initEvent("keydown", true, true);
        }
        eventObj.keyCode = keyCode;
        eventObj.which = keyCode;
        el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj);
      }

      const editor = document.querySelector('[data-slate-editor="true"]');
      editor.focus();
      _injectInput(editor, msg);
      _triggerKeyboardEvent(editor, 13);
    }

    function renderList() {
      d.querySelector(".ignoreAll").style.display = queueList.size ? '' : 'none';
      d.querySelector(".banAll").style.display = queueList.size ? '' : 'none';
      d.querySelector(".back").style.display = queueList.size ? '' : 'none';
      d.querySelector(".unbanAll").style.display = queueList.size ? '' : 'none';
      const renderItem = item => `
      <li>
        <button class="accountage" data-user="${item}" title="Check account age">?</button>
        <button class="ignore" data-user="${item}">Ignore</button>
        <button class="ban" data-user="${item}">Ban</button>
        <button class="unban" data-user="${item}">Unban</button>
        <span>${item}</span>
      </li>`;

      let inner = queueList.size ? [...queueList].map(user => renderItem(user)).join('') : `
        <div class="empty">
          <img class="toggleImport" src="https://cdn.discordapp.com/attachments/928731319846965311/1088410170327056394/twitchmods_dach_logo_v2.png"  alt="Start RaidHammer" width="370px" style="cursor: pointer;">
        </div>`;
        d.querySelector('.list').innerHTML = `
        <ul>
          ${inner}
        </ul>`;
    }
})();

