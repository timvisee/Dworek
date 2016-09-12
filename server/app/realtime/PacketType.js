/******************************************************************************
 * Copyright (c) Dworek 2016. All rights reserved.                            *
 *                                                                            *
 * @author Tim Visee                                                          *
 * @website http://timvisee.com/                                              *
 *                                                                            *
 * Open Source != No Copyright                                                *
 *                                                                            *
 * Permission is hereby granted, free of charge, to any person obtaining a    *
 * copy of this software and associated documentation files (the "Software"), *
 * to deal in the Software without restriction, including without limitation  *
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,   *
 * and/or sell copies of the Software, and to permit persons to whom the      *
 * Software is furnished to do so, subject to the following conditions:       *
 *                                                                            *
 * The above copyright notice and this permission notice shall be included    *
 * in all copies or substantial portions of the Software.                     *
 *                                                                            *
 * You should have received a copy of The MIT License (MIT) along with this   *
 * program. If not, see <http://opensource.org/licenses/MIT/>.                *
 ******************************************************************************/

// Export the module, with the packet types
module.exports = {
    /**
     * Authentication request from the client to the server.
     *
     * Data:
     * - session: session token or an empty string
     */
    AUTH_REQUEST: 1,

    /**
     * Authentication response from the server to the client.
     *
     * Data:
     * - loggedIn: true if the user is logged in, false if not
     * - [valid]: true if the session was valid, false if not
     * - user: session user ID
     */
    AUTH_RESPONSE: 2,

    /**
     * Change the stage of the given game.
     *
     * Data:
     * - game: ID of the game to change.
     * - stage: new stage value
     */
    GAME_STATE_CHANGE: 3,

    /**
     * Packet to a client if the state of a game changed.
     *
     * Data:
     * - game: ID of the game that is changed
     * - stage: new stage value
     * - joined: true if the user joined this game, false if not.
     */
    GAME_STATE_CHANGED: 5,

    /**
     * Show a message from the server on the client.
     *
     * Data:
     * - message: message to show
     * - error: true if this is an error message, false if not
     * - type: 'dialog' or 'toast' as message type
     */
    MESSAGE_RESPONSE: 4
};
