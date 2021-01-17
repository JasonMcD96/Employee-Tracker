class Prompts {
    constructor(){
        this.mainPrompt = [
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    'View All Employees',
                    'View All Departments',
                    'View All Roles',
                    'Add Employee',
                    'Add Department',
                    'Add New Role',
                    'Update Employee Role'
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

    }
}

module.exports = Prompts;