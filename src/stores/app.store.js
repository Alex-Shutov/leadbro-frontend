import {makeAutoObservable} from "mobx";

export class AppStore{
    employees = [];
    companies = [];
    clients = [];
    employeePositions = [];
    tasks = [];
    services = [];

    constructor(root) {
        this.root = root;
        makeAutoObservable(this);
    }

    // Устанавливаем сотрудников
    setEmployees(employees) {
        this.employees = employees;
    }

    // Устанавливаем компании
    setCompanies(companies) {
        this.companies = companies;
    }

    // Устанавливаем клиентов
    setClients(clients) {
        this.clients = clients;
    }

    // Устанавливаем должности сотрудников
    setEmployeePositions(positions) {
        this.employeePositions = positions;
    }

    // Устанавливаем задачи
    setTasks(tasks) {
        this.tasks = tasks;
    }

    // Устанавливаем услуги
    setServices(services) {
        this.services = services;
    }
}