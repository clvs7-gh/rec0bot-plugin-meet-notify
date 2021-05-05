import { Logger } from '@log4js-node/log4js-api';
import fetch from 'node-fetch';
import * as path from 'path';
import { BotProxy } from './bot-proxy.interface';
import { MessageContext } from './message-context.interface';

let mBot: BotProxy;
let logger: Logger;
let metadata: { [key: string]: string };

const mMeetingStatus: { [url: string]: boolean } = {};

const mMeetingMember: { [url: string]: string[] } = {};

const NOTIFY_CHANNEL: string = process.env.REC0_ENV_MEET_NOTIFY_CHANNEL || 'meeting-notify';
const ROOM_API_URLS: string[] =
    (process.env.REC0_ENV_MEET_NOTIFY_ROOM_API_URLS || 'https://meet.jitsi/room?room=example').split(',').map(v => v.trim());

ROOM_API_URLS.forEach(v => mMeetingStatus[v] = false);
ROOM_API_URLS.forEach(v => mMeetingMember[v] = []);

const REC0_ENV_MEET_NOTIFY_BASE_WEB_URL: string = process.env.REC0_ENV_MEET_NOTIFY_BASE_WEB_URL || 'https://meet.jitsi/';

const checkRoom = async (apiUrl: string): Promise<[boolean, string[]]> => {
    const res = await fetch(apiUrl);
    if (res.ok) {
        const member: string[] = [];
        for (const v of (await res.json())){
          member.push(v.display_name)
        }
        return [true, member];
    }

    return [false, []];
};

const run = async () => {
    for ( const roomUrl of ROOM_API_URLS ) {
        let _isHeld = false;
        let member: string[];
        try {
            [_isHeld, member] = await checkRoom(roomUrl);
        } catch (e) {
            logger.warn('Failed to access room API: ', e);
            continue;
        }

        if (_isHeld !== mMeetingStatus[roomUrl]) {
            mMeetingStatus[roomUrl] = _isHeld;
            const repName = member[0];
            const roomName = (new URL(roomUrl)).searchParams.get('room') || '';
            const webUrl = new URL(roomName, REC0_ENV_MEET_NOTIFY_BASE_WEB_URL);
            const onBeginText = roomName ?
                `${repName} さんが <${webUrl}|${roomName}> でミーティングを始めました！` :
                `${repName} さんがミーティングを始めました！`;
            const onEndText = roomName ?
                `${roomName} のミーティングが終了しました` :
                `ミーティングが終了しました`;
            await mBot.sendTalk(await mBot.getChannelId(NOTIFY_CHANNEL), _isHeld ? onBeginText : onEndText);
        }

        if ( _isHeld === true ) {
            for (const m of mMeetingMember[roomUrl]){
                const exit = (member.indexOf(m) === -1);
                if ( exit ) {
                    const onExitText = `${m} さんが退出しました`;
                    await mBot.sendTalk(await mBot.getChannelId(NOTIFY_CHANNEL), onExitText);
                }
            }

            for (const m of member){
                const entry = (mMeetingMember[roomUrl].indexOf(m) === -1);
                if ( entry ) {
                    const onEntryText = `${m} さんが参加しました`;
                    await mBot.sendTalk(await mBot.getChannelId(NOTIFY_CHANNEL), onEntryText);
                }
            }

            mMeetingMember[roomUrl] = Array.from(member);
        }
    }
};

export const init = async (bot: BotProxy, options: { [key: string]: any }): Promise<void> => {
    mBot = bot;
    logger = options.logger || console;
    metadata = await import(path.resolve(__dirname, 'package.json'));

    logger.info(`${metadata.name} plugin v${metadata.version} has been initialized.`);
};

export const onStart = () => {
    logger.debug('onStart()');
    run();
};

export const onStop = () => {
    logger.debug('onStop()');
};

export const onMessage = async (message: string, context: MessageContext, data: { [key: string]: any }) => {
    // Nop
};

export const onPluginEvent = async (eventName: string, value?: any, fromId?: string) => {
    if (eventName === 'scheduled:check-room-api') {
        await run();
    }
};
