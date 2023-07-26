const inquirer = require('inquirer');
// const MarkDown = require('./utils/generateMarkdown')
const fs = require('fs');
const mysql = require('mysql2');
const { error } = require('console');

const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // TODO: Add MySQL password here
      password: 'Nomina2023',
      database: 'employee_handler_db'
    },
    console.log(`Connected to the movies_db database.`)
  );

const questions = [
    // {
    //   type: 'input',
    //   name: 'username',
    //   message: 'What is your GitHub username?',
    // },
    {
      type: 'list',
      name: 'actionToDo',
      message: 'What would you like to do?',
      choices: ['Update', 'View roles', 'Add role', 'View dpts', 'Add dpt', 'Quit', 'View employees'],
    },
    // {
    //   type: 'input',
    //   name: 'commandInstall',
    //   message: 'What command should be run to install dependencies?',
    // },
];

// const Q1 = [
//     {
//         type: 'input',
//         name: 'add Role',
//         if (questions.ActionToDo === Add role) {
//             message: 'Write the role',
//         }
//     }
// ]



// function init() {
//   return inquirer.prompt(questions)
//     .then((answers) => {
//       const mark = MarkDown.generateReadme(answers)
//       fs.writeFile('README.md', mark, function(err) {
//       err ? console.log(err) : console.log('Generating README...')
//     })
//   }
// )}
const init = async () => {
    inquirer.prompt(questions)
    .then (({actionToDo}) => {
        switch (actionToDo) {
            case 'Add dpt':
                
            return addDpt ()
            case 'View dpts':
                
            return viewDpts ()
            default:
                break;
        }
    })
}

// .then(function (choice) {
//     console.log(choice);
//     if (choice.actionToDo === 'Add dpt') {
//         console.log("Add dpt");
        const addDpt = () => {
            const Q1 = [
                {
                    type: 'input',
                    name: 'department_name',
                    message: 'Write the name of the dpt',
                  },
            ]
            inquirer.prompt(Q1)
            .then((response) => {
                console.log(response)
                db.query('INSERT INTO department SET ?', response, (err, result) => {
                    if (err) throw error
                    console.log('Dpt has been added')
                    init ();
                })
            })
        }

    // }
// })

const viewDpts = () => {
        db.query('SELECT * FROM department', (err, result) => {
            if (err) throw error
            console.table(result)
            init ();
        })
    }

const viewEmployees = () => {
    "SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;"
    db.query('SELECT * FROM department', (err, result) => {
        if (err) throw error
        console.table(result)
        init ();
    })
}

init();