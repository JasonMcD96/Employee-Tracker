const inquirer = require("inquirer")
const mysql = require("mysql")
const util = require("util")
const cTable = require("console.table")
const Prompts = require("./objectfiles/inquirerPrompts")
const SQLstatments = require("./objectfiles/mysqlStatements")

// Create connection paremeters with the database
let connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "myoldsixtyeight",
    database: "employee_tracker_db"
})

// Connect to the database
connection.connect(function (err) {
    if (err) throw err;
})

// Promisify queries
connection.query = util.promisify(connection.query);

// Global variables
let departmentsArray = [];
let rolesArray = [];
let employeeArray = [];
const promptStorage = new Prompts; // Used to cut down bulk of server.js slightly
const sqlStorage = new SQLstatments; //Used to cut down on bulk of server.js by holding statement text

// mainPrompt prompts the user with the main menu of the app
const mainPrompt = async (inputs = []) => {

    const answers = await inquirer.prompt(promptStorage.mainPrompt)
    return answers;
}

// getAllEmployees is the actual mysql code to select from the database all employees
let getAllEmployees = () => {
    return connection.query(sqlStorage.selectAllEmployees)
}

// Intermediary function to call getAllEmployees with await, helps handle async issues with inquirer + mysql
let viewEmployees = async () => {
    let employees = await getAllEmployees()
    console.table(employees)
    main() // go back to start
}

// getAllDepartments is mysql code to get all departments in the db
let getAllDepartments = () => {
    return connection.query(sqlStorage.selectAllDepartments)
}

// Intermediary function to call getAllDepartments with await, helps handle async issues with inquirer + mysql
let viewDepartments = async () => {
    let departments = await getAllDepartments();
    console.table(departments)
    main(); // go back to start
}

// getAllRoles is mysql code to get all roles in the db
let getAllRoles = () => {
    return connection.query(sqlStorage.selectAllRoles)
}

// another version to get rolls, 'RAW' because getAllRoles was a different format that what
//  needed elsewhere in the program
let getRolesRaw = () => {
    return connection.query(sqlStorage.selectRolesRaw)
}

// Intermediary function to call getAllRoles with await, helps handle async issues with inquirer + mysql
let viewRoles = async () => {
    let roles = await getAllRoles();
    console.table(roles)
    main(); // go back to start
}

// inserts a new department into the database
let insertDepartment = (department) => {
    return connection.query(sqlStorage.insertNewDepartment, department)
}

// Intermediary function to call insertDepartment with await, helps handle async issues with inquirer + mysql
let addDepartment = async (department) => {
    let result = await insertDepartment(department);
    main() // go back to start
}

// inserts a new role into the database
let insertRole = (role, salary, id) => {
    connection.query(sqlStorage.insertNewRole, [role, salary, id])
}

// Intermediary function to call insertDepartment with await, helps handle async issues with inquirer + mysql
let addRole = async (role) => {

    let departments = await getAllDepartments(); // need IDs of departments
    formatGlobalDepartments(departments)

    let roleAnswers = await promptForRoles();

    let id = (departmentsArray.filter(object => object.name === roleAnswers.newRoleDepartment))[0].id
    await insertRole(role, roleAnswers.salary, id)
    main(); // go back to start
}

let promptForRoles = async () => {
    let departmentChoices = [] //list of departments to choose from
    departmentsArray.forEach(element => {
        departmentChoices.push(element.name)
    })

    const prompts = [
        {
            type: 'list',
            name: 'newRoleDepartment',
            message: 'What department is this role for?',
            choices: departmentChoices
        },
        {
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

// inserts new employee into the DB
let insertEmployee = (first, last, id, manager) => {
    connection.query(sqlStorage.insertNewEmployee, [first, last, id, manager])
}

// Intermediary function to call sql code with await, helps handle async issues with inquirer + mysql
let addEmployee = async () => {
    let roles = await getRolesRaw();
    formatGlobalRolesArray(roles)
    // rolesArray = [];
    // roles.forEach(element => {
    //     let newObj = {
    //         id: element.id,
    //         title: element.title,
    //         salary: element.salary,
    //         departmentID: element.department_id
    //     }
    //     rolesArray.push(newObj)
    // })

    let employees = await getAllEmployees();
    formatGlobalEmployees(employees)
    // employeeArray = [];

    // employees.forEach(element => {
    //     let newObj = {
    //         id: element.id,
    //         firstName: element.first_name,
    //         lastName: element.last_name
    //     }

    //     employeeArray.push(newObj)
    // })

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

// prompts for updating an employee
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

// code to update the employee requested with a new role
let sendUpdateRequest = (id, role) => {
    connection.query(`update employee set role_id=? where id=?`, [role, id])
}
// Intermediary function to call mysql code with await, helps handle async issues with inquirer + mysql
let updateEmployee = async () => {

    // preFetch roles to have IDs
    let roles = await getRolesRaw();
    formatGlobalRolesArray(roles);

    let employees = await getAllEmployees();
    formatGlobalEmployees(employees)

    let answers = await promptEmployeeUpdate()

    // get employee ID  of employee to update
    let employeeId = (employeeArray.filter(object => object.firstName + ' ' + object.lastName === answers.employeeToUpdate))[0].id
   
    // get role ID of role to change to
    let roleId = (rolesArray.filter(object => object.title === answers.roleToChangeTo))[0].id;
    await sendUpdateRequest(employeeId, roleId)
    main(); //back to start
}

// formats the local save of roles in DB
let formatGlobalRolesArray = (roles) =>{
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
}

let formatGlobalEmployees = (employees) =>{
    employeeArray = [];

    employees.forEach(element => {
        let newObj = {
            id: element.id,
            firstName: element.first_name,
            lastName: element.last_name
        }

        employeeArray.push(newObj)
    })
}

let formatGlobalDepartments = (departments) =>{
    departmentsArray = [];
    departments.forEach(element => { //creates a local save of what is in the db, primarily for IDs
        let newObj = {
            id: element.id,
            name: element.name
        }
        departmentsArray.push(newObj)
    });
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