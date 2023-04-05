// ==UserScript==
// @name            TwitchModsDACH Bann-Hammer (by RaidHammer)
// @description     A tool for moderating Twitch easier during hate raids
// @namespace       https://github.com/TwitchmodsDACH/Bann-Hammer
// @version         1.1.4.18
// @match           *://*.twitch.tv/*
// @run-at          document-idle
// @author          TwitchModsDACH (sofa) original code is from victornpb
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
    // Globle required Variables
    var myVersion;
    var newVersion;
    myVersion = "1.1.4.18"
    var replaceFooter = "none"
    var isPaused = false;
    var queueList = new Set();
    var ignoredList = new Set();
    var bannedList = new Set();
    const LOGPREFIX = "[BANN-DHAMMER]";
    const delay = t => new Promise(r => setTimeout(r, t));
    const urlParts = document.location.href.split("/");
    const activeChannel = urlParts[urlParts.length - 1];
    var themePrincess = "#FF1493"
    var themeNormal = "#34AE0C"
    var themeTextColor = themeNormal
    var updateText = "keine neue Version verfügbar"

    // This function is requried to disable CORS for the GitHub ban list repository
    // https://portswigger.net/web-security/cors
    // If you didn't require this ban lists you can disable this   https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/
    var corsDisable = {
      "id": 1,
      "enabled": true,
      "name": "Allow All",
      "match": "<all_urls>",
      "action": "allow",
      "responseHeaders": [{
        "name": "Access-Control-Allow-Origin",
        "value": "*"
      }]
    };

    if (typeof GM_setValue === "function") {
      GM_setValue("corsDisable", corsDisable);
    } else {
      // Fallback for Safari
      localStorage.setItem("corsDisable", JSON.stringify(corsDisable));
    }

    if (typeof GM_addStyle == 'undefined') {
      GM_addStyle = (css) => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
        }
    }
    if (typeof GM_setValue === "function") {
      GM_setValue("corsDisable", JSON.stringify(corsDisable));
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem("corsDisable", JSON.stringify(corsDisable));

    }



    // Frontend
    var html = /*html*/`
    <div id="raidhammer" class="raidhammer">
    <style>
        .raidhammer {
            position: fixed;
            bottom: 10px;
            right: 500px;
            z-index: 99999999;
            background-color: var(--color-background-base);
            color: var(--color-text-base);
            border: var(--border-width-default) solid var(--color-border-base);
            box-shadow: var(--shadow-elevation-2);
            padding: 5px;
            min-width: 500px;
        }

        .raidhammer .svg {
            color: "${themeTextColor}"
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
            min-width: 40px;
        }

        .raidhammer button.unbanAll {
            var(--color-text-button-primary);
            background: #34ae0c;
            min-width: 40px;
        }

        .raidhammer button.unban {
            var(--color-text-button-primary);
            background: #000000;  /* #34ae0c; */
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
        <span style="flex-grow: -1;"></span>
        <button class="princess"><img src="https://raw.githubusercontent.com/TwitchmodsDACH/Bann-Hammer/main/dokumentation/magicwand.png"  title="Für die Prinzessinnen unter uns" width="20px" height="20px"></button>

        <span style="flex-grow: 1;"></span>
        <h5 id="header" class="logo">

            <a href="https://github.com/TwitchmodsDACH/Bann-Hammer" target="_blank" style="color: ${themeTextColor};" titel="Zum Bann-Hammer Repository">Bann-Hammer&nbsp;&nbsp;
              <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="5 5 1280 1280" style="color: ${themeTextColor};fill: currentcolor;align:center;">
                <path d="M517 1c-16 3-28 10-41 22l-10 10 161 160 161 161 2-2c6-4 17-19 21-25 10-19 12-44 4-64-6-14-5-13-120-129L576 17c-8-7-18-12-27-15-8-1-25-2-32-1zM249 250 77 422l161 161 161 161 74-74 74-75 18 19 18 18-2 4c-4 6-4 14-1 20a28808 28808 0 0 0 589 621c4 2 6 3 13 3 6 0 8-1 13-3 6-4 79-77 82-83 4-9 4-21-2-29l-97-93-235-223-211-200c-51-47-73-68-76-69-6-3-13-3-19 0l-5 3-18-18-18-18 74-74 74-74-161-161L422 77 249 250zM23 476a75 75 0 0 0-10 95c4 6 219 222 231 232 8 7 16 11 26 14 6 2 10 2 22 2s14 0 22-2l14-6c5-4 20-16 24-21l2-2-161-161L32 466l-9 10z"/>
              </svg>
              &nbsp;&nbsp;TwitchModsDACH Edition</a>
        </h5><br>

        <span style="flex-grow: 1;"></span>
        <button class="closeBtn">_</button>
    </div>
    <div id="import" class="import" style="display:none;">
        <textarea id="textfield" placeholder="Ein Benutzername pro Zeile"></textarea>
        <div style="text-align:right;">
            <input type="text" id="banReason" style="width:450px" placeholder="Gib einen Bann-Grund an" />
            <button class="importBtn" title="Benutzer zur Liste hinzufügen">➕</button>
        </div>
        <div style="align:center">
          <button class="mdgBtnTrolls" style="width:32%" title="Importiert die mdg_hate_trolls Liste">➕ mdg_hate_trolls</button>
          <button class="mdgBtnViewerBots" style="width:33%" title="Importiert mdg_hate_trolls Liste">➕ mdg_viewer_bots</button>
          <button class="mdgBtnUnban" style="width:32%;color:#34ae0c" title="Importiert mdg_unban Liste">➕ MDG_UNBAN</button>
        </div>
        <div style="align:center">
          <button class="mdgBtnFlirtyMad" style="width:32%" title="Importiert mdg_flirty_mad Liste">➕ mdg_flirty_mad </button>
          <button class="mdgBtnFollowBot" style="width:33%" title="Importiert mdg_follow_bots Liste">➕ mdg_follow_bots</button>
          <button class="tmdBtnUnban" style="width:32%;color:#34ae0c" title="Importiert TMD_unban Liste">➕ TMD_UNBAN</button>
        </div>
        <div style="align:center">
          <button class="mdgBtnAdvertising" style="width:32%" title="Importiert mdg_advertising Liste">➕ mdg_advertising</button>
          <button class="mdgBtnSpamBots" style="width:33%" title="Importiert mdg_spam_bots Liste">➕ mdg_spam_bots</button>
          <button class="tmdBtnCrossban" style="width:32%" title="Importiert tmd_crossbans Liste">➕ tmd_crossbans</button>
        </div>
    </div>
    <div class="body">
        <div class="list"></div>
        <div style="display: flex; margin: 5px;">
          <span style="flex-grow: 2;"></span>
          <div id="buttons" class="buttons">
            <button class="back" title="Zurück">⬅</button>
            <button class="comanderRoot" title="Öffnet ComanderRoot" onclick="window.open('https://twitch-tools.rootonline.de','_blank')">🤖</button>
            <button class="sLabs" title="Öffnet Streamlabs" onclick="window.open('https://streamlabs.com/dashboard','_blank')"><img src="https://cdn.streamlabs.com/static/imgs/streamlabs-logos/app-icon/streamlabs-app-icon.png" height="17px" style = "position:relative; top:2px;"></button>
            <button class="sElements" title="Öffnet Streamelements" onclick="window.open('https://streamelements.com/dashboard','_blank')"><img src="https://avatars.githubusercontent.com/u/16977512?s=17&v=4" style="position:relative; top:2px;"></button>
            <button class="chatstats" title="Öffnet SullyGnome Kanal-Statistiken für den aktuellen Kanal" onclick="window.open('https://sullygnome.com/channel/${activeChannel}','_blank')">📈</button>
            <button class="modLogger" title="Öffnet ModLogger für den aktuellen Kanal" onclick="window.open('https://jvpeek.github.io/twitchmodlogger/?channel=${activeChannel}','_blank')">🗄</button>
            <button class="chatDeepStats" title="Öffnet ChatStats für den aktuellen Kanal" onclick="window.open('https://echtkpvl.github.io/echt-twitch/chat-stats.html?channel=${activeChannel}','_blank')">🩻</button>
            <button class="pause" id="pause" title="Pause/Play">⏸</button>
            <button class="ignoreAll" title="Liste leeren">🗑</button>
            <button class="unbanAll" title="Alle auf der Liste entbannen">⚕</button>
            <button class="banAll" title="Alle auf der Liste bannen">👹</button>
          </div>
        </div>
    </div>
    <div id="footer" class="footer">
    <a href="https://github.com/TwitchmodsDACH/Bannlisten" target="_blank" style="color: ${themeTextColor};" id="replaceFooter" titel="Zur Bannliste">TwitchModsDACH Bannlisten</a>&nbsp;-&nbsp;
    <a id="manoooo" href="https://github.com/TwitchmodsDACH/Bann-Hammer/raw/main/bannhammer.user.js" title="Aktuelle Bannhammer Version installieren">${updateText}</a>&nbsp;-&nbsp;&nbsp;${myVersion}
    </div>`;

    // PauseButton
    function pauseBanAll() {
       isPaused = !isPaused;
       if (isPaused) {
         var btn = document.getElementById("pause");
         btn.value = 'pause';
         btn.innerHTML = 'Pause';
       } else {
         var btn = document.getElementById("pause");
         btn.value = 'unpause';
         btn.innerHTML = 'Unpause';
       }
    }

    // modal
    const d = document.createElement("div");
    d.style.display = 'none';
    d.innerHTML = html;
    const textarea = d.querySelector("textarea");

    // activation button
    const activateBtn = document.createElement('button');
    activateBtn.innerHTML = `
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 1280 1280" style="color: ${themeTextColor}; fill: currentcolor;">
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
    activateBtn.setAttribute('id', 'hammer');
    activateBtn.setAttribute('title', 'Bann-Hammer');
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
    d.querySelector(".pause").onclick = togglePause;
    d.querySelector(".princess").onclick = toggleTheme;
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
    function toggleTheme() {
        var dataHeader = document.getElementById('header').innerHTML;
        var dataFooter = document.getElementById('footer').innerHTML;
        var dataHammer = document.getElementById('hammer').innerHTML;
        var dataLogo = document.getElementById('empty').innerHTML;
        if (dataHeader.match("#34AE0C") && dataFooter.match("#34AE0C") && dataHammer.match("#34AE0C")) {
          console.log("huh? I'm princess now!")
          dataHeader = dataHeader.replace(/#34AE0C/g, themePrincess);
          dataFooter = dataFooter.replace(/#34AE0C/g, themePrincess);
          dataHammer = dataHammer.replace(/#34AE0C/g, themePrincess);
          dataLogo = dataLogo.replace(/https:\/\/github\.com\/TwitchmodsDACH\/Bann-Hammer\/blob\/main\/logo\.png\?raw\=true/gi, "https://thumbs.gfycat.com/NegativeHalfDwarfmongoose-size_restricted.gif");
          document.getElementById('header').innerHTML = dataHeader;
          document.getElementById('footer').innerHTML = dataFooter;
          document.getElementById('hammer').innerHTML = dataHammer;
          document.getElementById('empty').innerHTML = dataLogo;
          const canvas = document.createElement("canvas");
          canvas.style.position = "fixed";
          canvas.style.top = "0";
          canvas.style.left = "0";
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.zIndex = "-1";

          // Das Canvas auf eine höhere Auflösung skalieren
          canvas.width = window.innerWidth * window.devicePixelRatio * 2;
          canvas.height = window.innerHeight * window.devicePixelRatio * 2;

          // Das Canvas auf die Bildschirmgröße skalieren
          canvas.style.width = window.innerWidth + "px";
          canvas.style.height = window.innerHeight + "px";

          const targetElement = document.getElementById("raidhammer");
          targetElement.appendChild(canvas);

          const context = canvas.getContext("2d");
          context.scale(window.devicePixelRatio, window.devicePixelRatio);

          function drawStars(twinkleSpeed) {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 3;
            const numStars = 350;

            context.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < numStars; i++) {
              const x = Math.random() * canvas.width;
              const y = Math.random() * canvas.height;
              const starRadius = Math.random() * radius;

              // Sterne zeichnen
              const gradient = context.createRadialGradient(x, y, 0, x, y, starRadius);
              gradient.addColorStop(0, "#fff");
              gradient.addColorStop(1, "transparent");
              context.beginPath();
              context.arc(x, y, starRadius, 0, Math.PI * 2);
              context.fillStyle = gradient;
              context.fill();

              // Funkeln hinzufügen
              const twinkleX = Math.random() * canvas.width;
              const twinkleY = Math.random() * canvas.height;
              const twinkleRadius = Math.random() * starRadius;

              const twinkleGradient = context.createRadialGradient(
                twinkleX,
                twinkleY,
                0,
                twinkleX,
                twinkleY,
                twinkleRadius
              );
              twinkleGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.abs(Math.sin(twinkleSpeed))})`);
              twinkleGradient.addColorStop(1, "transparent");

              context.beginPath();
              context.arc(twinkleX, twinkleY, twinkleRadius, 0, Math.PI * 2);
              context.fillStyle = twinkleGradient;
              context.fill();
            }
            setTimeout(() => {
              requestAnimationFrame(() => drawStars(twinkleSpeed));
            }, twinkleSpeed);
          }

          drawStars(200);
        } else {
          console.log("Muh? I'm no longer a princess anymore")
          dataHeader = dataHeader.replace(/#FF1493/g, themeNormal);
          dataFooter = dataFooter.replace(/#FF1493/g, themeNormal);
          dataHammer = dataHammer.replace(/#FF1493/g, themeNormal);
          dataLogo = dataLogo.replace(/https:\/\/thumbs\.gfycat\.com\/NegativeHalfDwarfmongoose-size_restricted.gif"/gi, "https://github.com/TwitchmodsDACH/Bann-Hammer/blob/main/logo.png?raw=true")
          document.getElementById('header').innerHTML = dataHeader;
          document.getElementById('footer').innerHTML = dataFooter;
          document.getElementById('hammer').innerHTML = dataHammer;
          document.getElementById('empty').innerHTML = dataLogo;
          const canvas = document.createElement("canvas");
          const targetElement = document.getElementById("body");
          targetElement.removeChild(canvas);
        }
    }

    function togglePause() {
      if (isPaused) {
        isPaused = false;
        var btn = document.getElementById("pause");
         btn.value = 'pause';
         btn.innerHTML = '⏸';
      } else {
        isPaused = true;
        var btn = document.getElementById("pause");
         btn.value = 'play';
         btn.innerHTML = '▶';
      }
    }

    function show() {
        console.log(LOGPREFIX, 'Show');
        d.style.display = '';
        renderList();
        console.log(activeChannel)
    }

    function hide() {
        console.log(LOGPREFIX, 'Hide');
        d.style.display = 'none';
    }


    function toggle() {
      function checkVersion() {
        fetch("https://raw.githubusercontent.com/TwitchmodsDACH/Bann-Hammer/main/bannhammer.user.js")
          .then((response) => response.text())
          .then((text) => {
            var regex = /@version\s+(\d+\.\d+\.\d+\.\d+)/;
            var match = regex.exec(text);
            var newVersion = match[1];
            console.log("erster", myVersion, newVersion)
            if ( myVersion != newVersion) {
            document.getElementById('manoooo').innerHTML = "🚨 Update verfügbar 🚨"
            }
          });
      }
      if (d.style.display !== 'none') hide();
        else show();
        checkVersion();
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
    document.getElementById("replaceFooter").innerHTML = "Alle Bannlisten anzeigen"
    document.getElementById("replaceFooter").href = "https://github.com/TwitchmodsDACH/Bannlisten"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste 'mdg_hate_troll_list.txt' anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_hate_troll_list.txt"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste mdg_unbanlist.txt anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_unbanlist.txt"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste mdg_viewer_bot_list.txt anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_viewer_bot_list.txt"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste mdg_flirt_mad_manipulate_list.txt anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_flirt_mad_manipulate_list.txt"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste mdg_follower_bot_list.txt anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_follower_bot_list.txt"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste mdg_unauthorized_advertising_list.txt anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_unauthorized_advertising_list.txt"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste mdg_spam_bot_list.txt anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/mdg_spam_bot_list.txt"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste tmd_unbanlist.txt anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/tmd_unbanlist.txt"
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
      document.getElementById("replaceFooter").innerHTML = "Geladene Liste tmd_cross_banlist.txt anzeigen"
      document.getElementById("replaceFooter").href = "https://raw.githubusercontent.com/TwitchmodsDACH/Bannlisten/main/tmd_cross_banlist.txt"
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
        if (isPaused) {
          // breake until button pressed again
          while (isPaused) {
          await delay(1000);
        }
      }
      banItem(user);
      await delay(125);
      }
    }

    async function unbanAll() {
      console.log(LOGPREFIX, 'Banning all...', queueList);
      for (const user of queueList) {
        if (isPaused) {
          // breake until button pressed again
          while (isPaused) {
          await delay(1000);
        }
      }
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
      d.querySelector(".pause").style.display = queueList.size ? '' : 'none';
      d.querySelector(".unbanAll").style.display = queueList.size ? '' : 'none';
      const renderItem = item => `
      <li>
        <button class="accountage" data-user="${item}" title="Schreibt ''!accountage ${item}'' in den Chat">?</button>
        <button class="ignore" data-user="${item}" title="Benutzer aus Liste entfernen">❌</button>
        <button class="unban" data-user="${item}" title="Benutzer entbannen">Unban</button>
        <button class="ban" data-user="${item}" title="Benutzer bannen">Ban</button>
        <span><a href="https://twitch-tools.rootonline.de/followinglist_viewer.php?username=${item}" title="Dieser User folgt....(Weiterleitung zu comanderroot)" target="_blank" rel="noopener noreferrer">${item}</a></span>
      </li>`;

      let inner = queueList.size ? [...queueList].map(user => renderItem(user)).join('') : `
        <div id="empty" class="empty">
          <img class="toggleImport" src="https://github.com/TwitchmodsDACH/Bann-Hammer/blob/main/logo.png?raw=true" title="Start Bann-Hammer" width="370px" style="cursor: pointer; max-height: 80px; min-height: 80px">
        </div>`;
        d.querySelector('.list').innerHTML = `
        <ul>
          ${inner}
        </ul>`;
    }
})();

