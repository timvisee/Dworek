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

// Native droid instance
var nativeDroid = null;

$(function() {
    // Initialize NativeDroid, and store it's instance
    nativeDroid = $.nd2();

    // Build
    nativeDroid.build();
});

// Initialize NativeDroid on page initialization
$(document).bind("pageinit", function() {
    // Make sure the native droid instance is available
    if(nativeDroid === null)
        return;

    // Build the page
    nativeDroid.build();
});

/**
 * Get the active jQuery mobile page.
 *
 * @return DOM element of the current page.
 */
function getActivePage() {
    return $.mobile.pageContainer.pagecontainer('getActivePage');
}

/**
 * Show a notification as configured.
 * This function can be used to show in-page toast, or native notifications.
 *
 * @param {string} message Message to show in the notification.
 * @param {Object} [options] Notification options object.
 * @param {boolean} [options.toast=true] True to show an in-page toast notification, false if not.
 * @param {boolean} [options.native=false] True to show a native notification if supported, false if not.
 * @param {boolean} [options.vibrate=false] True to vibrate the user's device if supported, false if not.
 * @param {Array} [options.vibrationPattern=[500, 250, 500]] Array with vibration pattern timings in milliseconds.
 * @param {Number} [options.ttl=4000] Notification time to live in milliseconds, if supported.
 */
// TODO: Make vibrations configurable
// TODO: Implement native notifications
// TODO: Make action buttons configurable
// TODO: Add option to show an error notification (which has a red background or something)
function showNotification(message, options) {
    // Default options
    var defaultOptions = {
        toast: true,
        native: false,
        vibrate: false,
        vibrationPattern: [500, 250, 500],
        ttl: 4000
    };

    // Set the default options parameter
    if(options === undefined)
        options = {};

    // Merge the options with the default options
    options = merge(defaultOptions, options);

    // Parse the vibration pattern option if set
    if(!Array.isArray(options.vibrationPattern))
        options.vibrationPattern = [options.vibrationPattern];

    // Show a toast notification
    if(options.toast) {
        // Show the toast notification
        new $.nd2Toast({
            message,
            action: {
                title: "Close",
                fn: function() {},
                color: 'lime'
            },
            ttl: options.ttl
        });
    }

    // Vibrate the phone
    if(options.vibrate)
        if("vibrate" in navigator)
            window.navigator.vibrate(options.vibrationPattern);
}

/**
 * Called to show a toast to the user to tell a feature is not yet available.
 */
function featureNotAvailable() {
    showNotification('Feature not available yet', {
        toast: true,
        native: false,
        vibrate: true
    });
}

// TODO: Complete this feature
function showNativeNotification() {
    // Let's check if the browser supports notifications
    if(!('Notification' in window))
        alert('This browser does not support desktop notification');

    // Let's check whether notification permissions have already been granted
    else if(Notification.permission === 'granted')
        // If it's okay let's create a notification
        var notification = new Notification('Feature not available yet');

    // Otherwise, we need to ask the user for permission
    else if(Notification.permission !== 'denied') {
        Notification.requestPermission(function(permission) {
            // If the user accepts, let's create a notification
            if(permission === 'granted')
                var notification = new Notification('Feature not available yet');
        });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them any more.
}

// Nickname randomization
$(document).bind("pageinit", function() {
    // Get the elements
    const nicknameField = $('#field-nickname');
    const nicknameRandomizeButton = $('.nickname-random-btn');

    /**
     * Set the nickname field to a random nickname.
     */
    function setRandomNickname() {
        const animationClass = 'animated';
        const animationTypeClass = 'bounceInLeft';

        // Remove animation classes from previous times
        if(nicknameField.hasClass(animationTypeClass))
            nicknameField.removeClass(animationTypeClass);

        // Animate the text field and set a random nickname next tick
        setTimeout(function() {
            nicknameField.addClass(animationClass + ' ' + animationTypeClass);
            nicknameField.val(getRandomNickname());
        }, 1);
    }

    // Check whether we should randomize on page creation
    if(nicknameField.data('randomize'))
        setRandomNickname();

    // Randomize the nickname on random button click
    nicknameRandomizeButton.click(function(e) {
        // Prevent the default action
        e.preventDefault();

        // Put a random nickname in the field
        setRandomNickname();
    });
});

// User role modification
$(document).bind("pageinit", function() {
    // Get the elements
    const buttonChangeRoles = $('.action-change-user-roles');
    const popup = $('#popupChangeUserRole');
    const checkboxNamePrefix = 'checkbox-user-';
    const checkboxSelector = 'input[type=checkbox][name^=' + checkboxNamePrefix + ']:checked';
    const checkboxSelectorUser = (userId) => 'input[type=checkbox][name=' + checkboxNamePrefix + userId.trim() + ']';
    const popupGameSelector = 'input[name=field-game]';
    const popupTeamSelector = 'select[name=field-team]';
    const popupSpecialSelector = 'select[name=field-special]';
    const popupSpectatorSelector = 'select[name=field-spectator]';

    // Handle button click events
    buttonChangeRoles.click(function(e) {
        // Prevent the default click operation
        e.preventDefault();

        // Find the user checkboxes on the page that is currently active
        const checkboxes = getActivePage().find(checkboxSelector);

        // Show a warning if no user is selected
        if(checkboxes.length === 0) {
            showNotification('Please select the users to change', {
                toast: true,
                native: false,
                vibrate: true,
                vibrationPattern: 50
            });
            return;
        }

        // Create a list of user IDs
        var userIds = [];

        // Loop through all checkboxes and put the user ID in the list
        checkboxes.each(function() {
            userIds.push($(this).attr('name').replace(checkboxNamePrefix, '').trim());
        });

        // Open the user dialog
        popup.popup('open', {
            transition: 'pop'
        });

        // Find the apply button of the popup
        const applyButton = popup.find('.action-apply');

        // Unbind the previous click event, and bind a new one
        applyButton.unbind('click');
        applyButton.click(function(e) {
            // Prevent the default action
            e.preventDefault();

            // Get the team, special and spectator fields
            const gameField = popup.find(popupGameSelector);
            const teamField = popup.find(popupTeamSelector);
            const specialField = popup.find(popupSpecialSelector);
            const spectatorField = popup.find(popupSpectatorSelector);

            // Get the game
            const gameId = gameField.val();

            // Get the team selector value
            const teamValue = teamField.val();

            // Determine whether the users will be special players and/or spectators
            const special = specialField.val() == 'true';
            const spectator = spectatorField.val() == 'true';

            // Create an role change object to send to the server
            const updateObject = {
                game: gameId,
                users: userIds,
                role: {
                    team: teamValue,
                    special,
                    spectator
                }
            };

            // Disable all checkboxes for the selected users
            checkboxes.each(function() {
                $(this).parent().addClass('ui-disabled');
            });

            // Disable the change roles button
            buttonChangeRoles.addClass('ui-disabled');

            // Callback on error
            const onError = function(message) {
                // Define the error message
                if(typeof message !== 'string')
                    message = 'Failed to change user roles';
                const errorMessage = 'Error: ' + message;

                // Show an error notification
                showNotification(errorMessage, {
                    toast: true,
                    native: false,
                    vibrate: true
                });

                // Revert the checkbox states
                userIds.forEach(function(userId) {
                    // Find it's checkbox
                    const checkbox = getActivePage().find(checkboxSelectorUser(userId));

                    // Enable the checkbox
                    checkbox.parent().removeClass('ui-disabled');
                });

                // Enable the change roles button
                buttonChangeRoles.removeClass('ui-disabled');
            };

            // Do an request to change the user roles
            $.ajax({
                type: "POST",
                url: '/ajax/user/changeRoles',
                data: {
                    data: JSON.stringify(updateObject)
                },
                dataType: 'json',
                success: function(data) {
                    // Show an error message if any kind of error occurred
                    if(data.status != 'ok' || data.hasOwnProperty('error')) {
                        onError(typeof data.error.message === 'string' ? data.error.message : undefined);
                        return;
                    }

                    // Get the list of updated users
                    const updatedUsers = data.updatedUsers;
                    const updatedUsersCount = updatedUsers.length;

                    // Show an error notification
                    showNotification('Changes roles for ' + updatedUsersCount + ' user' + (updatedUsersCount != 1 ? 's' : ''), {
                        toast: true,
                        native: false,
                        vibrate: true,
                        vibrationPattern: 50
                    });

                    // Loop through the list of updated users and remove their checkboxes
                    updatedUsers.forEach(function(userId) {
                        // Find it's checkbox
                        const checkbox = getActivePage().find(checkboxSelectorUser(userId));

                        // Remove the parent checkbox from the page
                        checkbox.parent().remove();
                    });

                    // Loop through the original list of user IDs
                    userIds.forEach(function(userId) {
                        // Check whether this user ID hasn't been covered
                        if(updatedUsers.indexOf(userId) !== -1)
                            return;

                        // Find it's checkbox
                        const checkbox = getActivePage().find(checkboxSelectorUser(userId));

                        // Enable the checkbox
                        checkbox.parent().removeClass('ui-disabled');
                    });

                    // Enable the change roles button
                    buttonChangeRoles.removeClass('ui-disabled');
                },
                error: onError
            });

            // Close the popup
            popup.popup('close');
        });
    });
});

// Team creation
$(document).bind("pageinit", function() {
    // Get the elements
    const buttonCreateTeam = $('.action-create-team');
    const popup = $('#popupCreateTeam');
    const popupGameField = 'input[name=field-game]';
    const popupTeamNameField = 'input[name=field-team-name]';
    const teamList = getActivePage().find('.team-list');
    const noTeamLabel = getActivePage().find('.no-teams');

    // Handle button click events
    buttonCreateTeam.click(function(e) {
        // Prevent the default click operation
        e.preventDefault();

        // Open the team creation dialog
        popup.popup('open', {
            transition: 'pop'
        });

        // Find the create button of the popup
        const createButton = popup.find('.action-create');

        // Unbind the previous click event, and bind a new one
        createButton.unbind('click');
        createButton.click(function(e) {
            // Prevent the default action
            e.preventDefault();

            // Get the team name
            const teamField = popup.find(popupTeamNameField);
            const gameField = popup.find(popupGameField);

            // Get the game ID
            const gameId = gameField.val();

            // Get the team selector value
            const teamName = teamField.val();

            // Create an object to send to the server
            const createObject = {
                game: gameId,
                teamName: teamName
            };

            // Disable the create team button
            buttonCreateTeam.addClass('ui-disabled');

            // Callback on error
            const onError = function(message) {
                // Define the error message
                if(typeof message !== 'string')
                    message = 'Failed to create team';
                const error = 'Error: ' + message;

                // Show an error notification
                showNotification(error, {
                    toast: true,
                    native: false,
                    vibrate: true
                });

                // Enable the create team button
                buttonCreateTeam.removeClass('ui-disabled');
            };

            // Do an request to create the team
            $.ajax({
                type: "POST",
                url: '/ajax/team/createTeam',
                data: {
                    data: JSON.stringify(createObject)
                },
                dataType: 'json',
                success: function(data) {
                    // Show an error message if any kind of error occurred
                    if(data.status != 'ok' || data.hasOwnProperty('error')) {
                        onError(typeof data.error.message === 'string' ? data.error.message : undefined);
                        return;
                    }

                    // Show an error notification
                    showNotification('Team created successfully!', {
                        toast: true,
                        native: false,
                        vibrate: true,
                        vibrationPattern: 50
                    });

                    // Get the ID of the created team
                    var teamId = data.team;

                    // Append the team to the team list
                    // TODO: Append team ID here
                    teamList.append('<div class="wow fadeInUp">' +
                        '    <input type="checkbox" name="checkbox-team-' + teamId + '" id="checkbox-team-' + teamId + '">' +
                        '    <label for="checkbox-team-' + teamId + '">' + teamName + '</label>' +
                        '</div>');

                    // Remove the no teams label if it exists
                    noTeamLabel.remove();

                    // Trigger page creation, to properly style the new checkbox
                    getActivePage().trigger('create');

                    // Enable the create team button
                    buttonCreateTeam.removeClass('ui-disabled');
                },
                error: onError
            });

            // Close the popup
            popup.popup('close');
        });
    });
});

// Team deletion
$(document).bind("pageinit", function() {
    // Get the elements
    const buttonDeleteSelected = $('.action-delete-selected');
    const popup = $('#popupDeleteTeam');
    const checkboxNamePrefix = 'checkbox-team-';
    const checkboxSelector = 'input[type=checkbox][name^=' + checkboxNamePrefix + ']:checked';
    const checkboxSelectorUser = (userId) => 'input[type=checkbox][name=' + checkboxNamePrefix + userId.trim() + ']';
    const popupGameSelector = 'input[name=field-game]';

    // Handle button click events
    buttonDeleteSelected.click(function(e) {
        // Prevent the default click operation
        e.preventDefault();

        // Find the user checkboxes on the page that is currently active
        const checkboxes = getActivePage().find(checkboxSelector);

        // Show a warning if no user is selected
        if(checkboxes.length == 0) {
            showNotification('Please select the teams to delete', {
                toast: true,
                native: false,
                vibrate: true,
                vibrationPattern: 50
            });
            return;
        }

        // Create a list of team IDs
        var teamIds = [];

        // Loop through all checkboxes and put the team ID in the list
        checkboxes.each(function() {
            teamIds.push($(this).attr('name').replace(checkboxNamePrefix, '').trim());
        });

        // Open the team deletion dialog
        popup.popup('open', {
            transition: 'pop'
        });

        // Find the delete button of the popup
        const deleteButton = popup.find('.action-delete');

        // Unbind the previous click event, and bind a new one
        deleteButton.unbind('click');
        deleteButton.click(function(e) {
            // Prevent the default action
            e.preventDefault();

            // Get the game field, and the current game ID
            const gameField = popup.find(popupGameSelector);
            const gameId = gameField.val();

            // Create an team delete object to send to the server
            const updateObject = {
                game: gameId,
                teams: teamIds
            };

            // Disable all checkboxes for the selected teams
            checkboxes.each(function() {
                $(this).parent().addClass('ui-disabled');
            });

            // Disable the delete selected button
            buttonDeleteSelected.addClass('ui-disabled');

            // Callback on error
            const onError = function(message) {
                // Define the error message
                if(typeof message !== 'string')
                    message = 'Failed to delete teams';
                const error = 'Error: ' + message;

                // Show an error notification
                showNotification(error, {
                    toast: true,
                    native: false,
                    vibrate: true
                });

                // Revert the checkbox states
                teamIds.forEach(function(teamId) {
                    // Find it's checkbox
                    const checkbox = getActivePage().find(checkboxSelectorUser(teamId));

                    // Enable the checkbox
                    checkbox.parent().removeClass('ui-disabled');
                });

                // Enable the delete selected button
                buttonDeleteSelected.removeClass('ui-disabled');
            };

            // Do an request to change the user roles
            $.ajax({
                type: "POST",
                url: '/ajax/team/deleteTeam',
                data: {
                    data: JSON.stringify(updateObject)
                },
                dataType: 'json',
                success: function(data) {
                    // Show an error message if any kind of error occurred
                    if(data.status != 'ok' || data.hasOwnProperty('error')) {
                        onError(typeof data.error.message === 'string' ? data.error.message : undefined);
                        return;
                    }

                    // Get the list of updated teams
                    const deletedTeams = data.deletedTeams;
                    const deletedTeamCount = deletedTeams.length;

                    // Show an error notification
                    showNotification('Deleted ' + deletedTeamCount + ' team' + (deletedTeamCount != 1 ? 's' : ''), {
                        toast: true,
                        native: false,
                        vibrate: true,
                        vibrationPattern: 50
                    });

                    // Loop through the list of deleted teams and remove their checkboxes
                    deletedTeams.forEach(function(teamId) {
                        // Find it's checkbox
                        const checkbox = getActivePage().find(checkboxSelectorUser(teamId));

                        // Remove the parent checkbox from the page
                        checkbox.parent().remove();
                    });

                    // Loop through the original list of team IDs
                    teamIds.forEach(function(teamId) {
                        // Check whether this team ID hasn't been covered
                        if(deletedTeams.indexOf(teamId) !== -1)
                            return;

                        // Find it's checkbox
                        const checkbox = getActivePage().find(checkboxSelectorUser(teamId));

                        // Enable the checkbox
                        checkbox.parent().removeClass('ui-disabled');
                    });

                    // Enable the delete selected button
                    buttonDeleteSelected.removeClass('ui-disabled');
                },
                error: onError
            });

            // Close the popup
            popup.popup('close');
        });
    });
});

/**
 * Check whether the given value is a JavaScript object.
 *
 * @param {*} value The value to check.
 * @return {boolean} True if the value is an object, false if not.
 */
// TODO: Move this function to some utilities file
function isObject(value) {
    // Get the value type
    const type = typeof value;

    // Compare the types and return the result
    return !!value && (type == 'object' || type == 'function');
}

/**
 * Merge an object recursively.
 * Object b overwrites a.
 *
 * @param {Object} a Object A.
 * @param {Object} b Object B.
 * @param {boolean} [recursive=true] True to merge recursively, false to merge flat objects.
 * @return {*} Merged object.
 */
// TODO: Move this function to some utilities file
function merge(a, b, recursive) {
    // Set the default value for the recursive param
    if(recursive === undefined)
        recursive = true;

    // Make sure both objects are given
    if(isObject(a) && isObject(b)) {
        // Loop through all the keys
        for(var key in b) {
            // Check whether we should merge two objects recursively, or whether we should merge flag
            if(recursive && isObject(a[key]) && isObject(b[key]))
                a[key] = merge(a[key], b[key], true);
            else
                a[key] = b[key];
        }
    }

    // Return the object
    return a;
}