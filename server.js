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

const responseCollection = async (inputs = []) => {
    const prompts = [
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View All Employees',
                'View By Department',
                'View By Manager',
                'Add Employee',
                'Remove Employee',
                'Update Employee',
                'Update Employee Role',
                'Update Employee Manager',
                'View All Roles',
                'Add New Role',
                'Remove Role'
            ]
        },
    ];

    const answers = await inquirer.prompt(prompts)
    return answers;
}

let getAllEmployees = () => {
    // Get all employees and their information from the database
    console.log("--- Accessing all employees ---")

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

    // Print results
    console.table(employees)

    // console.log(employees)
    main() // go back to start

    // await responseCollection(); // other prompts pertaining what they wanted depending on the context of the situation
}

const main = async () => {

    // viewEmployees();

    //  while (true) {
        let answers = await responseCollection().then(answers => {

            switch (answers.action) {
                case "View All Employees":  // Min
                    viewEmployees();
                    break;

                case "View By Department": // Min

                    break;

                case "View By Manager": // Min

                    break;

                case "View All Roles": // Min

                    break;

                case "Update Employee Role": // Min

                    break;

                case "View Departments": // Min

                    break;

                case "Add Employee":

                    break;

                case "Add Employee":

                    break;

                case "Remove Employee":

                    break;

                case "Update Employee Manager":

                    break;

                case "Add New Role":

                    break;

                case "Remove Role":

                    break;

                default:
                    break;
            }
        })
    //  }
}

main();