# Meet notify plugin for REC0-Bot

## What is this?
A Rec0-bot plugin which notify start/end of meeting on Jitsi Meet.

## Requirements
- Jitsi Meet instance whose mod_muc_size module is enabled.

## How to build
Run `npm i && npm run build` to build.  
If you want to clean up built files, run `npm run clean`.

## Environment variables
- `REC0_ENV_MEET_NOTIFY_CHANNEL` : A channel name which rec0bot posts notification to. Default is `meeting-notify`.
- `REC0_ENV_MEET_NOTIFY_ROOM_API_URLS` : URLs which target to room API. Each url is comma-separated. All parameters should be included into the url. Default is `https://meet.jitsi/room?room=example`
- `REC0_ENV_MEET_NOTIFY_BASE_WEB_URL` : URLs which target to jitsi meet's frontend. Default is `https://meet.jitsi/`

## Configuration of interval time
- By default, this plugin access API every minute. If you want to change this interval, please edit `scheduled_events` section in package.json.

## Notice
Currently, i18n feature is not supported (texts are hard-coded).
If you use this plugin outside of Japanese environment, please replace texts in this plugin script with your one.

## Author
clvs7 (Arisaka Mayuki)
shiba44

## License
Apache License 2.0
