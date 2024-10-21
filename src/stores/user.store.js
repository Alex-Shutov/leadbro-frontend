import {makeAutoObservable} from "mobx";
import {loadAvatar} from "../utils/create.utils";

export class UserStore {
    user= {
        id: 0,
        image: loadAvatar(),
        firstName:'Александр',
        lastName:'Шилов',
        middleName:'Александрович',
    }
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