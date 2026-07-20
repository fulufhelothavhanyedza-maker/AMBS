# PRESENTATION LAYER 1.docx

I actually think we should do something much better.

Don't think of this as "building the Presentation Layer."

Think of it as building Version 1.0 of your AMBS.

If I were supervising your PhD, I would break it down into small engineering tasks. Every task ends with something that works. You gain confidence because at the end of each day you can actually see progress.

After reviewing your Chapter 4, the Presentation Layer is responsible for:

User interaction 

Authentication interface 

Enrollment 

Administration 

Monitoring 

Reporting 

Feedback 

Configuration 

It is not responsible for AI or decision-making. 

PHASE 1 – PRESENTATION LAYER

Duration

2 weeks

WEEK 1

DAY 1 – Prepare your PC

Step 1. Install Google Chrome

Purpose

To run your AMBS.

Step 2. Install Visual Studio Code

Purpose

This is where you will write all your code.

Download

https://code.visualstudio.com

Install all defaults.

Step 3. Install Python

Download

https://python.org

During installation

✔ Add Python to PATH

Why?

We won't use it today.

But later

FastAPI

AI

Database

will all use Python.

Step 4. Install Git

Purpose

Version control.

Think of it as

Undo

for your whole project.

Step 5. Install GitHub Desktop

Purpose

Back up your work every day.

End of Day 1

Your PC now has

✔ Chrome

✔ VS Code

✔ Python

✔ Git

✔ GitHub Desktop

Nothing else.

DAY 2

Create your project

Open VS Code.

Create a folder called

AMBS

Inside create

AMBS

│

├── frontend

├── css

├── javascript

├── images

└── docs

Now inside frontend

Create

login.html

dashboard.html

users.html

enrollment.html

authentication.html

monitoring.html

audit.html

reports.html

settings.html

Inside css

Create

style.css

Inside javascript

Create

app.js

Congratulations.

You now have a real software project.

DAY 3

Learn HTML

Before we build anything

Understand what HTML is.

Imagine building a house.

HTML is

the bricks.

CSS

is the paint.

JavaScript

is electricity.

Python

is the plumbing hidden behind the walls.

First HTML

Open

login.html

Type

<!DOCTYPE html>

<html>

<head>

<title>Adaptive Multimodal Biometric System</title>

</head>

<body>

<h1>Adaptive Multimodal Biometric System</h1>

</body>

</html>

Save.

Double-click

login.html

Chrome opens.

You have just written your first web page.

DAY 4

Add Bootstrap

Bootstrap is a free framework that makes websites look professional.

Instead of designing buttons from scratch, you use pre-built components.

In the <head> section of login.html, add the Bootstrap stylesheet:

<link

href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"

rel="stylesheet">

Now Bootstrap is available.

DAY 5

Build the Login Screen

Replace the contents of the <body> with:

<div class="container mt-5">

<h2 class="text-center">

Adaptive Multimodal Biometric System

</h2>

<form>

<div class="mb-3">

<label>Username</label>

<input

type="text"

class="form-control">

</div>

<div class="mb-3">

<label>Password</label>

<input

type="password"

class="form-control">

</div>

<button

class="btn btn-primary">

Login

</button>

</form>

</div>

Save.

Refresh Chrome.

Congratulations.

You have your first AMBS screen.

DAY 6

Improve it.

Add

University logo

AMBS logo

Version Number

Copyright

Footer

Example

University of Limpopo

Adaptive Multimodal Biometric System

Version 1.0

DAY 7

Make the Login button work.

Inside

app.js

write

document.querySelector("form")

.addEventListener("submit", function(event){

event.preventDefault();

window.location.href="dashboard.html";

});

Now

Login

opens

Dashboard.

WEEK 2

Now we create each page.

Dashboard

Create

dashboard.html

Display

Today's Authentication Attempts

Successful

Failed

High Risk

Online Cameras

Online Access Points

System Status

Recent Events

These values can be static for now.

Later

Python

will supply them.

User Management

Create

users.html

Display

Add User

Edit User

Delete User

Search User

No database.

Just buttons.

Enrollment

Create

enrollment.html

Display

Name

Surname

Student Number

Department

Capture Face

Capture Gait

Save

Notice

Capture buttons

don't do anything yet.

Authentication

Create

authentication.html

Display

Live Camera

Face Quality

Gait Quality

Selected Modality

Fusion Score

Risk Score

Decision

Every field comes directly from your architecture and activity diagram. 

Monitoring

Create

monitoring.html

Table

Time

User

Location

Decision

Status

Audit Logs

Create

audit.html

Date

User

Action

Description

Reports

Create

reports.html

Display

Daily

Weekly

Monthly

Authentication Accuracy

FAR

FRR

EER

Settings

Create

settings.html

Display

Face Threshold

Gait Threshold

Fusion Weight

Risk Threshold

Retry Limit

At the end of Phase 1

Your AMBS should look like this.

AMBS

↓

Login

↓

Dashboard

↓

Users

↓

Enrollment

↓

Authentication

↓

Monitoring

↓

Audit Logs

↓

Reports

↓

Settings