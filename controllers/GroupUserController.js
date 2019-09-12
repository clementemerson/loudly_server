const VError = require('verror');
const assert = require('assert');
const check = require('check-types');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');
const GroupUsers = require('../db/groupusers');
const Users = require('../db/users');

const ControllerHelper = require('./ControllerHelper');

module.exports = {
    /**
     * To add an user to the group.
     * Only ADMINs can add an user to the group.
     *
     * Tested on: 19-Aug-2019
     * {"module":"groups", "event":"addUser", "messageid":5818, "data":{"groupid": 3000, "user_id":2001, "permission":"USER"}}
     *
     * @param {number} userid        ID of the user, who makes the request
     * @param {number[]} useridsToAdd   ID of the user, to be added
     * @param {number} groupid       ID of the group
     * @param {string} permission    Permission of the new user
     * @return {Status}
     *
     * @throws {errors.errorNotAnAdminUser}
     *  When the user who made the request is not ADMIN
     * @throws {errors.errorNoUserToAdd}
     *  When the all users in useridsToAdd are not available
     * in our app or they are already a member of the group
     */
    addUser: async (userid, useridsToAdd, groupid, permission) => {
        console.log('GroupController.addUser');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.array.of.number(useridsToAdd),
        'argument \'useridsToAdd\' must be a number[]');
    assert.ok(check.number(groupid),
        'argument \'groupid\' must be a number');
    assert.ok(check.nonEmptyString(permission),
        'argument \'permission\' must be a nonEmptyString');

        let dbsession = null;
        try {
            // Check the 'user who made the request' is an ADMIN.
            //  If he is, then he can add user.
            const isAdmin = await GroupUsers.isAdmin(groupid, userid);
            if (isAdmin == false) {
                throw new VError(errors.errorNotAnAdminUser.message);
            }

            // Filter the given user list based on their existence and
            // group membership
            const usersToRemove = [];
            for (const user of useridsToAdd) {
                // Check the 'user-being-added' is available.
                // If he is, then he can be added to the group.
                const isUserExist = await Users.isUserExist(user);
                if (isUserExist == false) {
                    usersToRemove.push(user);
                } else {
                    // Check 'user-being-added' is already a member
                    const isMember = await GroupUsers.isMember(groupid, user);
                    if (isMember == true) {
                        usersToRemove.push(user);
                    }
                }
            }

            if (useridsToAdd.length == usersToRemove.length) {
                throw new VError(errors.errorNoUserToAdd.message);
            }

            usersToRemove.forEach((userid) => {
                const nIndex = useridsToAdd.indexOf(userid);
                // CC: Else path not possible as
                //  usersToRemove is a subset of useridsToAdd
                if (nIndex >= 0) {
                    useridsToAdd.splice(nIndex, 1);
                }
            });

            // Start transaction
            dbsession = await dbTransactions.start();

            const usersAdded = [];
            // Now add the user
            useridsToAdd.forEach(async (user) => {
                const data = {
                    groupid: groupid,
                    user_id: user,
                    addedby: userid,
                    permission: permission,
                    operation: 'addUser',
                };
                await GroupUsers.addUser(data);
                usersAdded.push(data);
            });

            await dbTransactions.commit(dbsession);

            // Inform group members about the new user.
            const redisData = {
                gid: groupid,
                uid: useridsToAdd,
                perm: permission,
                op: 'aU',
            };
            ControllerHelper.informGroupUserUpdate(
                groupid,
                JSON.stringify(redisData)
            );

            const replyData = {
                status: success.userAddedToGroup,
            };
            return replyData;
        } catch (err) {
            await dbTransactions.abort(dbsession);
            errors.wrapError(err);
        }
    },

    /**
     * To change user's permission in the group.
     * Only ADMINs can change other users' permission.
     *
     * Tested on: 19-Aug-2019
     * {"module":"groups", "event":"changeUserPermission", "messageid":1515, "data":{"groupid": 3000, "user_id":2001, "permission":"ADMIN"}}
     *
     * @param {number} userid            ID of the user, who makes the request
     * @param {number} useridToUpdate    ID of the user, to update permission
     * @param {number} groupid           ID of the group
     * @param {string} permission        Permission of the user
     * @return {Status}
     *
     * @throws {errors.errorNotAnAdminUser}
     *  When the user who made the request is not ADMIN
     * @throws {errors.errorUserIsNotMember}
     *  When the useridToUpdate is not a member of the group
     * @throws {errors.errorInvalidPermission}
     *  When the permission is not 'ADMIN' or 'USER'
     */
    changeUserPermission: async (userid, useridToUpdate, groupid, permission) => {
        console.log('GroupController.changeUserPermission');
        assert.ok(check.number(userid),
            'argument \'userid\' must be a number');
        assert.ok(check.number(useridToUpdate),
            'argument \'useridToUpdate\' must be a number');
        assert.ok(check.number(groupid),
            'argument \'groupid\' must be a number');
        assert.ok(check.nonEmptyString(permission),
            'argument \'permission\' must be a nonEmptyString');

        let dbsession = null;
        try {
            // Check the user is an ADMIN. If he is, then he can add user.
            const isAdmin = await GroupUsers.isAdmin(groupid, userid);
            if (isAdmin == false) {
                throw new VError(errors.errorNotAnAdminUser.message);
            }

            // Check user-to-update is already a member
            const isMember = await GroupUsers.isMember(groupid, useridToUpdate);
            if (isMember == false) {
                throw new VError(errors.errorUserIsNotMember.message);
            }

            // Permission can be ADMIN or USER. Cant be CREATOR
            if (permission != 'ADMIN' && permission != 'USER') {
                throw new VError(errors.errorInvalidPermission.message);
            }

            // Todo: Do we need to check with existing permission
            // and throw an error, if existing and the requested one are same

            // Start transaction
            dbsession = await dbTransactions.start();

            const data = {
                groupid: groupid,
                user_id: useridToUpdate,
                permission: permission,
                operation: 'changeUser',
            };
            await GroupUsers.changeUserPermission(data);
            await dbTransactions.commit(dbsession);

            // Inform group members about the permission change.
            const redisData = {
                gid: groupid,
                uid: useridToUpdate,
                perm: permission,
                op: 'cUP',
            };
            ControllerHelper.informGroupUserUpdate(
                data.groupid,
                JSON.stringify(redisData)
            );

            const replyData = {
                status: success.userPermissionChangedInGroup,
            };
            return replyData;
        } catch (err) {
            await dbTransactions.abort(dbsession);
            errors.wrapError(err);
        }
    },

    /**
     * To remove an user from the group.
     * Only ADMINs can remove an user from the group.
     *
     * Tested on: Pending
     * {"module":"groups", "event":"removeUser", "messageid":874984, "data":{"groupid": 3000, "user_id":2001}}-
     *
     * @param {number} userid            ID of the user, who makes the request
     * @param {number} useridToRemove    ID of the user, to remove
     * @param {number} groupid           ID of the group
     * @return {Status}
     *
     * @throws {errors.errorNotAnAdminUser}
     *  When the user who made the request is not ADMIN
     * @throws {errors.errorUserIsNotMember}
     *  When the useridToRemove is not a member of the group
     */
    removeUser: async (userid, useridToRemove, groupid) => {
        console.log('GroupController.removeUser');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(useridToRemove),
        'argument \'useridToRemove\' must be a number');
    assert.ok(check.number(groupid),
        'argument \'groupid\' must be a number');

        let dbsession = null;
        try {
            // Check the user is an ADMIN. If he is, then he can add user.
            const isAdmin = await GroupUsers.isAdmin(groupid, userid);
            if (isAdmin == false) {
                throw new VError(errors.errorNotAnAdminUser.message);
            }

            // Check user is already a member
            const isMember = await GroupUsers.isMember(groupid, useridToRemove);
            if (isMember == false) {
                throw new VError(errors.errorUserIsNotMember.message);
            }

            // Start transaction
            dbsession = await dbTransactions.start();

            // remove the user.
            const data = {
                groupid: groupid,
                user_id: useridToRemove,
            };
            await GroupUsers.removeUser(data);
            await dbTransactions.commit(dbsession);

            // Inform group members about the user removal.
            const redisData = {
                gid: groupid,
                uid: useridToRemove,
                op: 'rU',
            };
            ControllerHelper.informGroupUserUpdate(
                groupid,
                JSON.stringify(redisData)
            );

            // TODO: inform removed user

            const replyData = {
                status: success.userRemovedFromGroup,
            };
            return replyData;
        } catch (err) {
            await dbTransactions.abort(dbsession);
            errors.wrapError(err);
        }
    },

    /**
     * Get all users of a group. (user_ids only)
     *
     * Tested on: Pending
     * {"module":"groups", "event":"getUsersOfGroups", "messageid":15185, "data":{"groupid":1001}}
     *
     * @param {number} userid    ID of the user, who makes the request
     * @param {number} groupid   ID of the group
     * @return {GroupUsers[]}
     *
     * @throws {errors.errorUserIsNotMember}
     *  When the user is not a member of the group
     */
    getUsersOfGroup: async (userid, groupid) => {
        console.log('GroupController.getUsersOfGroups');
    assert.ok(check.number(userid),
        'argument \'userid\' must be a number');
    assert.ok(check.number(groupid),
        'argument \'groupid\' must be a number');

        try {
            // Check user in group. If he is, then he can get the requested info
            const isMember = await GroupUsers.isMember(groupid, userid);
            if (isMember == false) {
                throw new VError(errors.errorUserIsNotMember.message);
            }

            // Todo: use redis
            return await GroupUsers.getUsers(groupid);
        } catch (err) {
            errors.wrapError(err);
        }
    },
};
