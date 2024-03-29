DROP DATABASE IF EXISTS employee_handler_db;
CREATE DATABASE employee_handler_db;

USE employee_handler_db;

CREATE TABLE department (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dpt_name VARCHAR(30)
);

CREATE TABLE role (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    FOREIGN KEY (department_id)
    REFERENCES department(id)
    ON DELETE SET NULL
);

CREATE TABLE employee (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT,
    manager_id INT,
    FOREIGN KEY (role_id)
    REFERENCES role(id)
    ON DELETE SET NULL,
    FOREIGN KEY (manager_id)
    REFERENCES employee(id)
    ON DELETE SET NULL
);

SELECT * FROM employee AS e    
JOIN role AS r  
ON e.role_id = r.id 

