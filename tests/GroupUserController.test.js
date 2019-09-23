const expect = require('expect');
const testUtil = require('../testutil/testUtil');

const errors = require('../helpers/errorstousers');
const success = require('../helpers/successtousers');

const dbTransactions = require('../db/session');

// Testing Component
const GroupUserController = require('../controllers/GroupUserController');

// Dependents
const GroupUsers = require('../db/groupusers');
const ControllerHelper = require('../controllers/ControllerHelper');
const Users = require('../db/users');

beforeAll(async () => {
  console.log = () => {};
});

beforeEach(() => {
  dbTransactions.start = jest.fn();
  dbTransactions.commit = jest.fn();
  dbTransactions.abort = jest.fn();
});

afterEach(() => {});

afterAll(() => {});

describe('addUser', () => {
    testUtil.shouldExist(GroupUserController.addUser);
    testUtil.shouldBeAFunction(GroupUserController.addUser);

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const useridsToAdd = [2005, 2006];
      const groupid = 3010;
      const permission = 'USER';
      // Tests
      await GroupUserController.addUser(
          userid,
          useridsToAdd,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for string array useridsToAdd', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridsToAdd = ['2005', '2006'];
      const groupid = 3010;
      const permission = 'USER';
      // Tests
      await GroupUserController.addUser(
          userid,
          useridsToAdd,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'useridsToAdd\' must be a number[]');
    }
  });

  test('should fail for invalid array useridsToAdd', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridsToAdd = 2005;
      const groupid = 3010;
      const permission = 'USER';
      // Tests
      await GroupUserController.addUser(
          userid,
          useridsToAdd,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'useridsToAdd\' must be a number[]');
    }
  });

  test('should fail for invalid groupid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridsToAdd = [2005, 2006];
      const groupid = '3010';
      const permission = 'USER';
      // Tests
      await GroupUserController.addUser(
          userid,
          useridsToAdd,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupid\' must be a number');
    }
  });

  test('should fail for invalid permission', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridsToAdd = [2005, 2006];
      const groupid = 3010;
      const permission = '';
      // Tests
      await GroupUserController.addUser(
          userid,
          useridsToAdd,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toEqual(
          'argument \'permission\' must be a nonEmptyString'
      );
    }
  });

  test('should fail if user is not an admin of the group', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridsToAdd = [2005, 2006];
      const groupid = 3010;
      const permission = 'USER';
      // Tests
      await GroupUserController.addUser(
          userid,
          useridsToAdd,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorNotAnAdminUser.message);
    }
  });

  test('should fail if the users do not exist', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    Users.isUserExist = jest.fn().mockImplementation(() => false);
    expect.assertions(4);
    try {
      // Data
      const userid = 2004;
      const useridsToAdd = [2005, 2006];
      const groupid = 3010;
      const permission = 'USER';
      // Tests
      await GroupUserController.addUser(
          userid,
          useridsToAdd,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorNoUserToAdd.message);
      expect(dbTransactions.start).not.toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalledWith(null);
    }
  });

  test('should fail if the users are member of the group', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    Users.isUserExist = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    expect.assertions(4);
    try {
      // Data
      const userid = 2004;
      const useridsToAdd = [2005, 2006];
      const groupid = 3010;
      const permission = 'USER';
      // Tests
      await GroupUserController.addUser(
          userid,
          useridsToAdd,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toEqual(errors.errorNoUserToAdd.message);
      expect(dbTransactions.start).not.toHaveBeenCalled();
      expect(dbTransactions.commit).not.toHaveBeenCalled();
      expect(dbTransactions.abort).toHaveBeenCalledWith(null);
    }
  });

  test('should pass - adding all users', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    Users.isUserExist = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => false);
    GroupUsers.addUser = jest.fn();
    ControllerHelper.informGroupUserUpdate = jest.fn();
    // Data
    const userid = 2004;
    const useridsToAdd = [2005, 2006];
    const groupid = 3010;
    const permission = 'USER';
    // Tests
    await GroupUserController.addUser(
        userid,
        useridsToAdd,
        groupid,
        permission
    );
    // Expects
    useridsToAdd.forEach((user) => {
      const data = {
        groupid: groupid,
        user_id: user,
        addedby: userid,
        permission: permission,
        operation: 'addUser',
      };
      expect(GroupUsers.addUser).toHaveBeenCalledWith(data);
    });
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();
    const redisData = {
      gid: groupid,
      uid: useridsToAdd,
      perm: permission,
      op: 'aU',
    };
    expect(ControllerHelper.informGroupUserUpdate).toHaveBeenCalledWith(
        groupid,
        JSON.stringify(redisData)
    );
  });

  test('should pass - adding a subset of users', async () => {
    // Mocks
    const existUsers = [2006, 2007];
    const memberUsers = [2007];
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    Users.isUserExist = jest.fn().mockImplementation((userid) => {
      if (existUsers.indexOf(userid) >= 0) {
        return true;
      }
      return false;
    });
    GroupUsers.isMember = jest.fn().mockImplementation((groupid, userid) => {
      if (memberUsers.indexOf(userid) >= 0) {
        return true;
      }
      return false;
    });
    GroupUsers.addUser = jest.fn();
    ControllerHelper.informGroupUserUpdate = jest.fn();
    // Data
    const userid = 2004;
    const useridsToAdd = [2005, 2006, 2007];
    const groupid = 3010;
    const permission = 'USER';
    // Inference
    const usersToAdd = [2006];
    const usersNotToAdd = [2005, 2007];
    // Tests
    await GroupUserController.addUser(
        userid,
        useridsToAdd,
        groupid,
        permission
    );
    // Expects
    usersToAdd.forEach((user) => {
      const data = {
        groupid: groupid,
        user_id: user,
        addedby: userid,
        permission: permission,
        operation: 'addUser',
      };
      expect(GroupUsers.addUser).toHaveBeenCalledWith(data);
    });
    usersNotToAdd.forEach((user) => {
      const data = {
        groupid: groupid,
        user_id: user,
        addedby: userid,
        permission: permission,
        operation: 'addUser',
      };
      expect(GroupUsers.addUser).not.toHaveBeenCalledWith(data);
    });
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    expect(dbTransactions.abort).not.toHaveBeenCalled();
    const redisData = {
      gid: groupid,
      uid: usersToAdd,
      perm: permission,
      op: 'aU',
    };
    expect(ControllerHelper.informGroupUserUpdate).toHaveBeenCalledWith(
        groupid,
        JSON.stringify(redisData)
    );
  });
});

describe('changeUserPermission', () => {
    testUtil.shouldExist(GroupUserController.changeUserPermission);
    testUtil.shouldBeAFunction(GroupUserController.changeUserPermission);

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const useridToUpdate = 2005;
      const groupid = 3010;
      const permission = 'USER';
      // Tests
      await GroupUserController.changeUserPermission(
          userid,
          useridToUpdate,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid useridsToAdd', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToUpdate = '2005';
      const groupid = 3010;
      const permission = 'USER';
      // Tests
      await GroupUserController.changeUserPermission(
          userid,
          useridToUpdate,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'useridToUpdate\' must be a number');
    }
  });

  test('should fail for invalid groupid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToUpdate = 2005;
      const groupid = '3010';
      const permission = 'USER';
      // Tests
      await GroupUserController.changeUserPermission(
          userid,
          useridToUpdate,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupid\' must be a number');
    }
  });

  test('should fail for invalid permission', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToUpdate = 2005;
      const groupid = 3010;
      const permission = '';
      // Tests
      await GroupUserController.changeUserPermission(
          userid,
          useridToUpdate,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toEqual(
          'argument \'permission\' must be a nonEmptyString'
      );
    }
  });

  test('should fail if user is not an admin of the group', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToUpdate = 2005;
      const groupid = 3010;
      const permission = 'ADMIN';
      // Tests
      await GroupUserController.changeUserPermission(
          userid,
          useridToUpdate,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorNotAnAdminUser.message);
    }
  });

  test('should fail if user being updated is not in the group', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToUpdate = 2005;
      const groupid = 3010;
      const permission = 'ADMIN';
      // Tests
      await GroupUserController.changeUserPermission(
          userid,
          useridToUpdate,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorUserIsNotMember.message);
    }
  });

  test('should fail if permission is not ADMIN or USER', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToUpdate = 2005;
      const groupid = 3010;
      const permission = 'SOME';
      // Tests
      await GroupUserController.changeUserPermission(
          userid,
          useridToUpdate,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorInvalidPermission.message);
    }
  });

  test('should fail on error', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupUsers.changeUserPermission = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToUpdate = 2005;
      const groupid = 3010;
      const permission = 'ADMIN';
      // Tests
      await GroupUserController.changeUserPermission(
          userid,
          useridToUpdate,
          groupid,
          permission
      );
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should pass', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupUsers.changeUserPermission = jest.fn();
    ControllerHelper.informGroupUserUpdate = jest.fn();
    // Data
    const userid = 2004;
    const useridToUpdate = 2005;
    const groupid = 3010;
    const permission = 'ADMIN';
    // Tests
    const reply = await GroupUserController.changeUserPermission(
        userid,
        useridToUpdate,
        groupid,
        permission
    );
    const expectedResult = {
      status: success.userPermissionChangedInGroup,
    };

    expect(reply).toMatchObject(expectedResult);
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    const data = {
      groupid: groupid,
      user_id: useridToUpdate,
      permission: permission,
      operation: 'changeUser',
    };
    expect(GroupUsers.changeUserPermission).toHaveBeenCalledWith(data);
    const redisData = {
      gid: groupid,
      uid: useridToUpdate,
      perm: permission,
      op: 'cUP',
    };
    expect(ControllerHelper.informGroupUserUpdate).toHaveBeenCalledWith(
        groupid,
        JSON.stringify(redisData)
    );
    expect(dbTransactions.abort).not.toHaveBeenCalled();
  });
});

describe('removeUser', () => {
    testUtil.shouldExist(GroupUserController.removeUser);
    testUtil.shouldBeAFunction(GroupUserController.removeUser);

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const useridToRemove = 2005;
      const groupid = 3010;
      // Tests
      await GroupUserController.removeUser(userid, useridToRemove, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid useridsToAdd', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToRemove = '2005';
      const groupid = 3010;
      // Tests
      await GroupUserController.removeUser(userid, useridToRemove, groupid);
    } catch (err) {
      // Expects
      expect(err.message)
          .toEqual('argument \'useridToRemove\' must be a number');
    }
  });

  test('should fail for invalid groupid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToRemove = 2005;
      const groupid = '3010';
      // Tests
      await GroupUserController.removeUser(userid, useridToRemove, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupid\' must be a number');
    }
  });

  test('should fail if user is not an admin of the group', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToRemove = 2005;
      const groupid = 3010;
      // Tests
      await GroupUserController.removeUser(userid, useridToRemove, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorNotAnAdminUser.message);
    }
  });

  test('should fail if user being removed is not in the group', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToRemove = 2005;
      const groupid = 3010;
      // Tests
      await GroupUserController.removeUser(userid, useridToRemove, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorUserIsNotMember.message);
    }
  });

  test('should fail on error', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupUsers.removeUser = jest.fn().mockImplementation(() => {
      throw new Error('');
    });
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const useridToRemove = 2005;
      const groupid = 3010;
      // Tests
      await GroupUserController.removeUser(userid, useridToRemove, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.internalError.message);
    }
  });

  test('should pass', async () => {
    // Mocks
    GroupUsers.isAdmin = jest.fn().mockImplementation(() => true);
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupUsers.removeUser = jest.fn();
    ControllerHelper.informGroupUserUpdate = jest.fn();
    // Data
    const userid = 2004;
    const useridToRemove = 2005;
    const groupid = 3010;
    // Tests
    const reply = await GroupUserController.removeUser(
        userid,
        useridToRemove,
        groupid
    );
    const expectedResult = {
      status: success.userRemovedFromGroup,
    };

    expect(reply).toMatchObject(expectedResult);
    expect(dbTransactions.start).toHaveBeenCalled();
    expect(dbTransactions.commit).toHaveBeenCalled();
    const data = {
      groupid: groupid,
      user_id: useridToRemove,
    };
    expect(GroupUsers.removeUser).toHaveBeenCalledWith(data);
    const redisData = {
      gid: groupid,
      uid: useridToRemove,
      op: 'rU',
    };
    expect(ControllerHelper.informGroupUserUpdate).toHaveBeenCalledWith(
        groupid,
        JSON.stringify(redisData)
    );
    expect(dbTransactions.abort).not.toHaveBeenCalled();
  });
});

describe('getUsersOfGroup', () => {
    testUtil.shouldExist(GroupUserController.getUsersOfGroup);
    testUtil.shouldBeAFunction(GroupUserController.getUsersOfGroup);

  test('should fail for invalid userid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = '2004';
      const groupid = 3010;
      // Tests
      await GroupUserController.getUsersOfGroup(userid, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'userid\' must be a number');
    }
  });

  test('should fail for invalid groupid', async () => {
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const groupid = '3010';
      // Tests
      await GroupUserController.getUsersOfGroup(userid, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toEqual('argument \'groupid\' must be a number');
    }
  });

  test('should fail if user is not a member of the group', async () => {
    // Mocks
    GroupUsers.isMember = jest.fn().mockImplementation(() => false);
    expect.assertions(1);
    try {
      // Data
      const userid = 2004;
      const groupid = 3010;
      // Tests
      await GroupUserController.getUsersOfGroup(userid, groupid);
    } catch (err) {
      // Expects
      expect(err.message).toContain(errors.errorUserIsNotMember.message);
    }
  });

  test('should pass', async () => {
    // Mocks
    const expectedResult = {
      data: 101,
    };
    GroupUsers.isMember = jest.fn().mockImplementation(() => true);
    GroupUsers.getUsers = jest.fn().mockImplementation(() => expectedResult);
    // Data
    const userid = 2004;
    const groupid = 3010;
    // Tests
    const reply = await GroupUserController.getUsersOfGroup(userid, groupid);
    // Expects
    expect(reply).toEqual(expectedResult);
  });
});
