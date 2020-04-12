import { lambdaWrap } from './Utils';
import {
  SaveUserRequest,
  GetUserRequest,
  GetUserResponse,
} from './ServiceTypes';
import { saveOrUpdateUser, getUserData } from './UserHelpers';

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
};
