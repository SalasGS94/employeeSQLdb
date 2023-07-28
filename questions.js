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
      choices: ['View dpts', 'View roles', 'View employees', 'Add dpt', 'Add role', 'Add employee', 'Update role', 'Quit'],
    },
];

const init = async () => {
    inquirer.prompt(HomeQuestions)
    .then (({actionToDo}) => {
        switch (actionToDo) {
            case 'View dpts':
            return q1viewDpts ()            
            
            case 'View roles':
            return q2viewRoles ()

            case 'View employees':
            return q3viewEmp ()

            case 'Add dpt':    
            return q4addDpt ()

            case 'Add role':
            return q5addRole ()
            
            case 'Add employee':
            return q6addEmp ()            

            case 'Update role':
            return q7updateRole ()

            case 'Quit':
            return q8quitQ ()

            default:
            break;
        }
    })
}

    const q1viewDpts = () => {
        db.query('SELECT * FROM department', (err, res) => {
            if (err) throw error
            console.table(res)
            init ();
        })
    }

    const q2viewRoles = () => {
        db.query('SELECT role.id, role.title, role.salary, department.dpt_name AS department FROM role LEFT JOIN department ON role.department_id = department.id', (err, res) => {
            if (err) throw error
            console.table(res)
            init ();
        })
    }

    const q3viewEmp = () => {
        db.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.dpt_name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee manager ON manager.id = employee.manager_id;", (err, res) => {
            if (err) throw error
            console.table(res)
            init ();
        })
    }

    const q4addDpt = () => {
        const addDpt = [
            {
                type: 'input',
                name: 'dpt_name',
                message: 'Write the name of the dpt',
            },
        ]
        inquirer.prompt(addDpt)
        .then((res) => {
            console.log(res)
            db.query('INSERT INTO department SET ?', res, (err, res) => {
                if (err) throw error
                console.log('Dpt has been added')
                init ();
            })
        })
    }

    const q5addRole = () => {
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

    const q6addEmp = () => {
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
                     })
                    })
                })
            })
        })
    } 

    const q7updateRole = () => {
        db.query('SELECT CONCAT(first_name, " ", last_name) AS full_name FROM employee', (err, res) => {
            if (err) throw error
            const empArray = res.map((row) => row.full_name);
    
            db.query('SELECT title FROM role', (err, res) => {
            if (err) throw error
            const roleArray = res.map((row) => row.title);
    
            const empData = [
                {
                type: 'list',
                name: 'empSelected',
                message: "Which employee's role would yo want to update?",
                choices: empArray,
                },
                {
                type: 'list',
                name: 'roleSelected',
                message: 'Which role do you want to assign to the selected employee?',
                choices: roleArray,
                },
            ];
    
            inquirer.prompt(empData).then((answer) => {
                const empName = answer.empSelected;
                const roleName = answer.roleSelected;
    
                db.query(`SELECT id FROM role WHERE title = ?`, roleName, (err, res) => {
                    if (err) throw error
                    const concatName = 'CONCAT(first_name, " ", last_name)';
                    const arrayRoleID = res.map((row) => row.id);
                    const roleId = arrayRoleID[0];
                    db.query(`UPDATE employee SET role_id = ? WHERE ${concatName} = ?`, [roleId, empName], (err, res) => {
                        console.log('Employee role successfully updated!');
                        init();
                    }
                    );
                }
                );
            });
            });
        }
        );
    }

    const q8quitQ = () => {
        process.exit()
    }
    
init();