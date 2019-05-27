module.exports = {
    sendData: function (data) {
        return {
            Status: 'Success',
            Data: data
        };
    },
    successPollShared: {
        Status: 'Success',
        Details:'Poll shared to the group'
    },
    successVoted: {
        Success: 'Success',
        Details: "You've voted successfully" 
    },
    successPollCreated: {
        Success: 'Success',
        Details: "You've successfully created a poll" 
    },
    groupCreated: {
        Success: 'Success',
        Details: "You've successfully created a group" 
    },
    groupTitleChanged: {
        Success: 'Success',
        Details: "You've successfully changed the title of a group" 
    },
    groupDescChanged: {
        Success: 'Success',
        Details: "You've successfully changed the description of a group" 
    },
    groupDeleted: {
        Success: 'Success',
        Details: "You've successfully deleted a group" 
    },
    userAddedToGroup: {
        Success: 'Success',
        Details: "You've added an user to a group" 
    },
    userPermissionChangedInGroup: {
        Success: 'Success',
        Details: "You've changed the permission of an user in a group" 
    },
    userRemovedFromGroup: {
        Success: 'Success',
        Details: "You've removed an user from a group" 
    },
};
