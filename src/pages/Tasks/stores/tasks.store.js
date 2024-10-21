import { makeAutoObservable, action, observable } from 'mobx';
import {changeDraft, removeDraft} from "../../../utils/store.utils";

export class TasksStore {
    tasks = [];
    drafts = {};
    taskStatuses=null

    constructor(root) {
        this.root = root;
        makeAutoObservable(this);
    }

    getTasks() {
        return this.tasks.map((task) => {
            const draft = this.drafts[task.id];
            return draft ? { ...task, ...draft } : task;
        });
    }

    getById(id, isReset = false) {
        const task = this.tasks.find((x) => x.id === Number(id));
        const draft = this.drafts[id];
        return isReset ? task : draft ? { ...task, ...draft } : task;
    }

    resetDraft(id, path) {
        if (!this.drafts[id]) return;
        let task = this.getById(id, true);

        this.resetDraft(this, id, task, path);
    }

    submitDraft(id) {
        if (!this.drafts[id]) return;

        const task = this.getById(id);
        if (!task) return;

        const updatedTask = { ...task };
        this.tasks = this.tasks.map((c) => (c.id === id ? updatedTask : c));
        delete this.drafts[id];
    }

    createDraft(id) {
        const task = this.getById(id);
        if (!task) return;

        this.drafts[id] = { ...task };
    }

    changeById(id, path, value, withId) {
        if (!this.drafts[id]) {
            this.createDraft(id);
        }
        let draft = this.drafts[id];

        changeDraft(this, id, draft, path, value, withId);
    }

    removeById(id, path) {
        if (!this.drafts[id]) {
            this.createDraft(id);
        }

        removeDraft(this, id, path);
    }

    setTasks(result) {
        this.tasks = result;
    }
    setStatuses(result){
        this.taskStatuses=result
    }
    getStatuses(){
        return this.taskStatuses
    }

}
