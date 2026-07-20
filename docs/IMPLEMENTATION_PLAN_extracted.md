# IMPLEMENTATION PLAN.docx

IMPLEMENTATION PLAN

complete Adaptive Multimodal Biometric System (AMBS) consisting of:

A web interface 

AI modules (Face + Gait) 

Adaptive authentication engine 

Context-aware risk engine 

Fusion engine 

Database 

Access Control Interface 

Hardware controller 

Physical door lock 

Evaluation platform 

Everything below is aligned with your proposal and Chapter 4. 

MASTER IMPLEMENTATION ROADMAP

I would divide the project into 8 phases.

PHASE 1Planning↓PHASE 2Development Environment↓PHASE 3Software Development↓PHASE 4AI Development↓PHASE 5Hardware Development↓PHASE 6System Integration↓PHASE 7Testing↓PHASE 8Evaluation

PHASE 1 — BUY YOUR COMPUTER

This is the most important purchase.

Do NOT buy a cheap laptop.

You will train AI models.

Run Docker.

Run databases.

Run cameras.

Run Jetson.

Run IDEs.

Run virtual machines.

Everything at once.

Minimum PC

CPU

Intel Core i7 13th Generation

OR

AMD Ryzen 7 7700

RAM

32 GB

Storage

1 TB NVMe SSD

GPU

RTX 4060

Windows 11 Pro

Recommended

Intel Core Ultra 9

64 GB RAM

2 TB SSD

RTX 4070

This machine will comfortably last your PhD.

PHASE 2 — BUY THE AI DEVICE

I recommend NOT starting with Raspberry Pi.

Your research requires

Real-time

Face Recognition

Gait Recognition

Adaptive AI

Fusion

Risk Analysis

Raspberry Pi 5 can do some of this, but it will quickly become a bottleneck.

I recommend

NVIDIA Jetson Orin Nano Super Developer Kit (8GB)

Why?

Built specifically for AI at the edge 

CUDA acceleration 

TensorRT optimization 

Excellent support for OpenCV, PyTorch, TensorFlow, DeepStream 

More aligned with your "Edge AI" and "real-time processing" requirements than a Raspberry Pi 

If your budget allows, I would use the Jetson from the beginning instead of planning to upgrade later.

PHASE 3 — BUY HARDWARE

AI Hardware

NVIDIA Jetson Orin Nano Super Developer Kit 

256 GB High-Speed microSD (or NVMe SSD if using a carrier board) 

Official power supply 

Jetson cooling fan (if not included) 

Camera

I recommend

NVIDIA compatible IMX477 Camera

or

Arducam IMX477

High quality

12 MP

Good low-light performance

Perfect for facial recognition.

Gait Camera

Your facial camera should not also capture gait.

Buy a second camera.

Even a Logitech Brio or another HD USB camera works.

One camera

↓

Face

Second camera

↓

Gait

Access Control Hardware

Electric Strike Lock

Magnetic Lock (600 lb)

Door Position Sensor

Exit Button

Relay Module

Power Supply

Emergency Break Glass

Door Closer

Networking

Gigabit Switch

Cat6 Cable

RJ45 Connectors

Router

PHASE 4 — BUY ELECTRONICS

USB Keyboard

USB Mouse

24-inch Monitor

UPS (to protect the Jetson and PC)

External SSD (2 TB) for datasets and backups

PHASE 5 — INSTALL SOFTWARE

Now we prepare the development environment.

Operating System

Windows 11 Pro on your PC.

Jetson:

Ubuntu (JetPack)

IDE

Install

Visual Studio Code

PyCharm Professional (if you have access through NWU or JetBrains educational licensing)

I personally recommend PyCharm Professional for this project because of its excellent Python, database, and web development support.

Version Control

Git

GitHub Desktop

Create a private GitHub repository.

Commit your work every day.

Python

Install

Python 3.12

During installation

☑ Add Python to PATH

Database

PostgreSQL

pgAdmin 4

API Development

FastAPI

Swagger UI (comes with FastAPI)

AI Libraries

Install:

OpenCV 

TensorFlow 

PyTorch 

torchvision 

torchaudio 

MediaPipe 

DeepFace 

InsightFace 

NumPy 

Pandas 

SciPy 

scikit-learn 

Ultralytics (YOLO) 

ONNX Runtime 

TensorRT (on Jetson) 

Web Development

HTML5

CSS3

Bootstrap

JavaScript

Jinja2 (if using server-side templates)

Development Tools

Docker Desktop

Postman

DBeaver (optional)

Draw.io

PlantUML

StarUML (optional)

PHASE 6 — CREATE THE PROJECT

Create this folder.

AMBS│├── backend├── frontend├── ai├── api├── database├── docs├── hardware├── models├── datasets├── tests├── logs├── reports└── thesis

PHASE 7 — BUILD THE SYSTEM

Exactly in this order.

Stage 1

Administrator Login

↓

Dashboard

Stage 2

User Management

Add User

Delete User

Edit User

Search User

Stage 3

Enrollment

Capture Face

Capture Gait

Generate Templates

Save

Stage 4

Authentication

Capture

↓

Quality Assessment

↓

Feature Extraction

↓

Matching

Stage 5

Adaptive Modality Selection

Implement the logic from your Chapter 4:

Face only 

Gait only 

Face + Gait 

depending on quality and conditions.

Stage 6

Fusion Engine

Score-level fusion

↓

Fusion Score

Stage 7

Risk Engine

Evaluate:

Time 

Location 

Frequency 

Access schedule 

High-security area 

↓

Risk Score

Stage 8

Decision Engine

Grant

Reject

Step-up

Stage 9

Access Control Interface

Your own API that sends decisions to the controller.

Do not build around Gallagher.

Instead, make Gallagher (or any other controller) a possible integration later.

Stage 10

Hardware

Jetson

↓

Relay

↓

Electric Lock

↓

Door

PHASE 8 — TESTING

Create datasets.

Test

Face Recognition

Gait Recognition

Fusion

Risk Engine

Adaptive Selection

Response Time

Spoofing

False Acceptance Rate (FAR)

False Rejection Rate (FRR)

Equal Error Rate (EER)

CPU Usage

Memory Usage

Latency

BUDGET (Approximate)

Item

Estimated Cost (ZAR)

High-performance PC

R35,000–R55,000

NVIDIA Jetson Orin Nano Super Developer Kit

R6,000–R10,000

Cameras (2)

R3,000–R8,000

Electronic Lock Hardware

R3,000–R6,000

Networking & Cabling

R2,000–R5,000

UPS

R2,000–R4,000

External SSD

R2,000–R3,500

Miscellaneous (connectors, mounting, tools)

R2,000–R5,000

Total estimated budget: R55,000–R95,000, depending on your PC and camera choices.

The one thing I would do before spending money

Although you're ready to implement, I would spend one week creating a Software Design Specification (SDS) based on your Chapter 4. It should define:

Every screen in the web interface 

Every database table 

Every API endpoint 

Every software module 

Every AI model 

Every hardware connection 

Every test case 

The folder structure 

The deployment architecture 

Once the SDS is complete, implementation becomes a series of planned engineering tasks instead of trial and error.

What I propose next

Rather than giving you isolated pieces of advice, I suggest we treat this like a real commercial software project. We can work through it in order, producing documents and code that you can use directly.

I recommend creating Volume 1: AMBS Software Design Specification (SDS). This would be a professional document of around 150–250 pages, derived directly from your proposal and Chapter 4, covering the complete implementation blueprint: user interface designs, database schema, API specifications, AI module design, hardware architecture, security controls, deployment plan, testing strategy, and traceability back to your research objectives and requirements. Once that document is complete, you'll know exactly what to build, in what order, and why—without guessing at any stage of the implementation.

Yes—almost everything I recommended is free, especially the software you'll use for your PhD. One of the advantages of AI research is that the software ecosystem is largely open source.

Here's a breakdown.

Software

Purpose

Free?

Recommendation

Windows 11 Pro

Operating System

❌ Paid (often included with PC)

✔ Yes

Ubuntu (Jetson)

Operating System

✅ Free

✔ Yes

Python

Programming Language

✅ Free

Essential

Visual Studio Code

IDE

✅ Free

Essential

PyCharm Community

IDE

✅ Free

Good

PyCharm Professional

IDE

❌ Paid (free educational licence available)

Best if available through NWU

Git

Version Control

✅ Free

Essential

GitHub

Source Code Repository

✅ Free

Essential

PostgreSQL

Database

✅ Free

Essential

pgAdmin

Database Management

✅ Free

Essential

FastAPI

Backend Framework

✅ Free

Essential

Docker Desktop

Containers

✅ Free for personal/education/small organizations

Recommended

Postman

API Testing

✅ Free tier

Recommended

Draw.io

Diagrams

✅ Free

Essential

PlantUML

UML Diagrams

✅ Free

Recommended

AI Libraries

These are all 100% free.

Library

Free

OpenCV

✅

TensorFlow

✅

PyTorch

✅

torchvision

✅

torchaudio

✅

MediaPipe

✅

DeepFace

✅

InsightFace

✅

NumPy

✅

Pandas

✅

SciPy

✅

Scikit-learn

✅

ONNX Runtime

✅

TensorRT (Jetson)

✅ Included with JetPack

Ultralytics YOLO

✅ Open-source version

NVIDIA Software

Also free.

Software

Free

JetPack SDK

✅

CUDA Toolkit

✅

cuDNN

✅

TensorRT

✅

DeepStream SDK

✅

These are included in NVIDIA's Jetson software ecosystem.

Web Development

Everything is free.

HTML5 ✅ 

CSS3 ✅ 

JavaScript ✅ 

Bootstrap ✅ 

Jinja2 ✅ 

Data Science

Free.

Jupyter Notebook 

JupyterLab 

Anaconda (individual edition) 

Spyder 

Documentation

Free.

Microsoft Word (if you have Office through NWU) 

LibreOffice 

Markdown editors 

Things That Cost Money

These are mainly hardware or commercial software:

Item

Cost?

High-performance PC

💰

NVIDIA Jetson Orin Nano

💰

Cameras

💰

Door Lock

💰

Relay Module

💰

UPS

💰

Network Switch

💰

Cables

💰

What I Would Install First

If you bought your PC today, I would install software in this exact order:

Windows 11 updates 

Google Chrome 

Visual Studio Code 

Git 

GitHub Desktop 

Python 3.12 

PostgreSQL 

pgAdmin 

Docker Desktop 

Postman 

Draw.io Desktop 

Python AI libraries (TensorFlow, PyTorch, OpenCV, etc.) 

NVIDIA JetPack (when your Jetson arrives) 

This order minimizes compatibility issues and gets your development environment ready quickly.

My recommendation for your PhD

Given that this is a Computer Science PhD, I would avoid paying for software unless there is a clear research benefit. Nearly everything you need is available as mature, open-source software.

The only items I would consider paying for are:

A powerful computer (this is the most important investment) 

NVIDIA Jetson Orin Nano Super Developer Kit 

Quality cameras 

Access control hardware 

Everything else can realistically be done using free software.

One more recommendation

Since your implementation will likely span 12–18 months, I recommend we create a complete implementation handbook before you buy anything. It would include:

Every hardware item to purchase (with recommended specifications) 

Every software package to install 

The installation order 

The project folder structure 

The database design 

The development roadmap 

The testing plan 

The deployment plan 

That way, you can follow it step by step without having to decide what to do next at each stage. I think this will save you a significant amount of time and help keep your implementation aligned with your proposal and Chapter 4.

Top of Form

Bottom of Form