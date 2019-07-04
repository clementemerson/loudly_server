module.exports = {
    sendData: function (data) {
        return {
            Status: 'Success',
            Details: data
        };
    },
    successPollShared: 'Poll shared to the group',
    successVoted: "You've voted successfully",
    successPollCreated: "You've created a poll successfully",
    successPollDeleted: "You've deleted a poll successfully",
    groupCreated: "You've successfully created a group",
    groupTitleChanged: "You've successfully changed the title of a group",
    groupDescChanged: "You've successfully changed the description of a group",
    groupDeleted: "You've successfully deleted a group",
    userAddedToGroup: "You've added an user to a group",
    userPermissionChangedInGroup: "You've changed the permission of an user in a group",
    userRemovedFromGroup: "You've removed an user from a group",
    userNameChanged: "You've changed your name successfully",
    userStatusChanged: "You've changed your status successfully",
    userSubscribedToPollResult: "You've subscribed to poll result successfully",
    userUnSubscribedToPollResult: "You've unsubscribed to poll result successfully",
};
