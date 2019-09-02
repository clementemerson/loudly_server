module.exports = {

  //* **********************************************************************//
  // To maintain a list of <users/polls/groups> that we need more often
  //* **********************************************************************//
  // List of users in a group
  // Format groupUsers:<groupid>
  usersOfGroup: 'uOG:',
  // List of users voted for a poll
  // Format pollVotedUsers:<pollid>
  pollVotedUsers: 'pVU:',
  // List of groups that a poll is shared
  // Format pollInGroups:<pollid>
  // Not used
  pollInGroups: 'pIG:',
  // List of polls in a group
  // Format pollsOfGroup:<groupid>
  // Not used
  pollsOfGroup: 'pOG:',
  // List of groups of a user
  // Format groupsOfUser:<user_id>
  // Not Used
  groupsOfUser: 'gOU:',
  //* **********************************************************************//

  //* **********************************************************************//
  // To store frequently used data
  //* **********************************************************************//
  // phonenumber-userid map
  phoneNumber: 'pN:',
  // Storing poll results
  // Format pollResult:<pollid>
  pollResult: 'pR:',
  //* **********************************************************************//

  //* **********************************************************************//
  // List maintained for sending updates to user
  //* **********************************************************************//
  // List of groups in which meta-data has been changed
  // Format groupUpdate:<user_id>
  groupUpdate: 'gUp:',
  // List of groups in which user related data has been changed
  // Format groupUserUpdate:<user_id>
  groupUserUpdate: 'gUU:',
  // List of groups in which user related data has been changed
  // Format groupUserUpdate:<user_id>
  newGroupPoll: 'nPU:{0}_G:{1}',
  // Stores a list of userids, who subscribed to the poll
  // Format pollSub:<pollid>
  pollSubsription: 'pS:',
  // Stores a list of pollids, which results are updated
  // Format pollUpdates
  pollUpdates: 'pU',
  //* **********************************************************************//
};
