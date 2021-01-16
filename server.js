const inquirer = require("inquirer")
const mysql = require("mysql")

const teamCollection = async (inputs = []) => {
    const prompts = [
        {
            type: 'list',
            name: 'action',
            message: 'What role does this member have?',
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
        {
            type: 'input',
            name: 'firstName',
            message: 'Team member first name:'
        },
        // {
        //     type: 'input',
        //     name: 'lastName',
        //     message: 'Team member last name:'
        // },
        // {
        //     type: 'input',
        //     name: 'id',
        //     message: 'What is their employee ID?'
        // },
        // {
        //     type: 'input',
        //     name: 'email',
        //     message: 'What is their email'
        // },
        // //Intern question(s)
        // {
        //     type: 'input',
        //     name: 'school',
        //     message: 'What school do they go to?',
        //     when: (answers) => answers.role === 'Intern'
        // },
        // // Manager
        // {
        //     type: 'input',
        //     name: 'officeNumber',
        //     message: 'What is their office number?',
        //     when: (answers) => answers.role === 'Manager'
        // },
        // //Engineer
        // {
        //     type: 'input',
        //     name: 'github',
        //     message: 'What is their github?',
        //     when: (answers) => answers.role === 'Engineer'
        // },
        // {
        //     type: 'confirm',
        //     name: 'again',
        //     message: 'Enter another team member?',
        //     default: 'true'
        // }
    ];

    const answers = await inquirer.prompt(prompts)
    return answers;
}

const main = async () => {
    while (true) {
        const input = await teamCollection()
        console.log(input)
        switch (input.action) {
            case "View All Employees":  // Min

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
    }
}

main();