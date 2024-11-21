import { makeAutoObservable } from 'mobx';
import { loadAvatar } from '../utils/create.utils';

export class UserStore {
  user = null;
  rigths = null;
  constructor(root) {
    this.root = root;
    makeAutoObservable(this);
  }

  setUser(result) {
    this.user = result;
  }
  setRights(result) {
    this.rigths = result;
  }

  getUser() {
    return this.user;
  }
  getRigths() {
    return this.rigths;
  }
}
