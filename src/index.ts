import { config as dotenv } from 'dotenv';
import Client from './structures/Client';

// load environmental variables
dotenv();

// create the client and start the bot
new Client({
    disabledEvents: ['TYPING_START'],
}).start();
