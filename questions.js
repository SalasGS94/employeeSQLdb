const inquirer = require('inquirer');
// const MarkDown = require('./utils/generateMarkdown')
const fs = require('fs');
const mysql = require('mysql2');
const { error } = require('console');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'Nomina2023',
      database: 'employee_handler_db'
    },
    console.log(`Connected to the movies_db database.`)
  );

const HomeQuestions = [
    {
      type: 'list',
      name: 'actionToDo',
      message: 'What would you like to do?',
      choices: ['Update', 'View roles', 'Add role', 'View dpts', 'Add dpt', 'Quit', 'View employees', 'Add employee'],
    },
];

const init = async () => {
    inquirer.prompt(HomeQuestions)
    .then (({actionToDo}) => {
        switch (actionToDo) {
            case 'Update dpt':
            return q1updateDpt ()

            case 'View roles':
            return q2viewRoles ()

            case 'Add role':
            return q3addRole ()

            case 'View dpts':
            return q4viewDpts ()

            case 'Add dpt':    
            return q5addDpt ()

            case 'Quit':
            return q6quitQ ()

            case 'View employees':
            return q7viewEmp ()
            
            case 'Add employee':
            return q8addEmp ()

            default:
                break;
        }
    })
}

    const q1updateDpt = () => {}

    const q2viewRoles = () => {
        db.query('SELECT * FROM role', (err, res) => {
            if (err) throw error
            console.table(res)
            init ();
        })
    }

    const q3addRole = () => {
        db.query('SELECT * FROM department', (err, res) => {
            if (err) throw error;
            let dptArray = [];
            res.forEach((department) => {dptArray.push(department.dpt_name)})
            inquirer.prompt([
            {
                type: 'list',
                name: 'dpt_name',
                message: 'What dpt does this role belong to?',
                choices: dptArray
            }
            ])
            .then((answer) => {addRoleInfo(answer)});
            const addRoleInfo = (dptData) => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'title',
                    message: "What is the role's title?",
                },
                {
                    type: 'input',
                    name: 'salary',
                    message: "What is the salary of the role?",
                },
            ])
            .then((answer) => {
            let dptId;
            res.forEach((department) => {
                if (dptData.dpt_name === department.dpt_name) {dptId = department.id;}
            })
            let q3group = [answer.title, answer.salary, dptId]
            db.query('INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)', q3group, (err) => {
            if (err) throw error;
            console.log('Role successfully created!')
            init ();
            })
          }) 

         }; 
        });
    }

    const q4viewDpts = () => {
        db.query('SELECT * FROM department', (err, res) => {
            if (err) throw error
            console.table(res)
            init ();
        })
    }

    const q5addDpt = () => {
        const addDpt = [
            {
                type: 'input',
                name: 'dpt_name',
                message: 'Write the name of the dpt',
            },
        ]
        inquirer.prompt(addDpt)
        .then((response) => {
            console.log(response)
            db.query('INSERT INTO department SET ?', response, (err, result) => {
                if (err) throw error
                console.log('Dpt has been added')
                init ();
            })
        })
    }

    const q6quitQ = () => {
        process.exit()
    }

    const q7viewEmp = () => {
        db.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, role.department_id, department.dpt_name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id;", (err, res) => {
            if (err) throw error
            console.table(res)
            init ();
        })
    }

    const q8addEmp = () => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: "First name",
            },
            {
                type: 'input',
                name: 'lastName',
                message: "Last name",
            },
        ])
        .then(answer => {
            const group = [answer.firstName, answer.lastName]
            db.query('SELECT role.id, role.title FROM role', (err, data) => {
                if (err) throw error;
                const roles = data.map(({ id, title }) => ({ name: title, value: id }));
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the employee's role?",
                        choices: roles
                    }
                ])
                .then(roleSelect => {
                    const role = roleSelect.role
                    group.push(role);
                    db.query('SELECT * FROM employee', (err, data) => {
                        if (err) throw error
                        const managers = data.map(({id, first_name, last_name}) => ({name: first_name + " "+ last_name, value: id}))
                        inquirer.prompt([
                            {
                              type: 'list',
                              name: 'manager',
                              message: "Who is the manager of this employee?",
                              choices: managers
                            }
                          ])
                          .then(managerSelect => {
                            const manager = managerSelect.manager;
                            group.push(manager)
                            db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)', group, (err) => {
                            if (err) throw error;
                            console.log("Employee successfully created!")
                            init();
                      })
                     })//from .then(managerSelect)
                    })//from SELECT * emp
                })//from roleSelect
            })//from SELECT role.id
        })//from .then(answer)... after prompt
    } //from q8addEmp

init();