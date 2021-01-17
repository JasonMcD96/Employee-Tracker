const inquirer = require("inquirer")
const mysql = require("mysql")
const util = require("util")
const cTable = require("console.table")
const Prompts = require("./inquirerPrompts")

let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "myoldsixtyeight",
    database: "employee_tracker_db"
})

connection.connect(function (err) {
    if (err) throw err;
})

connection.query = util.promisify(connection.query);

let departmentsArray = [];
let rolesArray = [];
let employeeArray = [];
const prompts = new Prompts;

const mainPrompt = async (inputs = []) => {

    const answers = await inquirer.prompt(prompts.mainPrompt)
    return answers;
}

let getAllEmployees = () => {
    // Get all employees and their information from the database
    console.log("--- Accessing all employees --- \n\n")

    return connection.query(`select a.id, 
    a.first_name,
    a.last_name,
    role.title,
    department.name,
    role.salary,
    concat(b.first_name, ' ', b.last_name) as manager
    from employee a inner join role ON a.role_id = role.id
    inner join department ON role.department_id = department.id
    left join employee b on a.manager_id = b.id;`)

}

let viewEmployees = async () => {
    let employees = await getAllEmployees()
    console.table(employees)
    main() // go back to start
}

let getAllDepartments = () => {
    console.log("--- Accessing all Departments --- \n\n")
    return connection.query(`select * from department;`)

}
let viewDepartments = async () => {
    let departments = await getAllDepartments();
    console.table(departments)
    main(); // go back to start
}

let getAllRoles = () => {
    console.log("--- Accessing all Roles --- \n\n")
    return connection.query(`select role.id,
    role.title,
    role.salary,
    department.name as department
    from role inner join department on role.department_id = department.id;`)
}

let getRollsRaw = () => {
    return connection.query(`select * from role;`)
}

let viewRoles = async () => {
    let roles = await getAllRoles();
    console.table(roles)
    main(); // go back to start
}

let insertDepartment = (department) => {
    console.log('--- Attempting to insert new data ---')
    console.log('Department> ', department)
    return connection.query(`insert into department (name) values(?)`, department)
}

let addDepartment = async (department) => {
    let result = await insertDepartment(department);
    main() // go back to start
}


let insertRole = (role, salary, id) => {
    connection.query(`insert into role (title, salary, department_id)
    values(?,?,?)`, [role, salary, id])
}

let addRole = async (role) => {
    let departments = await getAllDepartments(); // need IDs of departments
    departmentsArray = [];

    departments.forEach(element => {
        let newObj = { id: element.id, name: element.name }
        departmentsArray.push(newObj)
    });

    let roleAnswers = await promptForRoles();
    // console.log(`${role} of salary ${roleAnswers.salary} linked to department: `, roleAnswers.newRoleDepartment)
    let id = (departmentsArray.filter(object => object.name === roleAnswers.newRoleDepartment))[0].id
    await insertRole(role, roleAnswers.salary, id)

    main(); // go back to start
}

let promptForRoles = async () => {
    let departmentChoices = [] //list of departments to choose from
    departmentsArray.forEach(element => {
        departmentChoices.push(element.name)
    })
    // console.log('Role choices: ', roleChoices)
    const prompts = [
        {
            type: 'list',
            name: 'newRoleDepartment',
            message: 'What department is this role for?',
            choices: departmentChoices
        }, {
            type: 'number',
            name: 'salary',
            message: 'What is the salary?'
        }
    ]
    const answers = await inquirer.prompt(prompts)
    return answers;
}

// prompting for adding an employee 
let promptForEmployee = async () => {
    let roleChoices = [] //list of roles for the employee can have
    rolesArray.forEach(element => {
        roleChoices.push(element.title)
    })

    let managerChoices = [] //List of employees to choose from to make a manager of new employee
    employeeArray.forEach(element => {
        managerChoices.push(`${element.firstName} ${element.lastName}`)
    })
    managerChoices.push('none')

    const prompts = [
        {
            type: 'input',
            name: 'firstName',
            message: "What is the new employee's first name?"
        },
        {
            type: 'input',
            name: 'lastName',
            message: "Last name?"
        },
        {
            type: 'list',
            name: 'employeeRole',
            message: 'What role will this person have?',
            choices: roleChoices
        },
        {
            type: 'list',
            name: 'managerName',
            message: 'Who is their manager?',
            choices: managerChoices
        }

    ]

    const answers = await inquirer.prompt(prompts)
    return answers
}

let insertEmployee = (first, last, id, manager) => {
    connection.query(`insert into employee (first_name, last_name, role_id, manager_id)
    values(?,?,?,?);`, [first, last, id, manager])
}

let addEmployee = async () => {
    let roles = await getRollsRaw();
    rolesArray = [];

    roles.forEach(element => {

        let newObj = {
            id: element.id,
            title: element.title,
            salary: element.salary,
            departmentID: element.department_id
        }
        rolesArray.push(newObj)
    })

    let employees = await getAllEmployees();
    employeeArray = [];

    employees.forEach(element => {
        let newObj = {
            id: element.id,
            firstName: element.first_name,
            lastName: element.last_name
        }

        employeeArray.push(newObj)
    })

    let answers = await promptForEmployee();
    let roleId = (rolesArray.filter(object => object.title === answers.employeeRole))[0].id;

    let managerid;
    if (answers.managerName === 'none') {
        managerid = null;
    } else {
        managerid = (employeeArray.filter(object => object.firstName + ' ' + object.lastName === answers.managerName))[0].id
    }

    await insertEmployee(answers.firstName, answers.lastName, roleId, managerid)
    main();
}

let promptEmployeeUpdate = async () => {
    let roleChoices = [] //array with role titles for the employee to have
    rolesArray.forEach(element => {
        roleChoices.push(element.title)
    })

    let employeeChoices = []
    employeeArray.forEach(element => {
        employeeChoices.push(`${element.firstName} ${element.lastName}`)
    })

    const prompts = [
        {
            type: 'list',
            name: 'employeeToUpdate',
            message: "Update the role of which employee?",
            choices: employeeChoices
        },
        {
            type: 'list',
            name: 'roleToChangeTo',
            message: "What role will they change to?",
            choices: roleChoices
        }

    ]

    const answers = await inquirer.prompt(prompts)
    return answers
}

let sendUpdateRequest = (id, role) => {
    connection.query(`update employee set role_id=? where id=?`, [role, id])
}

let updateEmployee = async () => {
    let roles = await getRollsRaw();
    rolesArray = [];

    roles.forEach(element => {
        let newObj = {
            id: element.id,
            title: element.title,
            salary: element.salary,
            departmentID: element.department_id
        }

        rolesArray.push(newObj)
    })

    let employees = await getAllEmployees();
    employeeArray = [];

    employees.forEach(element => {
        let newObj = {
            id: element.id,
            firstName: element.first_name,
            lastName: element.last_name
        }
        employeeArray.push(newObj)
    })

    let answers = await promptEmployeeUpdate()
    let employeeId = (employeeArray.filter(object => object.firstName + ' ' + object.lastName === answers.employeeToUpdate))[0].id
    let roleId = (rolesArray.filter(object => object.title === answers.roleToChangeTo))[0].id;
    await sendUpdateRequest(employeeId, roleId)
}

const main = async () => {

    let answers = await mainPrompt().then(answers => {

        switch (answers.action) {
            case "View All Employees":
                viewEmployees();
                break;

            case "View All Departments":
                viewDepartments();
                break;

            case "View All Roles":
                viewRoles();
                break;
            case "Add Department":
                addDepartment(answers.newDepartment);
                break;

            case "Add New Role":
                addRole(answers.newRole);
                break;

            case "Add Employee":
                addEmployee();
                break;


            case "Update Employee Role":
                updateEmployee();
                break;


            default:
                break;
        }
    })
}
main();