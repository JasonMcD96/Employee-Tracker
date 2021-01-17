const inquirer = require("inquirer")
const mysql = require("mysql")
const util = require("util")
const cTable = require("console.table")

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

const mainPrompt = async (inputs = []) => {
    const prompts = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View All Departments',
                'View All Roles',
                'View By Manager',
                'Add Employee',
                'Add Department',
                'Add New Role',
                'Update Employee Role',
                'Update Employee',
                'Update Employee Manager',
                'Remove Employee',
                'Remove Role'
            ]
        },
        {
            type: 'input',
            name: 'newDepartment',
            message: 'What is the name of the new department?',
            when: (answers) => answers.action === "Add Department"
        },
        {
            type: 'input',
            name: 'newRole',
            message: 'What is the name of the new role?',
            when: (answers) => answers.action === "Add New Role"
        }
    ];

    const answers = await inquirer.prompt(prompts)
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
    let roleChoices = []
    departmentsArray.forEach(element => {
        roleChoices.push(element.name)
    })
    // console.log('Role choices: ', roleChoices)
    const prompts = [
        {
            type: 'list',
            name: 'newRoleDepartment',
            message: 'What department is this role for?',
            choices: roleChoices
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
    let employeeChoices = [] //array with role titles for the employee to have
    rolesArray.forEach(element => {
        employeeChoices.push(element.title)
    })

    let managerChoices = []
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
            choices: employeeChoices
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
        let newObj = {id: element.id, title: element.title, salary: element.salary, departmentID: element.department_id}
        rolesArray.push(newObj)
    })

    let employees = await getAllEmployees();
    employeeArray = [];

    employees.forEach(element => {
        let newObj = {id: element.id, firstName: element.first_name, lastName: element.last_name}
        employeeArray.push(newObj)
    })
    console.log('Employees: ', employeeArray)
    let answers = await promptForEmployee();
    let roleId = (rolesArray.filter(object => object.title === answers.employeeRole))[0].id;

    let managerid;
    // console.log('Role ID: ', roleId)
    if (answers.managerName === 'none'){
        managerid = null;
    } else {
        managerid = (employeeArray.filter(object => object.firstName + ' ' + object.lastName === answers.managerName))[0].id
    }
    console.log('Manager: ', managerid)
    await insertEmployee(answers.firstName, answers.lastName, roleId, managerid)
    main();
}



const main = async () => {

    let answers = await mainPrompt().then(answers => {

        switch (answers.action) {
            case "View All Employees":  // Min
                viewEmployees();
                break;

            case "View All Departments": // Min
                viewDepartments();
                break;

            case "View All Roles": // Min
                viewRoles();
                break;
            case "Add Department": //Min
                addDepartment(answers.newDepartment);
                break;

            case "Add New Role": //min
                addRole(answers.newRole); // need IDs
                break;

            case "Add Employee": // min
                addEmployee();
                break;


            case "Update Employee Role": // Min

                break;

            case "View By Manager":

                break;


            case "View By Department":

                break;


            case "Add Employee":

                break;

            case "Remove Employee":

                break;

            case "Update Employee Manager":

                break;


            case "Remove Role":

                break;

            default:
                break;
        }
    })
}
main();