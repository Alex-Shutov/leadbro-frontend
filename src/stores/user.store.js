import {makeAutoObservable} from "mobx";
import {loadAvatar} from "../utils/create.utils";

export class UserStore {
    user= null
    constructor(root) {
        this.root = root
        makeAutoObservable(this)
    }

    setUser(result){
        this.user = result
    }

    getUser(){
        return this.user
    }

}