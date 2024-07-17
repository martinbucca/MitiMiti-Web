CREATE SCHEMA `mitimiti` ;

create table mitimiti.currencies
(
    id       int auto_increment
        primary key,
    currency varchar(45) not null,
    country  varchar(45) not null
);

create table mitimiti.currency_rates
(
    id            int auto_increment
        primary key,
    currency_1_id int   not null,
    currency_2_id int   not null,
    value         float not null,
    constraint fk_currency_1_id
        foreign key (currency_1_id) references mitimiti.currencies (id),
    constraint fk_currency_2_id
        foreign key (currency_2_id) references mitimiti.currencies (id)
);

create table mitimiti.`groups`
(
    id          int auto_increment
        primary key,
    name  varchar(45)  not null,
    description varchar(250) null,
    status   tinyint     not null,
    photo  varchar(60) null
);

create table mitimiti.users
(
    id         int auto_increment
        primary key,
    email   varchar(45) not null,
    first_name varchar(45) not null,
    last_name   varchar(45) not null,
    phone   varchar(10) null,
    password  varchar(60) not null,
    oauth  varchar(60) null,
    photo  varchar(60) null
);

CREATE TABLE mitimiti.members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(45) NOT NULL,
    user_id INT NULL,
    status TINYINT NOT NULL,
    CONSTRAINT fk_members_users FOREIGN KEY (user_id) REFERENCES mitimiti.users (id)
);

create table mitimiti.group_members
(
    id        int auto_increment
        primary key,
    group_id  int     not null,
    member_id int     not null,
    status    VARCHAR(45) not null,
    role VARCHAR(45) NOT NULL,
    constraint fk_group_members_group
        foreign key (group_id) references mitimiti.`groups` (id),
    constraint fk_group_members_members
        foreign key (member_id) references mitimiti.members (id)
);

create index fk_group_members_group_idx
    on mitimiti.group_members (group_id);

create index fk_group_members_members_idx
    on mitimiti.group_members (member_id);

create index fk_members_users_idx
    on mitimiti.members (user_id);

create table mitimiti.expenses
(
    id          int auto_increment
        primary key,
    value       int          not null,
    group_id    int          not null,
    member_id   int          not null,
    status      VARCHAR(45)  not null,
    currency_id int          not null,
    description varchar(250) null,
    location    varchar(100) null,
    date        datetime     not null,
    constraint fk_expenses_currency
        foreign key (currency_id) references mitimiti.currencies (id),
    constraint fk_expenses_group
        foreign key (group_id) references mitimiti.`groups` (id),
    constraint fk_expenses_member
        foreign key (member_id) references mitimiti.members (id)
);



create index fk_expenses_currency_idx
    on mitimiti.expenses (currency_id);

create index fk_expenses_group_idx
    on mitimiti.expenses (group_id);

create index fk_expenses_member_idx
    on mitimiti.expenses (member_id);


create table mitimiti.expense_assignees
(
    id        int auto_increment
        primary key,
    expense_id int     not null,
    member_id  int     not null,
    status    tinyint not null,
    constraint fk_expense_assignees_expense
        foreign key (expense_id) references mitimiti.expenses (id),
    constraint fk_expense_assignees_member
        foreign key (member_id) references mitimiti.members (id)
);

create index fk_expense_assignees_expense_idx
    on mitimiti.expense_assignees (expense_id);

create index fk_expense_assignees_member_idx
    on mitimiti.expense_assignees (member_id);

INSERT INTO mitimiti.currencies (id, currency, country) VALUES (1, 'ARS', 'Argentina');
INSERT INTO mitimiti.currencies (id, currency, country) VALUES (2, 'USD', 'United States');
INSERT INTO mitimiti.currencies (id, currency, country) VALUES (3, 'EUR', 'European Union');
INSERT INTO mitimiti.currencies (id, currency, country) VALUES (4, 'GBP', 'United Kingdom');
INSERT INTO mitimiti.currencies (id, currency, country) VALUES (5, 'BRL', 'Brazil');
INSERT INTO mitimiti.currencies (id, currency, country) VALUES (6, 'UYU', 'Uruguay');
INSERT INTO mitimiti.currencies (id, currency, country) VALUES (7, 'CLP', 'Chile');
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (1, 1, 2, 0.0008333);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (2, 2, 1, 1200);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (3, 1, 3, 0.0007692);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (4, 3, 1, 1300);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (5, 1, 4, 0.000625);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (6, 4, 1, 1600);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (7, 1, 5, 0.0043478);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (8, 5, 1, 230);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (9, 1, 6, 0.033333);
INSERT INTO mitimiti.currency_rates (id, currency_1_id, currency_2_id, value) VALUES (10, 6, 1, 30);
INSERT INTO mitimiti.users (id, email, first_name, last_name, phone, password, oauth, photo) VALUES (1, 'jgorge@fi.uba.ar', 'Julian', 'Gorge', '1234567890', '$2b$12$.JIS67913lG0pxE7H4LjMOMoPoZENt/W6h5RJ.E8EOuH2DrCT0c5K', null, null);
INSERT INTO mitimiti.users (id, email, first_name, last_name, phone, password, oauth, photo) VALUES (2, 'jandresen@fi.uba.ar', 'Joaquin', 'Andresen', '1234567890', '$2b$12$.JIS67913lG0pxE7H4LjMOMoPoZENt/W6h5RJ.E8EOuH2DrCT0c5K', null, null);
INSERT INTO mitimiti.users (id, email, first_name, last_name, phone, password, oauth, photo) VALUES (3, 'bricaldi@fi.uba.ar', 'Brayan', 'Ricaldi', '1234567890', '$2b$12$.JIS67913lG0pxE7H4LjMOMoPoZENt/W6h5RJ.E8EOuH2DrCT0c5K', null, null);
INSERT INTO mitimiti.users (id, email, first_name, last_name, phone, password, oauth, photo) VALUES (4, 'mbucca@fi.uba.ar', 'Martin', 'Bucca', '1234567890', '$2b$12$.JIS67913lG0pxE7H4LjMOMoPoZENt/W6h5RJ.E8EOuH2DrCT0c5K', null, null);
INSERT INTO mitimiti.users (id, email, first_name, last_name, phone, password, oauth, photo) VALUES (5, 'jchernandez@fi.uba.ar', 'Juan Cruz', 'Hernandez', '1111111111', '$2b$12$.JIS67913lG0pxE7H4LjMOMoPoZENt/W6h5RJ.E8EOuH2DrCT0c5K', null, null);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (11, 'jandresen', 2, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (12, 'jgorge', 1, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (13, 'bricaldi', 3, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (14, 'mbucca', 4, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (15, 'jchernandez', 5, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (16, 'Gonza', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (17, 'Facu', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (18, 'Santi', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (19, 'Eli', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (20, 'Nahue', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (21, 'Alvaro', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (22, 'Franco', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (23, 'Gian', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (24, 'Mati', null, 1);
INSERT INTO mitimiti.members (id, nickname, user_id, status) VALUES (25, 'Nacho', null, 1);
INSERT INTO mitimiti.`groups` (id, name, description, status, photo) VALUES (5, 'FIUBA Amigos', 'Ingenieria4Ever', 1, null);
INSERT INTO mitimiti.`groups` (id, name, description, status, photo) VALUES (6, 'Fulbo 5', 'Juego, juego, juego, lastimo!', 1, null);
INSERT INTO mitimiti.`groups` (id, name, description, status, photo) VALUES (7, 'Bari 2024', 'Ski/Snow', 1, null);
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (16, 5, 11, 'active', 'admin');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (17, 6, 11, 'active', 'admin');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (18, 7, 11, 'active', 'admin');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (19, 5, 12, 'active', 'admin');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (20, 5, 13, 'active', 'write');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (21, 5, 14, 'active', 'write');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (22, 5, 15, 'active', 'write');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (23, 6, 12, 'active', 'admin');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (24, 6, 16, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (25, 6, 17, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (26, 6, 18, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (27, 7, 19, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (28, 7, 20, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (29, 7, 21, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (30, 7, 22, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (31, 7, 23, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (32, 7, 24, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (33, 7, 25, 'active', 'read');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (34, 7, 14, 'active', 'admin');
INSERT INTO mitimiti.group_members (id, group_id, member_id, status, role) VALUES (35, 7, 12, 'pending', 'admin');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (11, 5000, 5, 11, 'pending', 1, 'Yerba', 'Carrefour', '2024-06-16 18:59:14');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (12, 1500, 5, 12, 'pending', 1, 'Don Satur', 'Dia', '2024-06-16 19:24:11');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (13, 9000, 6, 12, 'pending', 1, 'Reserva', 'Cancha', '2024-06-17 19:15:08');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (14, 2500, 6, 11, 'pending', 1, 'Powerade', 'Kiosco', '2024-06-17 19:50:54');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (15, 55000, 6, 17, 'pending', 1, 'Cena', 'El Ferroviario', '2024-06-17 19:53:10');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (16, 7000, 5, 15, 'pending', 1, 'Uber', 'Casa Juan', '2024-06-17 19:55:40');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (17, 900, 7, 20, 'pending', 2, 'Hotel', 'Booking', '2024-06-17 23:02:20');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (18, 360000, 7, 19, 'pending', 1, 'Vuelos', 'Despegar', '2024-06-17 23:04:38');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (19, 517000, 7, 11, 'pending', 1, 'Pases', 'Cerro Catedral', '2024-06-17 23:07:06');
INSERT INTO mitimiti.expenses (id, value, group_id, member_id, status, currency_id, description, location, date) VALUES (20, 600000, 7, 14, 'pending', 1, 'Pases', 'Unicenter', '2024-06-17 00:00:00');
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (11, 11, 11, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (12, 11, 12, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (13, 11, 13, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (14, 11, 14, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (16, 13, 11, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (17, 13, 12, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (18, 13, 16, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (19, 13, 17, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (20, 13, 18, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (21, 14, 11, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (23, 15, 11, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (24, 15, 12, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (25, 15, 16, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (26, 15, 18, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (27, 15, 17, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (28, 12, 11, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (29, 12, 13, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (30, 12, 12, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (31, 12, 14, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (34, 16, 14, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (35, 17, 11, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (36, 17, 19, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (37, 17, 20, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (38, 17, 21, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (39, 17, 23, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (40, 17, 22, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (41, 17, 24, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (42, 17, 25, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (43, 17, 14, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (44, 18, 11, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (45, 18, 19, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (46, 18, 20, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (47, 18, 21, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (48, 18, 22, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (49, 18, 23, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (50, 18, 24, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (51, 18, 25, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (52, 18, 14, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (53, 19, 19, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (54, 19, 11, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (55, 19, 20, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (56, 19, 21, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (57, 20, 23, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (58, 20, 22, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (59, 20, 24, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (60, 20, 25, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (61, 20, 14, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (64, 14, 18, 1);
INSERT INTO mitimiti.expense_assignees (id, expense_id, member_id, status) VALUES (65, 16, 15, 1);
