INSERT INTO department (dpt_name)
VALUES ("human resources"),
       ("accounting"),
       ("sales"),
       ("customer service");

INSERT INTO role (title, salary, department_id)
VALUES ("department head", 1000, 3),
       ("secretary", 250, 1),
       ("cashier", 200, 2),
       ("calls rep", 500, 1);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Tony", "Stark", 1, NULL),
       ("Steve", "Rogers", 2, 1),
       ("Natasha", "Romanov", 4, 1),
       ("Bruce", "Banner", 3, 1);

SELECT * FROM department;

SELECT * FROM role;

SELECT * FROM employee;