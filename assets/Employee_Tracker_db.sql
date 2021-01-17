-- Drops the database if it already exists 
DROP DATABASE IF EXISTS employee_tracker_db;

-- create the database 
CREATE DATABASE employee_tracker_db;

-- use database employee_tracker_db 
USE employee_tracker_db;

-- Create Tables
create table department (
    id int auto_increment not null,
    name varchar(30),
    primary key (id)
);

create table role (
    id int auto_increment not null,
    title varchar(30),
    salary decimal(10.2),
    department_id int references department(id),
    primary key (id)
);

create table employee (
    id int auto_increment not null,
    first_name varchar(30),
    last_name varchar(30),
    role_id int references role(id),
    manager_id int null references employee(id),
    primary key (id)
);

insert into department (name) values ('Engineering');
insert into department (name) values ('Human Resources');

insert into role (title, salary, department_id) values ('Software Engineer', 120000, 1);
insert into role (title, salary, department_id) values ('Accountant', 60000, 2);

insert into employee (first_name, last_name, role_id, manager_id)
    values ('Jason', 'McDonald', 1, null);
insert into employee (first_name, last_name, role_id, manager_id)
    values ('Gustavo', 'Chavez', 1, null);
    
insert into employee (first_name, last_name, role_id, manager_id)
    values ('John', 'Doe', 2, null);
    
insert into employee (first_name, last_name, role_id, manager_id)
    values ('Jane', 'Doe', 2, 3);
    