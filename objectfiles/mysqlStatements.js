class SQLstatments {
    constructor(){
        this.selectAllDepartments = `select * from department;`

        this.selectAllEmployees = `select a.id, 
        a.first_name,
        a.last_name,
        role.title,
        department.name,
        role.salary,
        concat(b.first_name, ' ', b.last_name) as manager
        from employee a inner join role ON a.role_id = role.id
        inner join department ON role.department_id = department.id
        left join employee b on a.manager_id = b.id;`

        this.selectAllRoles = `select role.id,
        role.title,
        role.salary,
        department.name as department
        from role inner join department on role.department_id = department.id;`

        this.selectRolesRaw = `select * from role;`

        this.insertNewDepartment = `insert into department (name) values(?)`
        this.insertNewRole = `insert into role (title, salary, department_id) values(?,?,?)`
        this.insertNewEmployee = `insert into employee (first_name, last_name, role_id, manager_id) values(?,?,?,?);`
    }
}

module.exports = SQLstatments;