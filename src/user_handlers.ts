import { lambdaWrap } from './Utils';
import {
  SaveUserRequest,
  GetUserRequest,
  GetUserResponse,
  SaveNewUserRequest,
  CheckUserRequest,
  CheckUserResponse,
} from './ServiceTypes';
import {
  saveOrUpdateUser,
  getUserData,
  saveUserPassword,
  checkPassword,
} from './UserHelpers';

async function saveNewUser(r: SaveNewUserRequest) {
  return saveUserPassword(r.user);
}

async function checkUser(r: CheckUserRequest): Promise<CheckUserResponse> {
  let passwordCheck = await checkPassword(r.user);

  return { success: passwordCheck };
}

async function saveUser(r: SaveUserRequest) {
  return saveOrUpdateUser(r.user);
}

async function getUser(r: GetUserRequest): Promise<GetUserResponse> {
  let userData = await getUserData(r.id);

  return { user: userData };
}

module.exports = {
  saveUser: lambdaWrap(saveUser),
  getUser: lambdaWrap(getUser),
  saveNewUser: lambdaWrap(saveNewUser),
  checkUser: lambdaWrap(checkUser),
};
