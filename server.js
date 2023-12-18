// const express = require('express')
import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcrypt";
const app = express();

// auto converts text to json if possible
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
    host: "127.0.0.1", // ip or hostname
    port: 3307,        // port if not using default port which is 3306
    user: "root",      //database username 
    password: "",      //database password
    database: "first_database" // our database name
  });

app.post('/login', function (req, res) {
    console.log("inside login")
    const frontendPassword = req.body.password
    const frontendEmail = req.body.emailAddress

    const myQuery = `SELECT * FROM first_database.table_users WHERE email_address = "${frontendEmail}"`;
    connection.query(myQuery, function (err, result) {
        if (err) throw err; 
        console.log("id result from database: ", result);
        if (result && result[0] && result[0].id) {
            const hashedPassword = result[0].password;

            console.log('password from frontend: ', frontendPassword);
            console.log('hashedPassword: ', hashedPassword);

            const checkIfPasswordCorrect = bcrypt.compareSync(frontendPassword, hashedPassword);

            res.send({ "success": checkIfPasswordCorrect })
        } else {
            res.send({ "success": false, "error": "invalid credentials" })
        }
    });
});

app.post('/check-email', function (req, res) {
    console.log("inside check-email")
    const frontendEmail = req.body.emailAddress
    console.log("frontendEmail: ", frontendEmail)
    const myQuery = `SELECT * FROM first_database.table_users WHERE email_address = "${frontendEmail}"`;
    connection.query(myQuery, function (err, result) {
        if (err) throw err; 
        // console.log("id result from database: ", result);
        if (result && result[0] && result[0].id) {
            res.send({ "found": true })
        } else {
            res.send({ "found": false })
        }
    });
});

app.post('/register/true', function (req, res) {
    console.log("inside register/true...")
    res.send({"success": false, "msg": "Email address already used."})
});

app.post('/register', function (req, res) {
    console.log("inside register...")
    // console.log("Result? ", req)
    const frontendFirstName = req.body.firstName
    const frontendLastName = req.body.lastName
    const frontendMobile = req.body.mobileNumber
    const frontendEmail = req.body.emailAddress
    const frontendPassword = req.body.password
    const frontendRePassword = req.body.rePassword

    // need to check if email is already used
    console.log("Checking email address: ", frontendEmail, " if already used...")

    // checking passwords if match
    console.log("Checking below passwords if matched...")
    console.log("password: ", frontendPassword)
    console.log("rePassword: ", frontendRePassword)
    if(frontendPassword === frontendRePassword) {
        console.log("Passwords match...")
        bcrypt.hash(frontendPassword, 10, function (err, result) {
            if (err) throw err;

            console.log("hashed password: ", result);
            const myQuery = `INSERT INTO first_database.table_users (first_name,
                                                                     last_name,
                                                                     email_address,
                                                                     mobile_number,
                                                                     password)
                                                             VALUES ("${frontendFirstName}",
                                                                     "${frontendLastName}",
                                                                     "${frontendEmail}",
                                                                     "${frontendMobile}",
                                                                     "${result}")`;

            connection.query(myQuery, function (err, result) {
                if (err) throw err;

                console.log("id result from database: ", result);
            });
        });
        res.send({"success": true})
    }
    else {
        console.log("password not same")
        res.send({"success": false, "msg": "Passwords did not match. Please try again."})
    }
});

connection.connect(function(err) {
    if (err) throw err;
    
    console.log('MYSQL DB CONNECTION SUCCESS!')
    app.listen(3000)
    console.log('App is now running on port: ', 3000)
});

// app.listen(3000)