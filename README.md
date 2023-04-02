# TwitchModsDACH Bann-Hammer
Der **TwitchModsDACH Bann-Hammer** ist ein Fork von [RaidHammer](https://github.com/victornpb/twitch-mass-ban).
Ein sehr nützliches Tool für Moderatoren die in mehreren Kanälen massenhaft Leute zu bannen haben.

Da uns manche Funktionen nicht genutzt oder schlecht implementiert sind und andere wiederum gefehlt haben,
wurde für die Community eine eigene Version des [RaidHammer](https://github.com/victornpb/twitch-mass-ban) erstellt.

- Funktion die TwitchModsDACH [Bannlisten](https://github.com/TwitchmodsDACH/Bannlisten) einfach per klick zu importieren wurde hinzugefügt.
- Ein unban-Funktion wurde eingebaut, welche ebenfalls zusätzlich zu eigenen Listen mit der von uns bereitgestellten Enbann-Liste genutzt werden kann.
- Die Möglichkeit einen Bann-Grund anzugeben wurde hinzugefügt.

Wir wollen unseren Mitglieder damit eine einfache Möglichkeit an die Hand geben, auf einwache Weise feingranular zu bestimmen, welche Liste gebannt werden soll.

## Status der Code-Übernahme
- TwitchModsDACH Bannlisten integriert
- Unban-Funktion hinzugefügt
- BannGrund-Funktion hinzugefügt
- erste unnütze Code-Schnippsel entfernt
- Follower Überwachung ist schlecht implementiert und wird aktuell nicht genutzt
- --Um das CORS Problem zu entgehen ist aktuell noch ein weiteres Plugin nötig--

## Voraussetzungen
- Eine Möglichkeit im Browser JavaScript auszuführen
	Chrome: [Violentmonkey](https://chrome.google.com/webstore/detail/violent-monkey/jinjaccalgkegednnccohejagnlnfdag) or [Tampermonkey](https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo)
	Firefox: [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/), [Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), or [Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)
	Edge: [Tempermonkey](https://microsoftedge.microsoft.com/addons/detail/iikmkjmpaadaobahmlepeloendndfphd) or [Violentmonkey](https://microsoftedge.microsoft.com/addons/detail/eeagobfjdenkkddmbclomhiblgggliao)
	Safari: [Tempermonkey](https://apps.apple.com/us/app/tampermonkey/id1482490089)
	Opera: [Termpermonkey](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)


## Installation
Sobald beide Browser Erweiterungen installiert, kann man in Termper-/Grease-/ViolentMonkey ein neues User Script hinzufügen.

Dazu in den sich öffnenden Editor den Inhalt der Datei [tmbbannhammer.user.js](https://github.com/TwitchmodsDACH/Bann-Hammer/raw/main/tmbbannhammer.user.js) kopieren und speichern.

![](dokumentation/allesaktiviert.png)

Sobald nun eine Twitch Seite besucht wird (ggf. offene Tabs neuladen) wird in einem Kanal in dem ihr Moderator seid unter dem Chat ein kleiner BannHammer angezeigt:

1. Durch anklicken öffnet sich der BannHammer

![](dokumentation/bannhammer.png)

2. Anklicken des Logos

![](dokumentation/bannhammer1.png)

3. Liste einfügen oder auswählen

![](dokumentation/bannhammer2.png)

4. Bannen/Entbannen

![](dokumentation/bannhammer3.png)

## Hinweise zur Benutzung

**WICHTIG**: Es darf nur einen Twitch Tab im Browser-Fenster geben, sobald ein weiteren Tab dazukommt, versucht der Bannhammer dort zu bannen.

**WICHTIG**: Das Tool arbeitet mit eurem Chatfenster. Klickt ihre da rein oder schreibet etwas, dann bringt ihr das Tool aus dem tritt. Das Tool ist nicht dafür gedacht, während der normladen Nutzung mit Tonnen von User betankt zu werden. Möchte man das machen ist die Empfehlung: __eigenes Browserfenster in dem nur der Kanal offen ist in dem gebannt werden soll und sonst nichts.__

**WICHTIG**: __Nicht mehrere Kanäle gleichzeitig bannen!__ Hintergrund: **Shadowban-Gefahr**, da zu viele Anfragen in zu kurzer Zeit bei Twitch aufschlagen. Das mag Twitch nicht!

**HINWEIS**: Bei einigen kommt es je nach Einstellungen mit Erweiterungen wie Frankers/BetterTTV/7TVAPP zu Problem.
Hier ggf. für das Bannen diese Erweiterungen deaktivieren, wenn man Probleme hat.

### Postion des BannHammer Menü
Wem die Position des Menüs nicht gefällt, diese kann im Code angepasst werden

```
        .raidhammer {
            position: fixed;
            bottom: 10px;
            right: 800px;      <<< je kleiner, umso näher am Mod-Schwert unter dem Chat
            z-index: 99999999;
            background-color: var(--color-background-base);
            color: var(--color-text-base);
            border: var(--border-width-default) solid var(--color-border-base);
            box-shadow: var(--shadow-elevation-2);
            padding: 5px;
            min-width: 500px;
      }
```

## Support
Unsere Mitglieder sind herzlich eingeladen im Discord ein Ticket im Kanal tmd-support zu öffnen.
