# AMBS DESIGN.docx

CHAPTER 4: SYSTEM ANALYSIS AND DESIGN

4.1 CHAPTER OUTLINE

This chapter outlines the analysis and design of the proposed Adaptive Multimodal Biometric System (AMBS) developed to improve physical access control in higher education institutions. It starts with the identification of system requirements based on the research problem, literature review, and stakeholder needs following the rules and principles from Design Science Research (DSR). It then describes the UML models, system architecture, design rationale, and adaptive algorithms that together define the artefact proposed. Finally, the chapter presents how these acquired requirements are converted to an integrated architectural framework for adaptive, context-aware multimodal biometric authentication smart campus access control system.

4.2 INTRODUCTION

This chapter aims to describe the analysis and design of the Adaptive Multimodal Biometric System (AMBS). The AMBS is a novel artefact developed in response to the shortcomings of traditional access control and authentication systems deployed by universities. The design phase manifests itself as a central and essential stage within Design Science Research (DSR), which converts pre-determined organisational and technological issues into structured and actionable artefacts through systematic design activities, typically involving some form of evaluation [34]. In this chapter, we define the key requirements, architecture, models and algorithms that constitute the AMBS artefact proposed in chapters prior to this one that identified a problem context using literature review. The growing need for intelligent and adaptive security solutions, identity-related security risks, campus crime, and unauthorized access are some of the security issues facing higher education institutions that spurred the development of the AMBS [31], [68], [79], and [84]. Environmental factors, low biometric sample quality, spoofing attempts, and operational variability frequently cause performance degradation in single-modality biometric systems and traditional access control mechanisms [28], [45], [57], [59]. It is known from research that adopting multimodal biometric systems combining evidence from different biometric signatures, as opposed to single biometric modality, can lead to improved recognition accuracy, reliability and robustness [6], [7], [12], [13], [43]. Additionally, recent studies show that adaptive and context-aware authentication methods can provide incrementally increased security by modifying authenticator decisions based on environmental conditions as well as contextual information related to risk factors and quality measures of biometrics [9], [14], [15], [51].

This chapter is significant as it sets out the conceptual and technical framework that underpins the AMBS artefact. It defines and describes the functional behaviour of the system, its constraints, both functional and non-functional requirements. The proposed solution addresses important issues such as security, privacy, performance, reliability and scalability from an architectural point of view by means of these requirements. The chapter further illustrates the application of DSR principles in transmuting research outcomes into an innovative technological artefact with potential to investigate real-life campus security problems [34]. To thoroughly represent the system, Unified Modelling Language (UML) techniques will be applied to visualise aspects of system behaviour, interactions, workflows and structure. It also describes the layered system architecture, component interactions, data flows and algorithmic mechanisms supporting adaptive modality selection, multimodal biometric fusion, context-aware decision-making and risk-based authentication. The design combines proven technologies from multimodal biometric fusion, adaptive authentication behavioural biometrics and context aware access control; to develop a security framework with the ability to function under different operational environments [8], [14], [17], [19], [43], or workloads [51]. This study focuses on the combination of facial recognition and gait biometrics because previous studies have demonstrated their effectiveness for authentication, usability and robustness in real-world environments [21], [39], [46].

In addition, this chapter explains the reasoning behind significant design choices and shows traceability between requirements identified as necessary to system success and specific components of your proposed solution. This makes sure that all the components of the artefact are directly relevant to studying and solving the research problem. In addition, it links the security threats revealed in an atmosphere of higher education with a related, adaptable biometric solution. In the end, this chapter sets out the theoretical framework which precedes practical implementation and evaluation of an AMBS within real university security contexts [30], [63], [71], [72], [81].

4.3 REQUIREMENTS ANALYSIS

The requirements analysis section of the system design converts research problem and findings from Chapters 1,2, and 3 into design characteristics for the Adaptive Multimodal Biometric System(AMBS). Requirements analysis is an important part of the Design Science Research (DSR) methodology, as it determines the capabilities that systems should achieve [34], thus forming a basis for artefact development. The data collection sources used to derive the system requirements included literature review, stakeholder consultations meetings, observations of existing access control processes and research objectives. The literature review indicates that traditional access control systems and unimodal biometric systems are vulnerable to spoofing attacks, poor performance in real life scenarios (where environmental factors widely fluctuate), static authentication thresholds, and absence of context-aware mechanisms [5], [6], [14], [15], [28]. The examination of security scope and concepts on a University campus showed these limitations to be well founded.

Literature analysis, stakeholder consultation, observation and an investigation of the recent regulations were among the requirements elicitation techniques used. Conducted with security practitioners, ICT personnel and system administrators, the study revealed that accurate authentication, real-time decision-making capability, auditability (the ability to verify a transaction) as well as privacy protection, and operational reliability. The regulatory requirements originated from the Protection of Personal Information Act (POPIA) as well as the General Data Protection Regulation (GDPR), both of which have stringent requirements for dealing with biometric data.

In contrast to traditional biometric systems characterized by static authentication rules based on a single user trait, the proposed AMBS enables adaptive modality selection, multimodal fusion, context-aware authentication and risk-based decisions. Such capabilities allow the system to adaptively select authentication processes based on the biometric quality, environmental conditions and contextual risk to enhance security, usability and operational resilience [9], [14], [15], [45]. After identifying the needs and design objectives, we organised requirements into Functional Requirements (FRs), Non-Functional Requirements (NFRs) and Design Constraints (DCs). Functional Requirements are the services that the system provides, Non-Functional Requirements are intended to specify quality attributes of a service and Design constraints define technological and operational boundaries in which the artefact must operate.

4.3.1 Functional Requirements (FR)

Functional requirements specify the abilities that an artefact has to provide in order to solve the identified problem and fulfil the intended goals as part of Design Science Research (DSR). They translate the requirements for stakeholder needs and system expectations into specific functions that drive Conception, Development, and Evaluation of technical artefacts. These requirements extends the operational capability that must be supported by the AMBS to provide secure and efficient verification of users in university environments [34].

User Enrollment

The biometric data shall be gathered by the system through gait and facial methods. 

The system shall preprocess the data it has gathered, including noise reduction and normalization operations.

From each modality, the system shall extract unique features

The system shall securely store biometric templates. 

The system shall associate biometric data with a unique user identity. 

User Authentication

The system shall capture live biometric input (face and/or gait). 

The system shall preprocess and extract features from the input. 

The system shall match extracted features against stored templates. 

The system shall return an authentication decision (accept, reject, or step-up). 

Multimodal Fusion

The system shall support facial and gait biometric modalities. 

The system shall combine results from multiple modalities. 

The system shall support fusion strategies (e.g., score-level, decision-level). 

The system shall allow configurable weighting of modalities. 

Adaptive Modality Selection

The quality of the biometric data shall be evaluated first before processing.

The system shall dynamically select the best biometric modality.

The system shall change modalities when specific quality thresholds are not met.

The functionality of the system shall be modified based on environmental factors such as occlusion and lighting.

Context-Aware Adaptation

The system shall include elements of context: place, time, and risk level.

A risk evaluation shall take place so that the system can adjust decision thresholds according to assessed contextual risk.

Risk-based authentication decision-making shall be supported by the system.

Physical Access Control

The system shall grant or deny access to protected facilities based on authentication outcomes.

The system shall communicate authentication decisions to access control devices such as electronic door locks, turnstiles, gates, and barriers.

The system shall support step-up authentication for high-risk access requests.

The system shall support access point-specific authentication policies.

The system shall record all access decisions and enforcement actions for auditing purposes.

Template Management

The system shall update biometric templates over time. 

The system shall support template deletion. 

The system shall prevent duplicate user identities. 

Error Handling and Feedback

The system shall provide feedback on capture quality. 

The system shall allow retry attempts. 

The system shall log authentication failures. 

Administration

The system shall allow administrators to manage users. 

The system shall allow configuration of thresholds and fusion rules. 

Access to audit logs for review and investigation shall be made possible by the system.

Event management and system monitoring

The system shall support real-time monitoring of authentication events.

The system shall log all access attempts with contextual and decision data.

The system shall detect and log door-forced-open events.

The system shall detect and log door-held-open events.

The system shall generate alarms for unauthorised access attempts.

The system shall generate alerts for unusual events such as repeated failures or potential spoofing attempts.

4.3.2 Non-Functional Requirements (NFR)

Non-functional requirements describe quality attributes and operational characteristics in DSR that are used to assess how well an artefact performs its intended functions. They differ from the functional requirements precisely because they measure performance expectations, security, reliability, usability, scalability and compliance constraints that affect system acceptability and generally dictate how successful you are at delivering it satisfactorily. These requirements for the Adaptive Multimodal Biometric System (AMBS) ensure that the artefact operates securely, accurately and efficiently in the dynamic environment of South African universities [34], [57].

Performance

The system shall support real-time processing at access points. 

The system shall provide authentication decisions within ≤ 2 seconds. 

The system shall maintain performance under increasing workload. 

Accuracy

The system shall minimise False Acceptance Rate (FAR). 

The system shall minimise False Rejection Rate (FRR). 

The system shall improve recognition accuracy through multimodal fusion. 

Security

When storing and transmitting biometric data, the system shall use encryption.

Strict access control measures shall be used by the system to prevent unauthorized access to system resources.

To lower the danger of spoofing attacks, the system shall have liveness detection.

Reliability

There shall be little downtime (if any), and the system must run continuously.

Failure of a sensor or modality shall be handled by the system without affecting overall functioning.

To preserve functionality, the system shall offer backup options, like switching to a single modality.

The system shall continue operating during temporary network outages through local edge processing and controller-based decision enforcement.

Usability

The system shall provide clear guidance during biometric capture. 

The system shall minimise user effort during authentication. 

The system shall support intuitive interaction at access points. 

Adaptability

The system shall adapt to environmental conditions in real time. 

The system shall dynamically adjust modality selection and thresholds. 

The system shall support context-aware and risk-based decision-making. 

Scalability

The system shall support an increasing number of users and templates. 

The system shall maintain performance as the system scales. 

Maintainability

The system shall support modular design for easy updates. 

The system shall allow modification of algorithms and system components. 

Privacy and Compliance

The system's components shall comply with privacy-by-design principles. 

The system shall comply with all the regulations outlined in GDPR and POPIA guidelines.

The system shall support data sovereignty and system resilience by prioritizing secure local storage.

4.3.3 Design Constraints (DC)

Design constraints, in our context of Design Science Research (DSR), refers to limitations, conditions and boundaries to be adhered to while creating and operating an artefact. These constraints define factors like technological, operational, regulatory and resource-related restrictions that drive the design decisions around whether a proposed solution is feasible and can be implemented either wholly or in stages. The adaptive multimodal biometric system (AMBS) model enforces design constraints that ensure the artefact remains practical, compliant and deployable within real-world university environments while meeting the operational requirements of adaptive biometric authentication [34].

Hardware and Deployment Constraint

The system shall operate using sensors and embedded hardware at access points. 

The system shall not depend on high-performance external infrastructure. 

The system shall integrate with physical access control infrastructure including doors, turnstiles, gate motors, barriers, and electronic locking mechanisms.

Edge Processing Constraint

The system shall perform biometric processing at the edge. 

The system shall support real-time operation and network independence. 

Resource Constraint

The system shall use computationally efficient algorithms. 

The system shall operate on resource-constrained devices. 

Regulatory and Ethical Constraint

The system shall comply with POPIA and GDPR. 

The system shall restrict biometric use to authorised environments.

The identified functional requirements, non-functional requirements, and design constraints collectively define the capabilities, quality attributes, and operational boundaries of the proposed AMBS. These requirements provide direct input into the architectural design, UML models, component specifications, and adaptive algorithms presented in the subsequent sections of this chapter, thereby ensuring traceability between problem identification, artefact design, and evaluation within the Design Science Research process.

4.4 UML MODELLING

This section presents standardised, graphical models to visualise and document artefacts. It acts as a set of blueprints, using standardised diagrams to translate the above-listed system requirements into a visual format.

4.4.1 Use case diagram

A use-case diagram provides an overview of how actors, or external users, interact with the system. Main actors are users, system admin and security personnel. During the enrollment and authentication steps, users interact with the platform using biometric identifiers like walking (gait) patterns or facial features [7], [11], [15]. Administrators set up thresholds, control templates and fusion rules for smooth functioning. Security forces ensure that institutional trust is established and processes are protected by monitoring compliance, reviewing audit logs (where applicable), investigating anomalies, and others [3]. Notable system usage situational scenarios include enrollment, authentication, risk-based access control, and others [7], [9].

The actors interact with the Adaptive Multimodal Biometric System (AMBS) as depicted in the use case diagram shown in Figure 4.1 It determines the core services offered by the system, including user enrolment, authentication, adaptive modality selection and multimodal fusion used in context-aware decision-making as well as template management, monitoring and administrative functionality. This diagram is a high-level overview of the system functionality, and how stakeholders interact with the access control framework described in this proposal.

Figure 4.1: AMBS use case diagram 

4.4.2 Use case description

Table 4.1: Use Case Specification for UC001 - Enroll User

Item

Description

Use Case ID

UC001

Use Case Name

Enroll User

Description

This use case allows a new user to register in the AMBS by capturing facial and gait biometrics and creating a biometric template linked to the user's identity.

Actor(s)

User

Pre-conditions

1. User has authorization to enroll.2. Biometric sensors are operational.

Post-conditions

1. User profile created.2. Biometric templates stored securely.

Normal Flow

1. User initiates enrollment.2. System captures face and gait data.3. System preprocesses biometric samples.4. Features are extracted.5. Templates are generated.6. Templates are linked to user identity.7. System stores templates securely.8. Enrollment confirmation is displayed.

Alternative Flow

1. Poor biometric quality detected.2. System requests recapture.

Exception Flow

1. Sensor failure occurs.2. Enrollment process is aborted and error message displayed.

Table 4.2: Use Case Specification for UC002 - Authenticate User

Item

Description

Use Case ID

UC002

Use Case Name

Authenticate User

Description

This use case verifies a user's identity using face and/or gait biometrics before granting access to a protected area.

Actor(s)

User

Pre-conditions

1. User is enrolled.2. Biometric templates exist.

Post-conditions

1. Access granted, denied, or step-up authentication initiated.

Normal Flow

1. User approaches access point.2. System captures live biometric data.3. Data is preprocessed.4. Features are extracted.5. Matching is performed.6. Multimodal fusion is executed.7. Context-aware decision is applied.8. Authentication outcome is generated.

Alternative Flow

1. Quality score below threshold.2. System requests recapture.

Exception Flow

1. User template not found.2. Authentication denied.

Table 4.3: Use Case Specification for UC003 – Capture Face/Gait

Item

Description

Use Case ID

UC003

Use Case Name

Capture Face/Gait

Description

This use case acquires facial and gait biometric samples from a user during enrollment or authentication.

Actor(s)

User

Pre-conditions

Sensors are active and available.

Post-conditions

Biometric samples captured successfully.

Normal Flow

1. System activates sensors.2. User positions for capture.3. Face image and gait sequence captured.4. Samples stored temporarily.5. Samples forwarded for processing.

Alternative Flow

Poor image quality detected and recapture requested.

Exception Flow

Sensor malfunction prevents capture.

Table 4.4: Use Case Specification for UC004 - Perform Multimodal Fusion

Item

Description

Use Case ID

UC004

Use Case Name

Perform Multimodal Fusion

Description

This use case combines evidence obtained from facial and gait biometrics to improve authentication accuracy and reliability.

Primary Actor

AMBS

Pre-conditions

Matching scores available.

Post-conditions

Fused authentication score generated.

Normal Flow

1. Receive modality scores.2. Assign weights based on quality.3. Perform score-level fusion.4. Generate fused score.5. Forward score to decision engine.

Alternative Flow

Only one modality available.

Exception Flow

Fusion engine failure.

Table 4.5: Use Case Specification for UC005 - Adaptive Modality Selection

Item

Description

Use Case ID

UC005

Use Case Name

Adaptive Modality Selection

Description

This use case dynamically selects the most suitable biometric modality based on biometric quality and environmental conditions.

Primary Actor

AMBS

Pre-conditions

Biometric samples available.

Post-conditions

Optimal modality selected.

Normal Flow

1. Assess quality scores.2. Evaluate contextual conditions.3. Select face, gait, or both.4. Forward selected modalities for matching.

Alternative Flow

Low quality detected and recapture initiated.

Exception Flow

No usable modality available.

Table 4.6: Use Case Specification for UC006 - Apply Context-Aware Decision

Item

Description

Use Case ID

UC006

Use Case Name

Apply Context-Aware Decision

Description

This use case evaluates authentication results together with contextual information such as location, time, and risk level to determine the final access decision.

Primary Actor

AMBS

Pre-conditions

Fused score available.

Post-conditions

Access decision generated.

Normal Flow

1. Retrieve contextual data.2. Calculate risk score.3. Adjust threshold dynamically.4. Evaluate authentication result.5. Generate grant, deny, or step-up decision.

Alternative Flow

Medium risk triggers step-up authentication.

Exception Flow

Context data unavailable.

Table 4.7: Use Case Specification for UC007 - Manage Templates

Item

Description

Use Case ID

UC007

Use Case Name

Manage Templates

Description

This use case allows administrators to create, update, maintain, and delete biometric templates.

Actor(s)

Administrator

Pre-conditions

Administrator authenticated.

Post-conditions

Template database updated.

Normal Flow

1. Administrator selects template.2. System displays template information.3. Administrator updates or deletes template.4. System saves changes.

Alternative Flow

Duplicate template detected.

Exception Flow

Database update failure.

Table 4.8: Use Case Specification for UC008 - Configure Thresholds and Fusion Rules

Item

Description

Use Case ID

UC008

Use Case Name

Configure Thresholds & Fusion Rules

Description

This use case enables administrators to define authentication thresholds, risk parameters, and fusion strategies used by the AMBS.

Actor(s)

Administrator

Pre-conditions

Administrator logged in.

Post-conditions

Configuration updated.

Normal Flow

1. Administrator accesses configuration menu.2. Modifies thresholds and weights.3. Saves configuration.4. System applies changes.

Alternative Flow

Invalid parameter entered.

Exception Flow

Configuration save failure.

Table 4.9: Use Case Specification for UC009 - View Audit Logs

Item

Description

Use Case ID

UC009

Use Case Name

View Audit Logs

Description

This use case allows authorized personnel to review authentication events, access attempts, and security incidents.

Actor(s)

Administrator, Security Personnel

Pre-conditions

Authorized access granted.

Post-conditions

Audit logs displayed.

Normal Flow

1. User requests logs.2. System retrieves records.3. Logs displayed.4. User reviews records.

Alternative Flow

Apply search and filtering criteria.

Exception Flow

Log database unavailable.

Table 4.10: Use Case Specification for UC010 - Monitor Events

Item

Description

Use Case ID

UC010

Use Case Name

Monitor Events

Description

This use case enables security personnel to monitor authentication activities and security events in real time.

Actor(s)

Security Personnel

Pre-conditions

Monitoring dashboard active.

Post-conditions

Events reviewed and tracked.

Normal Flow

1. Security personnel access dashboard.2. Live events displayed.3. Personnel review activities.4. Suspicious events identified.

Alternative Flow

Event filtering applied.

Exception Flow

Monitoring service unavailable.

Table 4.11: Use Case Specification for UC011 – Respond to Alerts

Item

Description

Use Case ID

UC011

Use Case Name

Respond to Alerts

Description

This use case allows security personnel to investigate and respond to suspicious authentication attempts, spoofing incidents, or repeated access failures.

Actor(s)

Security Personnel

Pre-conditions

Alert generated by the system.

Post-conditions

Alert resolved and recorded.

Normal Flow

1. Alert generated.2. Security personnel receive notification.3. Alert details reviewed.4. Appropriate action taken.5. Incident recorded and closed.

Alternative Flow

Alert escalated to administrator.

Exception Flow

Alert cannot be processed due to system failure.

Table 4.12: Use Case Specification for UC012 – Enforce Access Decision

Use Case ID

UC012

Use Case Name

Enforce Access Decision

Description

This use case enables the system to enforce authentication decisions by communicating with access control infrastructure and activating physical access devices.

Primary Actor

AMBS

Pre-conditions

Authentication decision generated; Access control device available.

Post-conditions

Door, gate, or turnstile activated; Event recorded in audit log.

Normal Flow

1. Receive grant, deny, or step-up decision.2. Send command to access control interface/controller.3. Controller activates appropriate device.4. Event logged.5. User feedback displayed.

Alternative Flow

Step-up authentication requested.

Exception Flow

Controller unavailable; Device communication failure.

4.4.3 Activity diagram

An activity diagram shows how decisions and actions take place during a system process. It illustrates the authentication process for the entire system (from biometric capture to final access decision). The first step is data collection, then feature extraction and preprocessing. These include decision points around the choice of modality and biometric quality assessment [43]. Moreover, the figure shows how decision-making is informed by contextual analysis and multimodal fusion [14, 43]. This UML model effectively captures the sequential and conditional logic of system operations. Authentication procedures are performed in the same way, as shown in Fig. 4.2.

Figure 4.2: Activity diagram

4.4.4 Sequence diagram

This model shows the interaction between system components. It provides a communication framework that includes the user, sensors, processing modules, and a decision engine as part of an authentication process. The interaction with the user begins with their arrival and biometric data collection at the access point. Messages then pass through components for preprocessing, feature extraction, matching, and score generation. Moreover, the diagram highlights context-aware risk assessment, multimodal fusion, and adaptive modality selection. After the final interactions, access decisions (grant, deny, or step-up authentication) are made. These diagrams make clear the time-ordered behaviour of the AMBS in operation [9, 15]. The Access Control Interface sends authentication decisions to an Access Controller, which then activates the physical access device.

Figure 4.3 (a): The full sequence diagram

Figure 4.3 (b): Biometric acquisition & processing

Figure 4.3 (c): Adaptive authentication & fusion

Figure 4.3 (d): Context-Aware decision & enforcement

4.4.5 State machine diagram

A state machine UML diagram represents possible states of a certain system and the transitions between them that occur based on conditions or events. This model demonstrates the behaviour of the system during its authentication process. The system works from an idle state and passes through various stages, including capture, preprocessing, extraction of features, matching the extracted feature set to a stored power representation set for each key subject, performing fusion on matching scores calculated during the process, and finally making decisions based on results obtained. Various factors, including biometric quality, spoof detection results, confidence levels, and contextual risk, all contribute to the transitions between these states. It is a model where you can also see possible results, such as retry, step-up authentication, access denied, or granted. It illustrates the system’s reaction to both normal and extraordinary circumstances. In general, the representation describes how (in response to events occurring at the real-time level) the system modifies its status (refer to Figure 4.4) [9, 15].

Figure 4.4: State diagram (dynamic behaviour of the artefact)

4.5 SYSTEM ARCHITECTURE

Architecture serves as a link between requirements and system behaviour in the Design Science Research (DSR) paradigm, allowing the artefact to be analysed and assessed without regard to implementation specifics [34].  The architecture offers a logical depiction of how authentication decisions are generated, enforced, and monitored rather than outlining hardware installation. AMBS followed the layered architecture pattern as it promotes separation of concerns, and modularity which leads to scalability, maintainability and independent evolution of system functions. The layered architecture is widely adopted in intelligent security, IoT and access control system due to the logical isolation of each function (i.e., sensing, processing, decisions making, storage and Governance) with controlled interaction between layers. The layered method permits effective extension and evaluation of the system in the future, whilst enabling alongside business model safe real-time edge processing, adaptive authentication & multilevel fusion and governace requriements as an aspect of AMBS [14, 30, 65, 72]. We have selected a seven-layer structure that clearly distinguishes technical and non-technical functions: biometric acquisition, computation, decision making, physical enforcement and administrative governance.

4.5.1 The Layered Approach

The proposed adaptive authentication framework is defined by its structural components in relation to the seven-layer architecture of an Adaptive Multimodal Biometric System (AMBS). The architecture is designed with respect to the functional, non-functional requirements and design constraints addressed in Section 4.3 while catering to the implementation and evaluation aspects of multimodal biometric authentication system intended for physical access control solutions at university environment. A layered architecture (depicted in Fig. 4.5) is chosen because it can decouple concerns, supporting modular design, maintainability and scalability [14], as well as providing traceability links between system requirements and architectural components (paths), configurable algorithms and evaluation activities [30], [34]. In the DSR framework, architecture is a rational description of how some artefact combats the research problem. So the architecture presented here is not tied to a particular technology, rather it is based on generic components for acquisition and working with biometric data along with adaptive authentication with knowledge base reasoning about context as well as data management and governance. This architecture gives the abstract context for the adaptive algorithms introduced here in Section 4.6. Chapter 4 presents the implementation along with experimental evaluations of these algorithms.

Figure 4.5: layers in AMBS Architecture

The proposed architecture can fulfil the four major architectural objectives which are; 1) multi-biometric processing, 2) adaptive decision making, 3) real-time performance authentication, and finally 4) scalable secure operation. The architecture is modular and layered allows for both single point testing of system modules as well as ease to add more biometric modalities (face recognition, fingerprint recognition, voice recognition or iris recognition) with minimal architectural re-designing overheads. Besides this, separating the concerns allows for Iterative Design and Evaluation of adaptive authentication algorithms as required by the Research Methodology framework proposed within Design Science Research [11]. Moreover, this architecture promotes scalability since computational functions, data provision services and access control mechanisms may change implicitly while secure communication can still occur via invisible architectural borders.

During system operation, a user approaches a secured access point which is set up at the entrance to university student residences, laboratories, examination facilities, server rooms or any secured campus facility. The Presentation Layer will kick-start the authentication flow and guides users. The Biometric Acquisition Layer obtains facial and gait biometric samples from camera sensors. The Biometric Processing Layer does Pre-processing, Quality assessment, Feature Extraction, and Matching. An Adaptive Authentication and Fusion Layer selects relevant modalities from the modality pool to perform score-level fusion. Context-Aware Decision Layer uses biometric evidence along with information about the context and risk factors to create an authentication decision. The resulting decision is sent to the Access Controller of the protected access point via the Access Control Interface. Then the controller uses decision then to control physical access by turning on or off electronic door locks, turnstiles, gates and barriers. The Data Management Layer can keep authentication logs, contextual information and auditing information, while the Governance and Administration Layer takes care of policy enforcement, compliance monitoring and admin oversight.

Layer 1: Presentation Layer

The Presentation Layer was added in order to provide a user interface, biometric capture mechanism, authentication, administration and system monitoring under the AMBS framework. This layer is the main interface between end users, administrators and the system. At the user-end it gives directions in biometric capturing and authentication as well as capture instructions, status updates, feedback of success/failure for an authentication attempt. The layer provides system configuration and user management functionality, as well as performance monitoring, reporting and operational control, for administrators. The Presentation Layer not only increases usability, accessibility and user experience by abstracting the underlying biometric processing and decision-making mechanisms but also facilitates efficient system administration and oversight.

Layer 2: Biometric Acquisition Layer

The Biometric Acquisition Layer is designed to carry out multimodal biometric authentication with the use of facial and gait biometrics. This layer handles the interaction between the biometric sensing devices and AMBS. It is mainly responsible of capturing all the raw biometric data for enrolment and authentication. The methods proposed in this paper rely on the usage of camera-based sensors and are designed to acquire facial images and gait sequences from individuals seeking to access protected facilities. It serves as the interface to the biometric capture process, collecting original raw biometrics samples, digitising them and sending them to higher-level layers for processing. The acquisition layer serves to acquire biometric data with good quality irrespective of the operational conditions, since the captured biometric samples will have a strong influence on authentication performance. The layer supports multiple biometric modalities, provides sufficient biometric evidence for authentication and verification activities, and lays the foundations for quality assessment, feature extraction, and adaptive modality selection processes to be performed in later-stage modules of the framework [5], [57].

Layer 3: Biometric Processing Layer

The Biometric Processing Layer was added to meet the needs of biometric quality evaluation, preprocessing, feature extraction and biometric matching. It processes the raw biometric samples received from the acquisition layer into authentication evidence suitable for decision-making. This layer includes four main submodules including the Preprocessing Module, Quality Assessment Module, Feature Extraction module and Matcher Module. The Preprocessing Module applies normalization, noise reduction, and image enhancement techniques to enhance the quality of captured facial and gait samples. The Quality Assessment Module assesses the samples for their usefulness during the authentication process and delivers quality measurements per modality to enable flexible modality selection. Feature Extraction Module generates a unique set of facial embeddings, and the gait feature vectors that forms an individual's biometric identity. The Matcher Module compares the extracted features to the biometric templates stored in a database and produces similarity scores which indicate how similar the new sample is to one of enrolled identities This layer transforms raw biometric samples into feature sets and matching outcomes that furnish authentication evidence for the fusion and decision layers. Moreover, the produced quality data allow flexibility in adaptive authentication methods to choose best suitable biometric modality under diverse operational scenarios [21], [46], [57].

Layer 4: Adaptive Authentication and Fusion Layer

The most significant contribution of the proposed Adaptive Multimodal Biometric System (AMBS) is given by the Adaptive Authentication and Fusion Layer. We introduced this Layer since it can satisfy the needs of adaptive authentication, multimodal fusion, modality selection and better authentication performance. It is mainly used to decide how biometric evidence should be used in various situation of the operation. This layer comprises three main submodules, i.e., Adaptation Controller, Modality Selector and Fusion Engine. The Adaptation Controller constantly analyzes the biometric quality information, authentication conditions and system requirements to find the optimal configuration of existing authentication strategies. Based on these evaluations, the Modality Selector dynamically decides whether authentication should be executed via facial biometrics, gait biometrics or both modalities. This allows the framework to be dynamic and resilient against both environmental conditions and operational conditions, whilst ensuring that authenticating performance is retained. It fuses similarity scores from the processing layer using a score-level multimodal fusion. The layer provides a more trustworthy authentication output through the process of combining evidence from different biometric modalities than solely on the basis of individual biometric information. In addition, it is capable to switching from one modality to another when biometric quality lowers or authentication environment varies, providing robustness, flexibility and resilience. Previous articles have proven that multimodal biometric fusion can enhance the accuracy, reliability and anti-spoofing ability of authentication compared to unimodal biometric systems [6], [7], [43], [45]. Thereby, this layer realises the adaptive modality selection and multimodal fusion techniques that form the main contribution of our proposed AMBS framework.

Layer 5: Context-Aware Decision Layer

The Context-Aware Decision Layer was designed in order to meet the needs for context-aware adaptation, risk assessment as well as risk based authentication that were identified during the requirements analysis phase. This layer is the brain of AMBS which combines biometric authentication evidence production of Adaptive Authentication and Fusion Layer and contextual features with a specific authentication request. More specifically, the layer features two main submodules: Context Analysis Module and Risk Assessment Module. Context Analysis Module collects & analyzes contextual features such as current location, time of access, frequency of access, user behaviour patterns and nature around them. This information is analysed using the Risk Assessment Module which calculates how risky each authentication attempt is. Depending on the risk level assessed, the system adjusts authentication boundaries accordingly and determines what would be an ideal access decision.

Its main job is to produce a smart authentication decision that utilizes both biometric strength and environmental risk. The layer may allow or deny access based on conditions that were evaluated, or it may require more authentication measures. With the integration of contextual awareness in authentication, the framework can adjust to changing use conditions and identify relevant access requests that may not yet be identified as suspicious by biometric information alone. This layer produces decisions that will be passed on to physical access control infrastructure, like doors / turnstiles / gates or electronic locks, for enforcement. Interaction through an Access Control Interface translates choices from the AMBS to field controllers that reside at protected access points. These controllers control different electronic locking system, turnstile gate, overlapping and barrier doors. When a grant decision arrives, the controller turns on (or otherwise activates) the relevant access device and deny and step-up decisions either keep access blocked or continue to block it but format security events for review and monitoring. Therefore, this layer implements the context-aware and risk-based authentication mechanisms presented in this study, so it directly assists towards strengthening security, increasing adaptability of the systems and improving decision-making processes in access control scenarios highly typical for university environments [9], [14], [15], [51].

Layer 6: Data Management Layer

The Data Management Layer was designed to meet the biometric template management, user profile management, auditability, accountability and information persistence requirements. This layer acts as an information store for all data produced and used by the AMBS. It has the duty of securely storing biometric templates, user profiles, authentication records, contextual-information records, system configuration data and audit logs generated during system use. This layer helps ensure that registered users are correctly linked with their biometric templates, enabling reliable identity management and authentication processes. It maintains information about authentication attempts, access decisions and other contextual conditions guiding access at the time of authentication and system events to facilitate auditing, monitoring and forensics. The information is also stored up which contains the data that will be used to analyse the authentication outcome, and evaluate system performance and The effectiveness of the framework proposed. As a result, the Data Management Layer is essential for operational functionality of artefact evaluation and assurance of system information integrity, availability and traceability. In addition, the layer stores various events such as access control, controller transactions, device status information, alarm events and access enforcement records generated by the system during runtime.

Layer 7: Governance and Administration Layer

The introduction of Governance and Administration Layer satisfies requirements for policy management, administrative oversight, compliance monitoring, audit review, and lifecycle management in the Adaptive Multimodal Biometric System (AMBS). This layer consists of the means that are necessary to guarantee that an operating system remains secure, accountable, transparent and legally compliant. The layer contains several administrative functions such as Policy management, Enrolment administration, User and role management, Configuration management, Compliance monitoring & Audit review. Using these functions, authorized administrators can perform user enrollment and revocation, configure thresholds and fusion parameters to authenticate an enrolled user, assign privileges to the user, check authentication activities and understand the system health. Also, this layer supports governance controls that ensures biometric information is collected, stored, processed and used according to institutional policy as well as any relevant privacy regulations.

This layer also provides for continuous monitoring of system activities via audit logs, compliance reports and administrative dashboards. These features allow administrators to detect policy violations, perform security investigations, verify regulatory compliance and keep audit logs of the entire authentication activity. Governance is necessary since biometric systems process sensitive data which people want to have assurance with respect their trust and the transparency of how the system would be working. Thus this layer supplies the organisational and administrative controls to enable the ethical, safe and sustainable implementation of the proposed AMBS framework [17], [18], [53] The layer also facilitates access control policy administration, including access rights management, as well as defining and enforcing access schedules, access zones and security rules across protected facilities.

4.5.2 Component Diagram 

This component diagram represents the high-level functional components of the proposed Adaptive Multimodal Biometric System (AMBS) and their interactions. It captures the structural perspective of the system in that all components are working together to facilitate secure authentication such as those responsible for biometric acquisition, biometric processing, adaptive authentication, context-aware decision-making process, data management and governance process and access control. Component diagrams are often used to show the organizational structure of software systems via functional modules and their dependencies in order to achieve modularity, maintainability, scalability, and ease of integration features to complex intelligent systems [30], [34]. The architecture represents some theoretically substantiated principles of multimodal biometric authentication, adaptive access control, and context aware decision making [6], [14], [15].

It shows how the biometric data are converted into authentication and physical access control decisions through interactions between system components in a component diagram. It shows the end to end information flow from biometric capturing and processing through context-aware risk management, adaptive multimodal fusion, data handling and access control enforcement, while governance and administration layers provide policy formulation, audit logging, and compliance assistance. As a result the component diagram connects layered architecture and AMBS operational behaviour, it offers high-level structural representations support modular development, scalability and evaluation of the proposed artefact in Design Science Research (see Figure 4.6) [7], [17], [30], [43].

Figure 4.6: Component Diagram

 4.5.3 Data Flow Diagram

As outlined previously, the component diagram in Figure 4.6 distinguished the main functional modules that form Adaptive Multimodal Biometric System (AMBS). Based on this structural representation, the Data Flow Diagram (DFD) in Figure 4.7 shows how biometric and contextual information stored within these components are transmitted for authentication [30], [34]. This process starts when an individual sends his/her biometric samples of facial and gait data through the biometric acquisition process. The obtained data is then pre-processed, quality assessed and feature extracted to represent the biometric cue and finally, a biometric modality is dynamically selected for authentication. The chosen biometric data are then compared to and matched with the registered database of biometric templates stored in the Biometric Template Database, followed by a Fusion process where matching scores found for different modal capabilities are fused through Multimodal Fusion Engine to ensure better reliability during authentication [6], [7], [43]. This process is initiated when a user provides facial and gait biometric samples in the biometric capture stage. The collected data is then preprocessed, quality-analysed, and converted to abstract features of the used modality and then the system chooses the appropriate biometric feature for attestation in a dynamic manner. The extracted biometric data is then used to match the previously registered biometric templates saved in the Biometric Template Database and finally, obtained matching scores are fused via Multimodal Fusion Engine [6], [7], [43] to enhance authentication accuracy.

After multimodal fusion, the contextual information from the Context Data repository regarding location/time/risk assessment are evaluated along with the authentication results. The Context-Aware Decision produces a dynamic authentication result which is sent to the Decision Engine to generate the final authentication outcome. This decision is logged into Audit Log Database for accountability, traceability and forensic purpose and it also send via Access Control Interface depending on the door, turnstile, gate or any other protected access devices [9], [14], [15],[17]. Thus, the DFD shows how the physical data traverse through its architectural components described in Figure 4.6 and actualises the seven-layer architecture defined in Figure 4.5 thus giving traceability between functional requirement, system architecture and authentication workflow proposed for Adaptive Multimodal Biometric System (AMBS) [30], [34].

Figure 4.7: Data Flow Diagram (DFD) of the Adaptive Multimodal Biometric System (AMBS)

4.5.4 Class diagram

The class diagram illustrates the static view of functional components of the Adaptive Multimodal Biometric System (AMBS). In contrast to behavioural models that define systems by detailing activities and interactions; class diagram specifies main objects/entities, attributes, operations, relations among these entities in the proposed framework. This diagram defines the notion data model that would need to underpin biometric enrolment, authentication, adaptive decision-making and access control enforcement monitoring and auditability (Figure 4.8) [30], [34]. Class diagrams are a long accepted method of modeling structural relationships within an object-oriented system or domain with application in software engineering and intelligent access control systems design [20, 30]. At the heart of the AMBS domain model is the User entity which is linked to one or more Biometric Templates derived from acquired biometric samples. The Authentication Session class processes authentication requests, keeping contextual information, the result of the authentication, and risk assessments. The Context Data class contains contextual attributes (location, time, risk level, etc) and is crucial for dynamic decision making. The 

Decision Engine produces authentication results and enforces those through the Access Controller in charge of one or more Access Devices like gates, doors & turnstiles. Audit Logs are used to log all authentication activity for the purposes of accountability and governance, and only administrative functions happen through the Administrator class. The final model offers a high-level overview of the main components which are needed to implement adaptive multimodal biometric authentication and physical access control in university premises. The class diagram also traces the architectural layers and system requirements to the adaptive algorithms described in the following sections [6], [7], [9], [14], [17], [43].

Figure 4.8: Class Diagram

ADAPTIVE ALGORITHM 

This section defines the logical behaviour of the adaptive algorithms within the Adaptive Multimodal Biometric System (AMBS) proposed in this work. Independent of any programming language, software platform or implementation technology, the algorithms describe the computational logic and decision-making processes of the proposed artefact. Chapter 5 gives practical instantiation of them. Conventional biometric-based authentication systems typically consist of static authentication rules that are based on a priori defined biometric modality and fixed decision threshold values irrespective of the quality of the biometric and the real-world operating conditions. These methods, while computationally inexpensive, tend not to handle variations in illumination and user motion as well as partial occlusion, sensor noise, changing environmental conditions or new security threats. As a result, the performance of an authentication system can be degraded when low-quality biometric samples are processed or when contextual information indicating a high security risk is neglected [5], [14], [15], [28].

Adaptive multimodal biometric systems have been shown to enhance robustness compared to operating with a unimodal authentication approach by combining two or more complementary biometric evidence while dynamically adapting to the changing operational environment [6], [7], [30], [43]. Similarly, context-aware access control leverages contextual factors including location, access time, behavioural characteristics and environmental conditions to facilitate authentication decisions [9], [14], [51] and ultimately provide more reliable authentication than traditional password-based mechanisms. These developments lay the theoretical groundwork for the adaptive algorithm used in this study. Based on these innovations, this research proposes an Adaptive Multimodal Biometric System (AMBS), which is a multi-stage adaptive authentication framework that leverages biometric quality assessment, contextual information and the gauge of the degree of confidence in authentication to make intelligent access control decisions. The modified framework dynamically selects the authentication strategy which is most suitable under the current operational condition decoupling it from processing all registered biometric modality since some modalities are still more preferable to use in certain operating conditions. This design readily meets the real-time requirements of university use cases for access control environments while remaining resilient, flexible and privacy preserving through local edge processing.

The adaptive algorithm we propose is an essential component tightly tied into the seven-layer architecture in Section 4.5. The Biometric Processing Layer handles biometric preprocessing and feature extraction and template matching. These evaluate the quality of the obtained biometric and choose an appropriate sensor (biometric modality) before performing adaptive score level fusion through what we will call the Fusion Layer. Finally, the Context-Aware Decision Layer integrates the fusion scores with contextual features and assessed risk y so as to generate the final authentication decision. The Access Control Interface then conveys the outcome of the authentication decision to the physical access control infrastructure, while logging authentication events into Data Management and Governance layers for accountability and traceability.

The core algorithmic novelty of the artefact lies in four design components that complement each other as follows:

Adaptive Modality Selection: Selects the most relevant biometric modality based on measures of biometric quality and context in which it is used.

Feature Extraction and Matching: Changes the collected biometric samples into a corresponding feature vector in order to compare with uniquely stored biometric templates.

Adaptive Score-Level Fusion: Assigning dynamic weights to similarity scores based on biometric quality followed by a unified score for authentication

Context-Aware Decision Making: A methodology that combines biometric confidence with contextual risk information to generate adaptive authentication decisions (i.e. access granted, access denied or step-up authentication)

More notably, while most conventional biometric authentication systems exploit fixed modality selection with static decision thresholds, the proposed algorithm provides both quality-aware modality selection, adaptive multimodal fusion and context-aware decision making by drawing a unified architectural. The main design contribution of this research is the integration of these mechanisms which forms the computational basis for the Adaptive Multimodal Biometric System (AMBS). The subsequent subsections break down the design of each algorithmic component.

4.6.1 Adaptive Modality Selection Algorithm

This algorithm determines the optimal biometric modality to be used for authentication prior to matching. In contrast to traditional multimodal biometric systems which blindly utilize all available biometric information regardless of capture quality, the algorithm presented herein first assesses the reliability of each biometric sample and selects either a single or multiple modalities for authentication. Such a design diminishes the effect of useless biometric samples while enhancing both computational complexity and authentication robustness [5], [28], [43]. The reason to support adaptive modality selection comes from the variability of biometric quality in realistic use scenarios. For example, facial recognition can deteriorate due to low illumination conditions, occlusion, and pose variation or camera noise; in contrast gait recognition may perform poorly when forced through crowd density's carrying objects while walking, changes in walk behaviour of the subject hence model becoming incoherent or limited camera views. There are two goals that one can achieve to take advantage of it in biometric authentication, when authenticating the user with low quality of biometric samples his False Acceptance Rate (FAR) and the False Rejection Rate (FRR) both will increase therefore the overall authentication service reliability will be decreased [21], [46], [57]. Thus, the latest adaptive authentication frameworks suggest assessing biometric quality before performing feature matching and multimodal fusion [14], [15], [30].

The proposed Adaptive Multimodal Biometric System (AMBS) takes this idea further by integrating not only biometric quality assessment, but also contextual basis and historical-based authentication performance for the modality adaptability. Rather than choosing biometric modalities based on a rule set, this algorithm also assesses the appropriateness of each modality in light of current operating conditions. This allows the authentication framework to adapt dynamically to environmental changes while still being compatible with the Hard-ware Architecture presented in section 4.5 for real-time edge processing scenarios. After biometric preprocessing, quality assessment and feature extraction carried out by Biometric Processing Layer, Adaptive Modality Selection Algorithm primarily operates at the Adaptive Authentication and Fusion Layer in the proposed seven-layer architecture. The chosen biometric modalities are then sent to the algorithms used for Feature Matching and Adaptive Score-Level Fusion. Thus, the algorithm connects biometric quality assessment with adaptive authentication and facilitates fulfilling necessary functional requirements for adaptive modality selection, authentication accuracy, and real-time operation from the requirements analysis phase.

In contrast to most of the existing multimodal biometric authentication systems that use pre-determined modality combinations and static fusion strategies, the proposed Adaptive Multimodal Biometric System (AMBS) determines biometric modality adaptively in every authentication session based on a combination of factors including time-varying properties such as biometric quality, contextual suitability, and historical authentication robustness. The adaptive prioritisation mechanism can be considered one of the main contributions algorithmically, because it allows authentication decisions to dynamically respond to changes in operational conditions while remaining consistent with the layered architecture proposed in Section 4.5. Adaptive authentication principles have also been proposed in several recent context-aware access control [14] and multimodal biometric studies; however, existing approaches usually consider either the biometric quality or a quantifier on contextual information without an integrated form of all three factors into a unified adaptive priority function [15], [43]. The set of supported biometric modalities is defined as

where denotes the complete set of biometric modalities available for authentication within the proposed framework.

Before authentication is performed, the quality of each captured biometric sample is evaluated to determine its suitability for further processing. For every biometric modality , a normalised biometric quality score is computed as

where represents the quality score assigned to biometric modality . The quality score is normalised to the interval , where a value of 0 indicates that the biometric sample is unusable for authentication, while a value of 1 represents an ideal biometric sample with excellent quality. Intermediate values indicate varying levels of biometric quality and provide a quantitative measure for determining whether a modality is sufficiently reliable to participate in the authentication process.

The quality score comes directly from the biometric quality evaluation component described in the previous section on architecture. Standard quality features comprise overall sharpness of the image, illumination level, contrast and instructed facial area (face visibility), number of clips in gait sequence, stability of motion, sensor confidence respectively. The purpose of the quality assessment phase is not to identify the user but to assess whether the biometric data are accurate enough to be processed further.

To determine whether a biometric sample is suitable for authentication, the proposed framework defines a minimum quality threshold, denoted by . This threshold distinguishes biometric samples of acceptable quality from those that require recapture or rejection. A biometric modality is considered suitable for authentication when its quality score satisfies

where is the quality score of biometric modality , and is the predefined quality threshold. When this condition is satisfied, the captured biometric sample is regarded as sufficiently reliable for subsequent feature extraction, matching, and authentication.

Conversely, if the quality score falls below the predefined threshold,

the biometric sample is considered unreliable and is excluded from the authentication process. In such situations, the system either asks the user to reinput the biometric sample or, where possible, chooses another biometric that meets quality metrics. This prevents misleading biometric measurements to compromise the fidelity of authentication and the reliability of quality assessment mechanism. After evaluating quality, it orders the different biometric modalities based on various factors rather than only on biometric quality. The weighting coefficients allow system administrators to set the importance given to the biometric quality, contextual suitability and historical authentication accuracy according to their institution needs of security level. This adjustment allows the authentication process to be implemented in various operational contexts whilst striking an effective balance between security and usability.

Accordingly, the priority assigned to each biometric modality is defined as

where:

represents the overall priority assigned to biometric modality ; 

denotes the normalised biometric quality score; 

represents the contextual suitability of the modality, considering factors such as illumination conditions, camera viewpoint, user movement, crowd density, and other environmental characteristics; 

denotes the historical authentication reliability of the modality based on previous successful authentication attempts.

Historical reliability is calculated based on the authentication results of each biometric modality within a defined observation time period. The reliability score indicates the percentage of successful authentication for modality and it is updated gradually with new authentic sessions being performed. As a result, modalities that consistently give accurate authentication results are assigned the highest reliability values while highly unstable or frequently failing modalities receive lower reliability values. By including historical authentication performance, the framework is able to leverage knowledge from prior sessions and adaptively improve modality selection across future authentication sessions [15], [17], [43].

, , and are weighting coefficients that determine the relative contribution of biometric quality, contextual suitability, and historical reliability, respectively. 

In comparison to the static rules or predefined fusion strategies in conventional multimodal biometric systems, our proposed priority function jointly models biometric quality, contextual suitability and historical authentication reliability into a single adaptive optimisation function. Hence, the biometric modality chosen is not static at all times but varies according to the operational conditions during authentication.

To ensure that the priority score remains properly normalised, the weighting coefficients satisfy the constraint

This study adopted a weighted linear formulation due to its high computational efficiency relative to the number of decisions variables considered, while still providing a mathematically interpretable mechanism for integrating heterogeneous decision variables that have been normalised onto the same numeric scale. A weighted summation is light on computation and readily lends itself to ensure that the contribution of biometric quality, contextual suitability and historical authentication reliability to matching decisions can be controlled independently through weight coefficients.

Similar weighted score fusion strategies have been extensively used in adaptive authentication and multimodal biometric systems due to the presence of a trade-off between secure recognition, computational complexity and implementation flexibility [15] [28] [43]. As a result, the priority function facilitates an evolutionary design of multimodal biometric fusion that incorporates domain-specific, contextual, and historical authentication suitability into a single adaptive selection decision framework. As a result, the AMBS can rank each biometric modality in accordance with real-time condition instead of predefined combinations of biometric modalities or static authentication strategies [14], [15]. Thus, the framework automatically determines the optimal biometric modality or combination of modalities during each individual authentication request in order to enhance recognition accuracy, robustness, adaptability and operational resilience under differing environmental circumstances [6], [43].

The weighting coefficients , , and are configurable system parameters determined according to institutional security policies and operational requirements. These coefficients are trained based on calibration experiments or optimised using authentication performance metrics, such as the False Acceptance Rate (FAR), False Rejection Rate (FRR), Equal Error Rate (EER) or total authentication accuracy during system deployment. As a result, organisations operating in high-security environments may weight contextual appropriateness and historical end user authentication performance higher while environments prioritising convenience will likely weight biometric quality relatively more. Such free-adjustment capability permits the proposed Adaptive Multimodal Biometric System (AMBS) to incorporate multiple security policies without changing their mathematical formulation [15], [28], [43].

The Adaptive Modality Selection Algorithm applied the following design rules based on the priority values obtained:

Even if only one biometric modality satisfies the best quality threshold and it has the maximum priority value, that modality is selected for carrying out authentication.

However, if multiple biometric modalities crosses the quality threshold then all selected modalities are forwarded to the Adaptive Score-Level Fusion Algorithm.

In case that no single biometric modality passes the minimum quality threshold, or the priority value is maximized, the user system keeps requesting metric recapture and retains only signature with maximum priority.

This strategy results in a decision model that will assist us in avoiding false non-matches to actual users and unnecessary unreliable biometric evidence. It also gracefully supports deterioration in authentication performance due to less than ideal biometric capture conditions. The proposed quality-aware prioritisation mechanism from the mathematical formulation in Equations (4.1)–(4.6) is integrated in the Adaptive Modality Selection Algorithm. The algorithm implements this mathematical model by choosing the biometric modality (or combination of modalities) whose quality threshold and adaptive priority criteria are optimally satisfied before feature matching and multimodal fusion.

Algorithm 4.1: Adaptive Modality Selection

Input:

    M = {Face, Gait}

    Q(mi) : Biometric quality score

    T     : Quality threshold

Output:

    S     : Selected biometric modality (or modalities)

1:  Initialise S ← ∅

2:  for each modality mi ∈ M do

3:      Capture biometric sample

4:      Evaluate biometric quality Q(mi)

5:      Compute priority score P(mi)

6:      if Q(mi) ≥ T then

7:          S ← S ∪ {mi}

8:      end if

9:  end for

10: if S = ∅ then

11:     Select

            mbest = arg max P(mi)

                    mi∈M

12:     S ← {mbest}

13:     Request biometric recapture

14: end if

15: return S

END

The formulation of the algorithm given here is intentionally performed on modality selection first, then template matching and multimodal fusion. This design optimally avoids the unnecessary processing of low-quality bio-metric samples while guaranteeing that all authentic-ation decisions are supported only by high-quality biometric evidence. The algorithm incorporates a single prioritisation function allowing for adaptive authentication using biometric quality, contextual suitability and historical reliability without modifying the general layered architecture of AMBS. In addition, the algorithm is functional in respects adaptive modality selection, multimodal authentication and real-time decision making while following through with traceability from the proposed artefact, system architecture and Design Science Research methodology [14,15,30,[34],43].

4.6.2 Feature Extraction and Matching

After adaptive modality selection, the chosen biometric modality is processed to construct a set of representative biometric features used for identity verification. Feature extraction and matching are the basic biometric processing functions of the proposed Adaptive Multimodal Biometric System (AMBS). This stage aims to convert raw biometric data into discriminative feature representations that can be efficiently compared with securely stored biometric templates. The design is aligned with functional needs related to user authentication, real-time processing and recognition accuracy [21], [30], while supporting compatibility with the Edge Processing Layer introduced in Section 4.5. [39]. Recent biometric recognition study confirms that the feature extraction has a strong impact on accuracy of recognition, since how well people can be differentiated depends directly on the extracted features.

Instead of directly comparing raw images or video sequences, most modern biometric systems use machine learning and deep learning methods that learn compact feature representations that are invariant to environmental variation, illumination variation, pose variation and sensor noise [21], [39], [57]. As a result, feature extraction has become one of the essential building blocks in intelligent multimodal biometric systems [6], [28], [43]. The presented framework allows deep learning based biometric feature extraction for both facial and gait biometrics. Instead of using hand-crafted feature descriptors, the framework consists of learned feature representations that can learn distinctive biometric traits while being invariant to varying illumination and pose as well as the users movement and environmental conditions [21], [39], [57], [59]. During the design stage, we are interested in defining the logical mechanism that should be performed when extracting features — not a specific implementation method. Thus, the framework does not depend on any specific type of deep learning architecture or software library / development platform. The architecture also enables biometric processing at the edge to reduce communication latency, protect access [17], [30], and increase authentication speed [53]. In this regard, the choice of specific deep learning models and algorithms for implementation is deliberately postponed until Chapter 5, where the framework proposed in this work is practically implemented.

Following feature extraction, each selected biometric modality produces a feature vector represented by

where denotes the feature vector extracted from the selected biometric modality .

The extracted feature vector is subsequently compared with the corresponding enrolled biometric template stored securely in the biometric template database. The enrolled template is represented as

where denotes the reference biometric template associated with the claimed user identity.

Authentication is performed by computing the similarity between the extracted feature vector and its corresponding enrolled template. The similarity score is defined as

where:

represents the extracted feature vector of biometric modality ; 

denotes the enrolled biometric template stored in the biometric database; 

is the similarity function used to compare the extracted feature vector with the enrolled template; and 

represents the resulting similarity score, where higher values indicate greater similarity between the captured biometric sample and the enrolled template. 

The similarity score indicates the extent of match between the captured biometric sample and its corresponding identity template stored in a database. Higher similarity values indicate stronger evidence in support of common origin while lower values are indicative of weaker correspondence. Instead of outputting the authentication decision, calculated similarity scores are forwarded to the Adaptive Score-Level Fusion. This design modularizes the feature extraction from multimodal decision making, thus improving modularity as well as maintainability and scalability within the architecture proposed.

The proposed Feature Extraction and Matching Algorithm is summarised in Algorithm 4.2.

Algorithm 4.2: Feature Extraction and Matching

Input:S : Set of selected biometric modalitiesB : Captured biometric samplesTi : Enrolled biometric templatesOutput:Score(mi) : Similarity score for each selected modality1: for each biometric modality mi ∈ S do2: Preprocess the captured biometric sample3: Extract the feature vector Fi4: Retrieve the corresponding enrolled template Ti5: Compute the similarity scoreScore(mi) = sim(Fi, Ti)6: end for7: return {Score(mi) | mi ∈ S}

END

However, it is the Feature Extraction and Matching algorithm that proposes the necessary evidence of authentication to be utilized later by the stages of AMBS. The algorithm aids real-time processing by preprocessing biometric samples before template comparison and represents them as feature vectors with unique classes, increasing recognition reliability. Moreover, the isolation of different stages in a biometric authentication framework like feature extraction, template matching and multimodal fusion facilitates modular system architecture which allows easy integration of new biometric modalities in the future without excessive redesigning of the whole system. Consequently, the algorithm delivers biometric evidence in order to perform adaptive multimodal fusion while being in line with both the layered architecture and Design Science Research based approaches [6], [30], [34], [43].

4.6.3 Adaptive Score-Level Fusion

The Adaptive Multimodal Biometric System (AMBS) combines the similarity scores computed for each selected biometric modalities, after performing feature extraction and template matching, to output a single authentication score. This is called score level fusion, which allows the system to combine different kinds of biometric evidence before making a final decision on authentication. The Adaptive Authentication and Fusion Layer in the proposed architecture meditates score-level fusion, by taking scores as input from the Feature Extraction and Matching component antennae (matching level) and outputting a single authentication confidence score for further context-aware decision-making. Information fusion in multimodal biometric systems generally occurs with one of four levels: sensor level, feature level, score level or decision level. Score-level fusion is one of these alternatives that have attracted significant consideration, because it provides a good trade-off between computational complexity, implementation flexibility and authentication precision, without the difficulties involved in feature-level combination [43], [44], [45], [48]. Furthermore, score-level fusion allows for the combination of biometric modalities that have been created utilizing alternative feature extraction methods, without enforcing identical features.

Conventional score-level fusion methods often use static weighting strategies with each biometric modality contributing equally to the final presentation attack score. While being computationally efficient, fixed weighting on the other hand assumes independent biometric modalities provide equally strong authentication evidence in every operational scenario. However, the practical university environment biometric quality is affected by such environmental conditions as illumination, crowd density, user movement and sensor quality. Hence, employing to all modalities the same weights could lead to unreliable authentication if one biometric sample is much less reliable than another biometric [6], [15], [43].

To alleviate this drawback, the proposed AMBS employs an adaptive score-level fusion scheme by dynamically assigning weighted factors corresponding to the reliability of each biometric modality. The presented design is based on the idea of emphasizing the contribution of better quality biometric modalities towards final authentication score whilst limiting the impact caused by blindly assigning equal weights to weaker forms of biometric evidence. This mechanism for adaptive weighting is in support of the objective of enhancing authentication robustness across a spectrum of operational conditions.

Let

denote the similarity score generated by biometric modality , and let

represent the adaptive weighting coefficient assigned to that modality.

The final fused authentication score is therefore computed as

subject to the normalisation constraint

where denotes the overall fused authentication score, represents the similarity score generated by biometric modality , is the adaptive weighting coefficient assigned to modality , and denotes the total number of biometric modalities participating in the authentication process.

Weighting Coefficients are calculated using the biometric quality estimation executed at Adaptive Modality Selection step. The quality score of a biometric modality determines the proportional weight given to it in weighting-based fusion, with modalities achieving high values taking larger weights and those that are less confident contributing less to forming the final authentication score. Thus, the final authentication score combines biometric feature similarity as well as the confidence level of the biometric evidence available for supporting the authenticating request. Moreover, the final score resulting from score fusion is sent to the Context-Aware Decision Algorithm, presented in the next subsection. Its modular architecture decouples the aggregation of biometric evidence from the generation of access decisions, improving both system maintainability and ease of extensibility for future systems following this framework.

The Adaptive Score-Level Fusion Algorithm is summarised in Algorithm 4.3.

Algorithm 4.3: Adaptive Score-Level Fusion

Input:Similarity scores (Si)Adaptive weights (wi)

Output:Fused authentication score (S{fused})

BEGIN

    Initialise Sfused ← 0

    For each similarity score Si do

        Sfused ← Sfused + (wi × Si)

    End For

    Return Sfused

END

Adaptive Score-Level Fusion Algorithm is an algorithm to combine biometric evidence from different modalities through score-fusion, able to take into consideration the disparity in biometric quality and repeability across modalities. In contrast to traditional multimodal biometric systems that use static weighting strategies, the proposed scheme adaptively fuses all the modalities prior to fusion into one complete authentication score based on their estimated portion of influence. This design allows for better robustness in authentication while still maintaining the modular architecture of AMBS. In addition, the decoupling of adaptive fusion from the subsequent decision layer facilitates scalability and allows for integrating further biometric modalities into the system framework while still preserving the original authentication architecture design [6], [15], [43], [45].

4.6.4 Context-Aware Decision Algorithm

The last phase of the proposed Adaptive Multimodal Biometric System (AMBS) is to decide the access allowed, rejected and/or requiring extra authentication. After adaptive score-level fusion by itself, the fused authentication score cannot be used to make reliable access decisions because biometric confidence may fail to accurately capture risk associated with a particular authentication request. Thus, an incorporated context into the decision-making process of the proposed account management-based system (AMBS) can enhance adaptivity and reliability of authentication decisions in different operational situations. Context-aware authentication, as a complement to biometric evidence is used for improving access control by taking into account environmental, behavioural and operational factors. In contrast to traditional authentication systems that set a static decision threshold on every authentication attempt, context-aware mechanisms evaluate the conditions in which authentication takes place, e.g. user location, access time, environmental state and device status and behavioural traits [9], [14], [20], [51]. Use of context information in synthesizing solution to let the authentication systems change concurrency with the change in level, which helps in reducing false acceptance rate and non-fallacy rejection of genuine users.

The proposed system specifically incorporates the Context-Aware Decision Algorithm functionality of the seven-layer Adaptive Multimodal Biometrics System (AMBS) architecture after adaptive score-level fusion is applied. The fused authentication score is fed to the algorithm along with contextual information generated by the Context-Aware Decision Layer. These contextual attributes are analysed to estimate the operational risk associated with any authentication request leading to a final access decision before processing the action.

The contextual information considered by the proposed framework includes:

authentication location;

time of access request;

environmental conditions;

user behavioural consistency; and

current security risk level.

These contextual attributes are collectively represented by a contextual risk value,

where denotes the normalised contextual risk associated with a particular authentication request.

The contextual risk value is constrained to the interval

A value of zero indicates a low-risk authentication environment while values approaching one indicate an increased operational risk situation that necessitates more stringent authentication decisions.

The baseline and adaptive authentication thresholds are combined to get the adaptive authentication threshold, which considers contextual risk. The modified decision threshold is expressed as

where denotes the baseline authentication threshold, represents the normalised contextual risk value associated with the authentication request, is the risk sensitivity coefficient that determines the influence of contextual risk on the authentication threshold, and denotes the adaptive authentication threshold used to make the final authentication decision.

The relation shown in the following equation allows for the authentication threshold to rise when contextual risk rises. Thus, when an authentication request is made from a high-risk environment, the access to any system would hold up until stronger biometric evidence passes through, while in an age old operating condition; it still retains its baseline level of authentication threshold.

The final authentication decision is determined by comparing the fused authentication score with the adaptive threshold.

If

where denotes the fused authentication score and represents the adaptive authentication threshold defined in Equation (4.16). When this condition is satisfied, the user is successfully authenticated and access to the protected resource is granted.

Conversely, if the fused authentication score does not satisfy the adaptive threshold,

results in either access denial or a request for additional authentication depending on the assessed operational risk.

This responsive decision-making process allows the AMBS to automatically adapt with changes in environmental circumstances without administrator intervention to change authentication protocols. Finally, having biometric fusion isolated from contextual decision making increases the flexibility of the system and enables organisational security policies to change independently to those of biometric processing components.

The Context-Aware Decision Algorithm is presented in Algorithm 4.4.

Algorithm 4.4: Context-Aware Decision

Input:Sfused : Fused authentication scoreT : Baseline authentication thresholdR : Contextual risk valueα : Risk sensitivity coefficientOutput:D : Authentication decision

BEGIN

    Compute adaptive threshold

    T' ← T + αR

    If Sfused ≥ T' then

        Grant Access

    Else

        If R is High then

            Request Additional Authentication

        Else

            Deny Access

        End If

    End If

    Return Authentication Decision

END

The proposed Context-Aware Decision Algorithm integrates biometric confidence with contextual risk analysis to enable adaptive authentication decisions within the Adaptive Multimodal Biometric System (AMBS). Unlike conventional biometric authentication systems, which rely on fixed authentication thresholds and are unable to respond effectively to changing operational conditions, the proposed algorithm dynamically adjusts authentication decisions according to the assessed contextual risk associated with each authentication request. This adaptive capability enhances the resilience, security, and operational effectiveness of the framework while maintaining compliance with institutional access control policies. Furthermore, the modular separation of biometric processing, adaptive fusion, and context-aware decision-making promotes scalability and facilitates the integration of additional biometric modalities and contextual attributes without requiring substantial architectural modifications [9], [14], [15], [30].

Collectively, Algorithms 4.1–4.4 constitute the computational core of the proposed Adaptive Multimodal Biometric System (AMBS). The algorithms operate sequentially to perform adaptive modality selection, feature extraction and biometric matching, adaptive score-level fusion, and context-aware authentication decision-making. Together, they operationalise the functional requirements identified in Section 4.3 and implement the seven-layer architecture presented in Section 4.5, thereby establishing complete traceability between the system requirements, architectural design, mathematical formulation, and adaptive algorithms. Consequently, these algorithms provide the computational foundation for the implementation and experimental evaluation of the proposed AMBS presented in Chapter 5 [30], [34].

DESIGN RATIONALE

The Design Science Research (DSR) methodology insists that an artefact proposal should be supported by explicit and theoretical design decisions rather than ad hoc choices during implementation. In this regard, the design rationale discussed in this section provides the basis for our main architectural and algorithmic choices made in implementing the Adaptive Multimodal Biometric System (AMBS). The research problem discussed in Chapters 1–3 together with the functional and non-functional requirements reported in Section 4.3, in addition to well-known principles documented on multimodal biometrics, adaptive authentication, context-aware access control, and intelligent security systems [14], [30], [34] guided these decisions accordingly. A new architecture of AMBS is proposed by taking into account that the conventional university access control systems are based on static authentication mechanisms and single biometric modality. Current studies have shown that traditional biometric system often suffers from wear and degrade the performance when the quality of biometric data is bad, environment changes around recognition system even face spoofing attacks [28], [45], [57].

These constraints are especially critical in higher education institutions, where authentication systems must work reliably across multiple access points, various environmental conditions and large user populations [31],[68]. As a result, every important design decision built into the AMBS was designed to overcome at least one of these identified weaknesses while still covering a design goal for the intended artefact. Table 4.13 outlines the main design choices taken in designing AMBS and how each choice addresses the defined research problem and related system requirements.

Table 4.13: Design Decision Justification Matrix

Design Decision

Design Justification

Research Problem Addressed

Requirements Supported

Multimodal biometric authentication (Face and Gait)

Combines complementary physiological and behavioural biometrics to improve authentication accuracy, robustness and spoof resistance.

Low recognition accuracy and vulnerability of unimodal biometric systems.

FR: User Authentication, Multimodal Fusion; NFR: Accuracy, Security

Seven-layer architecture

Separates system responsibilities into independent functional layers to improve modularity, maintainability, scalability and traceability.

Monolithic security systems that are difficult to maintain, extend and evaluate.

NFR: Maintainability, Scalability; DC: Modular deployment

Adaptive modality selection

Selects the most appropriate biometric modality according to biometric quality and operational conditions before authentication.

Performance degradation caused by poor-quality biometric samples.

FR: Adaptive Modality Selection; NFR: Adaptability

Adaptive score-level fusion

Dynamically combines biometric evidence according to biometric quality rather than fixed weighting.

Reduced authentication reliability when all modalities are treated equally.

FR: Multimodal Fusion; NFR: Accuracy

Context-aware authentication

Integrates contextual risk information with biometric confidence before generating authentication decisions.

Static authentication thresholds that cannot respond to changing security conditions.

FR: Context-Aware Adaptation; NFR: Security

Edge-based biometric processing

Processes biometric information locally to minimise latency, improve privacy and reduce dependence on network connectivity.

Network latency, privacy concerns and limited availability of continuous connectivity.

DC: Edge Processing; NFR: Performance, Privacy

Governance and audit mechanisms

Supports accountability, regulatory compliance and lifecycle management of biometric information.

Lack of auditability, accountability and regulatory compliance within conventional access control systems.

FR: Administration; NFR: Privacy and Compliance

The other key design decision was multimodal biometric authentication provided by facial recognition and gait recognition. While facial recognition offers highly discriminative physiological traits, gait recognition produces behavioural biometric features which can be more easily captured without direct physical contact. However, the limitations associated with one biometric modality can be compensated for by the strengths of the other, and therefore blending these modalities enhances authentication robustness. As shown by earlier studies, multimodal biometric systems lead to more accurate recognition, better security against spoof attacks and overall greater operational reliability than unimodal biometric systems [6], [7], [21], [39], [43], [46]. The second design decision concerned the seven-layer architectural model. Layering architectures are well-known to foster separation of concerns, modularity, scalability, maintainability and independent evolution of system components [30], [65], [72]. This architecture proposes separate functional layers for each of the following: Biometric acquisition, Biometric processing, Adaptive authentication and context-aware decision-making, Data management & governance. This separation allows for the independent evolution of each architectural constituent as well as maintaining overall system integrity, and adheres to the iterative refinement anticipated in Design Science Research [34].

The presented framework thus utilizes adaptive authentication via adaptive modality selection, adaptive score-level fusion and context-aware decision-making. Unlike conventional authentication systems that have strict decision rules built into the system, AMBS first assesses both the quality of the biometric data and contextual risk on a per-sample basis before deciding which method best satisfies both. This adaptive behaviour enables the framework to maintain security of authentication under environmental instability [9], [14], user behaviour variation [15] and operational risk adaptability [51].

An edge-based biometric processing was another design choice that played a key role in the system. Also, operating biometric processing at the edge, meaning at or nearer to the access point, minimizes communication delay, boosts promptness of authentication and enhances privacy by avoiding unwanted transmission of sensitive biometric information across communication networks [17], [30], [53]. This Design also supports continuous operations during transient interruptions in the network connectivity and meets the non-functional requirements related to performance, reliability, and privacy identified during requirement analysis stage.

Last but not least, the proposed AMBS includes governance and administrative tools to carryout responsible management of biometrics throughout their life-cycle. Policy management, audit logging, user administration and compliance monitoring act as organisational controls for establishing accountability, transparency and regulatory compliance consistent with privacy-by-design principles along with legally binding obligations like the Protection of Personal Information Act (POPIA) [17] and the General Data Protection Regulation (GDPR) [18], [53]. In general, the proposed design embodies a systematic amalgamation of established architectural principles, multimodal biometric technologies and adaptive authentication mechanisms within a single artefact for DSR. Each design decision was chosen to tackle one of the restrictions identified whilst investigating the problem and analysing requirements, supporting both functional objectives as well as quality attributes for the proposed AMBS. The design rationale thus provides a traceable connection from the external context such as the research problem that motivates the study, through system requirements, architectural design and adaptive algorithms presented in this chapter, thereby providing a theoretical basis for implementation and evaluation phases detailed in the next chapters [30], [34].

CONCLUSION

This chapter presented the complete analysis and design of the proposed Adaptive Multimodal Biometric System (AMBS) using the Design Science Research (DSR) methodology. The functional and non-functional requirements, design constraints, UML models, layered architecture, adaptive authentication algorithms, and design rationale were developed to provide a comprehensive blueprint for the proposed artefact. Collectively, these design components establish traceability between the research objectives, identified security challenges, and the proposed adaptive biometric solution, thereby providing the foundation for the implementation and evaluation of the AMBS presented in the next chapter.

CHAPTER 5: SYSTEM IMPLEMENTATION

 LIST OF REFERENCES

[1] MyBroadband, "Tshwane University of Technology hit by ransomware," May 12, 2023. [Online]. Available: https://mybroadband.co.za/news/security/487911-tshwane-university-of-technology-hit-by-ransomware.html

[2] TimesLIVE, "UNISA admits to exam paper leaks," Oct. 21, 2019. [Online]. Available: https://www.timeslive.co.za/news/south-africa/2019-10-21-unisa-admits-to-exam-paper-leaks/

[3] F. Skopik, D. Schall, and M. Wurzenberger, "Behaviour-based anomaly detection in log data of physical access control systems," IEEE Trans. Dependable Secure Comput., vol. 20, no. 1, pp. 289–302, 2023, doi: 10.1109/TDSC.2022.3187859.

[4] K. M. M. Uddin, N. Rahman, M. M. Rahman, and S. K. Dey, "Artificial intelligence-based domotics using multimodal security," Int. J. Intell. Syst. Appl., vol. 15, no. 3, pp. 44–55, 2023.

[5] M. K. Pasupuleti, "AI-enabled multimodal biometrics: Advancing security with facial, voice, and behavioural integration," Int. J. Acad. Res. Innov., vol. 5, no. 1, 2025, doi: 10.62311/nesx/77579.

[6] S. Salturk and N. Kahraman, "Deep learning-powered multimodal biometric authentication: Integrating dynamic signatures and facial data for enhanced online security," Neural Comput. Appl., vol. 36, pp. 11311–11322, 2024, doi: 10.1007/s00521-024-09690-2.

[7] J. Samatha and G. Madhavi, "SECURESENSE: Enhancing person verification through multimodal biometrics for robust authentication," Scalable Comput. Pract. Exp., vol. 25, no. 2, pp. 1040–1055, 2024, doi: 10.12694/scpe.v25i2.2524.

[8] A. Verma, V. Moghaddam, and A. Anwar, "Data-driven behavioural biometrics for continuous and adaptive user verification using smartphone and smartwatch," Sustainability, vol. 14, no. 12, Art. no. 7362, 2021.

[9] J. Liu, J. Lin, C. Yang, and Y. Zhou, "Risk-aware access control in cyber-physical contexts," Digit. Threats Res. Pract., vol. 3, no. 4, Art. no. 43, 2022.

[10] V. Adenola, "Artificial intelligence-based access management system," M.S. thesis, East Carolina Univ., Greenville, NC, USA, 2023.

[11] R. Yang, L. Meng, and Q. Zhang, "AuthFormer: Adaptive multimodal biometric authentication transformer for middle-aged and elderly people," arXiv:2411.05395, 2024.

[12] B. Ammour, L. Boubchir, T. Bouden, and M. Ramdani, "Face-iris multimodal biometric identification system," Electronics, vol. 9, no. 1, Art. no. 85, 2020.

[13] M. Leghari, S. Memon, L. D. Dhomeja, A. H. Jalbani, and A. A. Chandio, "Deep feature fusion of fingerprint and online signature for multimodal biometrics," Computers, vol. 10, no. 2, Art. no. 21, 2021.

[14] R. Kalaria, D. Patel, and P. Shah, "Adaptive context-aware access control for IoT with fog computing," Int. J. Inf. Secur., vol. 23, pp. 3089–3107, 2024.

[15] S. Durgaraju, K. P. Kumar, K. R. Rao, and M. V. Reddy, "AI-driven adaptive multimodal authentication," J. Electr. Syst., vol. 17, no. 1, pp. 75–88, 2021.

[16] A. Budžys, R. Damaševičius, and T. Blažauskas, "Deep learning-based authentication for insider threat detection," Artif. Intell. Rev., vol. 57, Art. no. 272, 2024.

[17] A. F. Baig, Q. Nasir, and M. A. Khan, "Privacy-preserving continuous authentication using behavioural biometrics," Int. J. Inf. Secur., vol. 22, no. 6, pp. 1833–1847, 2023.

[18] C. Tucci, E. Cippitelli, E. Gambi, and S. Spinsante, "Explainable biometrics: A systematic literature review," J. Ambient Intell. Humanized Comput., 2024.

[19] A. Rahman et al., "Multimodal EEG and keystroke dynamics based biometric system using machine learning algorithms," IEEE Access, vol. 9, pp. 94625–94644, 2021.

[20] L. Md Ali, M. Qiu, and S. Schmeelk, "Access control, biometrics, and the future," in Proc. 5th Int. Conf. Image, Video Signal Process. (IVSP), 2023, pp. 1–8.

[21] L. Li, X. Lin, H. Yang, and C.-T. Lin, "A review of face recognition technology," IEEE Access, vol. 8, pp. 139110–139120, 2020.

[22] A. Desai, N. Sharma, and K. Mehta, "Multimodal authentication for keyless door locks," Int. J. Cybern. Netw. Secur., vol. 5, no. 1, 2025.

[23] C. Kivunja and A. B. Kuyini, "Understanding and applying research paradigms in educational contexts," Int. J. Higher Educ., vol. 6, no. 5, pp. 26–41, 2017.

[24] M. D. Fetters and D. Freshwater, "The 1 + 1 = 3 integration challenge," J. Mixed Methods Res., vol. 9, no. 2, pp. 115–117, 2015.

[25] A. J. Fletcher, "Applying critical realism in qualitative research: Methodology meets method," Int. J. Soc. Res. Methodol., vol. 20, no. 2, pp. 181–194, 2017.

[26] J. W. Creswell and J. D. Creswell, Research Design: Qualitative, Quantitative, and Mixed Methods Approaches, 5th ed. Thousand Oaks, CA, USA: Sage, 2018.

[27] M. Islam, "Data analysis: Types, process, methods, techniques and tools," Int. J. Data Sci. Technol., vol. 6, no. 1, pp. 10–15, 2020.

[28] P. Mane and M. Bhosale, "Multimodal biometric authentication: A review of techniques and deployment challenges," J. Intell. Secur. Syst., vol. 9, no. 4, pp. 245–260, 2023.

[29] P. Bhandari, "Ethical considerations in research: Types and examples," Scribbr, Oct. 18, 2021. [Online].

[30] J. Vegas and C. Llamas, "Opportunities and challenges of artificial intelligence applied to identity and access management in industrial environments: A review," Future Internet, vol. 16, no. 12, Art. no. 469, 2024.

[31] M. D. Magano, M. T. Sithole, and C. C. Ngwakwe, "Health and safety challenges in South African universities: A qualitative review of campus risks and institutional responses," Int. J. Environ. Res. Public Health, vol. 20, no. 22, 2023.

[32] S. Adisa and F. Simpeh, "A comparative analysis of student housing security measures," IOP Conf. Ser.: Earth Environ. Sci., vol. 654, no. 1, Art. no. 012017, 2021.

[33] D. P. Gonçalves, "Security access control effectiveness design," S. Afr. J. Ind. Eng., vol. 34, no. 3, pp. 108–119, 2023.

[34] H. Smuts, R. Winter, A. J. Gerber, and A. van der Merwe, "Designing design science research: A taxonomy for supporting study design decisions," in The Transdisciplinary Reach of Design Science Research. Cham, Switzerland: Springer, 2022, pp. 517–529.

[35] V. V. Septyanlie, V. Ikawati, E. Subiyanta, and N. Lestari, "Face recognition-based door lock security system using TensorFlow Lite," J. Electr. Eng. Comput., vol. 6, no. 2, pp. 402–409, 2024.

[36] O. E. Adetoyi and B. P. Awe, "Face recognition enabled door access control system," FUOYE J. Eng. Technol., vol. 7, no. 1, pp. 28–31, 2022.

[37] M. El Beqqal, M. Azizi, and J. L. Lanet, "Multimodal access control system combining RFID, fingerprint and facial recognition," Indones. J. Electr. Eng. Comput. Sci., vol. 20, no. 1, pp. 405–413, 2020.

[38] S. A. Haider, Y. Rehman, and S. M. U. Ali, "Enhanced multimodal biometric recognition based upon intrinsic hand biometrics," Electronics, vol. 9, no. 11, Art. no. 1916, 2020.

[39] H. M. L. Aung, C. Pluempitiwiriyawej, K. Hamamoto, and S. Wangsiripitak, "Multimodal biometrics recognition using a deep convolutional neural network with transfer learning in surveillance videos," Computation, vol. 10, no. 7, Art. no. 127, 2022.

[40] N. Alay and H. H. Al-Baity, "Deep learning approach for multimodal biometric recognition system based on fusion of iris, face, and finger vein traits," Sensors, vol. 20, no. 19, Art. no. 5523, 2020.

[41] K. Jha, A. Jain, and S. Srivastava, "Feature-level fusion of face and speech based multimodal biometric attendance system with liveness detection," AIP Adv., vol. 14, no. 11, Art. no. 115007, 2024.

[42] M. Regouid, M. Touahria, M. Benouis, and N. Costen, "Multimodal biometric system for ECG, ear and iris recognition based on local descriptors," Multimed. Tools Appl., 2019.

[43] K. P. Kumar, P. E. S. N. Krishna Prasad, Y. Suresh, M. R. Babu, and M. J. Kumar, "Ensemble multimodal biometric authentication," Multimed. Tools Appl., vol. 83, no. 13, pp. 63497–63521, 2024.

[44] K. Shinde and C. Kayte, "Multimodal deep learning based score level fusion using face and fingerprint," in Advances in Computing, Vision and Artificial Intelligence Technologies (ACVAIT 2022). Cham, Switzerland: Springer, 2023, pp. 140–152.

[45] G. Kaur, S. Bhushan, and D. Singh, "Fusion in multimodal biometric system: A review," Indian J. Sci. Technol., vol. 10, no. 28, 2017.

[46] P. Delgado-Santos, J. Pérez, and M. López, "Transformers for gait recognition," Pattern Recognit., vol. 143, Art. no. 109798, 2023.

[47] K. W. Tse and K. Hung, "User behavioural biometrics on mobile using RNN," IET Biometrics, vol. 11, no. 3, pp. 157–170, 2022.

[48] D. T. Meva and C. K. Kumbharana, "Comparative study of different fusion techniques in multimodal biometric authentication," Int. J. Comput. Appl., vol. 66, no. 19, pp. 17–19, 2013.

[49] S. S. Singh, U. Hariharan, and K. Rajkumar, "Multimodal biometric authentication system using deep learning method," in Proc. Int. Conf. Emerging Smart Comput. Informatics (ESCI), 2023, pp. 1–6.

[50] K. Jha, A. Jain, and S. Srivastava, "A challenge-response based authentication approach for multimodal biometric system using deep learning techniques," Scalable Comput. Pract. Exp., vol. 23, no. 1, pp. 1–15, 2022.

[51] G. Gil et al., "Context-aware policy analysis for distributed usage control," Energies, vol. 15, no. 19, Art. no. 7113, 2022.

[52] F. Ahamed et al., "An intelligent multimodal biometric authentication model for personalised healthcare services," Future Internet, vol. 14, no. 8, Art. no. 222, 2022.

[53] W. Yang et al., "A review of homomorphic encryption for privacy-preserving biometrics," Sensors, vol. 23, no. 7, Art. no. 3566, 2023.

[54] A. Baobaid et al., "Hardware accelerators for real-time face recognition: A survey," IEEE Access, vol. 10, pp. 83723–83739, 2022.

[55] S. Md Arman et al., "A comprehensive survey for privacy-preserving biometrics," Comput. Mater. Continua, vol. 80, no. 2, pp. 1–35, 2024.

[56] TechTarget, "Biometric privacy and security challenges to know," TechTarget, 2024. [Online].

[57] D. R. Tripathi and D. K. Nishad, "Biometric authentication systems: A survey," Turkish J. Comput. Math. Educ., vol. 11, no. 3, pp. 2878–2884, 2020.

[58] UniSense Advisory, "Biometric data privacy: Challenges and concerns of digital identity," UniSense Advisory, 2024. [Online].

[59] H. Mehraj and A. H. Mir, "A survey of biometric recognition using deep learning," EAI Endorsed Trans. Energy Web, vol. 8, no. 33, Art. no. e6, 2020.

[60] S. Ahmed, M. F. Hossain, M. S. Kaiser, M. B. T. Noor, M. Mahmud, and C. Chakraborty, "Artificial intelligence and machine learning for ensuring security in smart cities," in Data-Driven Mining, Learning and Analytics for Secured Smart Cities: Trends and Advances. Cham, Switzerland: Springer, 2021, pp. 23–47.

[61] S. O. Akor, C. Nongo, C. Udofot, and B. D. Oladokun, "Cybersecurity awareness: Leveraging emerging technologies in the security and management of libraries in higher education institutions," South. Afr. J. Secur., vol. 14, pp. 1–14, 2024.

[62] A. T. Al Ghazo and M. R. Hayajneh, "Advanced IoT-AI security system with drone surveillance: Campus smart security prototype," Int. J. Eng. Appl., vol. 11, no. 5, pp. 346–357, 2023.

[63] T. Anagnostopoulos, P. Kostakos, A. Zaslavsky, I. Kantzavelou, N. Tsotsolas, I. Salmon, and R. Harle, "Challenges and solutions of surveillance systems in IoT-enabled smart campus: A survey," IEEE Access, vol. 9, pp. 131926–131954, 2021.

[64] S. K. B. Aballe, C. M. C. Bandala, J. R. Mercado, N. H. Rejes, T. Y. Culanag, and J. F. Cuevas, "Security measures: Effectiveness of the installation of CCTV cameras in relation to crime prevention as perceived by the community," Middle East J. Appl. Sci. Technol., vol. 5, no. 2, pp. 149–160, 2022.

[65] A. Abdullah, M. Thanoon, and A. Alsulami, "Toward a smart campus using IoT: Framework for safety and security system on a university campus," Adv. Sci. Technol. Eng. Syst. J., vol. 4, no. 5, pp. 97–103, 2019.

[66] K. AbuAlnaaj, V. Ahmed, and S. Saboor, "A strategic framework for smart campus," in Proc. Int. Conf. Industrial Engineering and Operations Management, 2020, pp. 790–798.

[67] A. Badshah, A. Ghani, M. A. Qureshi, and S. Shamshirband, "Smart security framework for educational institutions using Internet of Things (IoT)," Comput. Mater. Continua, vol. 61, no. 1, pp. 81–101, 2019.

[68] A. P. Calitz, M. D. M. Cullen, and C. Jooste, "The influence of safety and security on students' choice of university in South Africa," J. Stud. Int. Educ., vol. 24, no. 2, pp. 269–285, 2020.

[69] N. Cavus, S. E. Mrwebi, I. Ibrahim, T. Modupeola, and A. Y. Reeves, "Internet of Things and its applications to smart campus: A systematic literature review," Int. J. Interact. Mob. Technol., vol. 17, no. 23, pp. 4–20, 2022.

[70] F. P. Cornelius and S. K. Jansen van Rensburg, "Emerging South African smart cities: Data security and privacy risks and challenges," South Afr. J. Inf. Manage., vol. 26, no. 1, Art. no. a1847, 2024.

[71] M. Dener, "Smart campuses and campus security," in Academic Studies in Engineering Sciences. Lyon, France: Editora Livre de Lyon, 2020, pp. 103–113.

[72] Z. Y. Dong, Y. Zhang, C. Yip, S. Swift, and K. Beswick, "Smart campus: Definition, framework, technologies, and services," IET Smart Cities, vol. 2, no. 1, pp. 43–54, 2020.

[73] J. Gregory, "An easy target: Studentification, crime and safety of students in Johannesburg," S. Afr. Geogr. J., vol. 104, no. 3, pp. 366–381, 2022.

[74] F. Z. Izourane, S. Ardchir, S. Ounacer, and M. Azzouazi, "Smart campus based on AI and IoT in the era of Industry 5.0: Challenges and opportunities," in Industry 5.0 and Emerging Technologies. Cham, Switzerland: Springer, 2024, pp. 39–57.

[75] S. K. Jagatheesaperumal, S. E. Bibri, J. Huang, J. Rajapandian, and B. Parthiban, "Artificial intelligence of things for smart cities: Advanced solutions for enhancing transportation safety," Comput. Urban Sci., vol. 4, no. 1, Art. no. 10, 2024.

[76] R. K. A. R. Kariapper, A. C. M. Nafrees, M. S. Razeeth, and P. Pirapuraj, "Emerging smart university using various technologies: A survey analysis," Test Eng. Manage., vol. 82, pp. 17713–17723, 2020.

[77] G. Kirui, "Enhancing police operations: The impact of CCTV in monitoring, incident response, and crime investigation," Int. J. Sci. Res. Manage., vol. 12, no. 5, pp. 1823–1834, 2024.

[78] G. Kirui, B. Muiya, D. Ochieng, and S. Waithaka, "Challenges in using closed-circuit television in police operations," Strateg. J. Bus. Change Manage., vol. 10, no. 1, pp. 635–648, 2023.

[79] J. K. Lekganyane, W. Maluleke, and J. Barkhuizen, "Exploring perceptions of students on safety and security in South African universities," ScienceRise: Juridical Science, vol. 4, no. 26, pp. 49–58, 2023.

[80] Y. Li, "Application of big data technology in campus security management under the background of information age," in J. Phys.: Conf. Ser., vol. 1881, no. 2, 2021.

[81] S. K. Mahariya, A. Kumar, R. Singh, A. Gehlot, S. V. Akram, B. Twala, and N. Priyadarshi, "Smart Campus 4.0: Digitalization of university campus with assimilation of Industry 4.0," J. Adv. Res. Appl. Sci. Eng. Technol., vol. 32, no. 1, pp. 120–138, 2023.

[82] M. Makhaye, "The use of routine activity theory in explaining crime at university campus residences," Acta Criminologica, vol. 34, no. 2, pp. 26–42, 2021.

[83] J. T. Mofokeng, N. Simelane, and L. Mofokeng, "Student safety and security for sustainable and inclusive residences," OIDA Int. J. Sustain. Dev., vol. 16, no. 4, pp. 11–28, 2023.

[84] A. Moghayedi, K. Michell, K. Le Jeune, and M. Massyn, "Assessing technological innovations on university safety and security," Facilities, vol. 42, no. 3/4, pp. 223–244, 2024.

[85] A. Moosa, K. Ohei, E. Raymond, and E. P. Chukwuneme, "The roles of campus protection services for students' safety," Int. J. Innov. Manage. Econ. Soc. Sci., vol. 3, no. 1, pp. 1–11, 2023.

[86] S. Moyo, "Evaluating the use of CCTV surveillance systems for crime control and prevention," M.S. thesis, Univ. South Africa, Pretoria, South Africa, 2019.

[87] A. A. Nngidi, "Assessment of risk management in digitalization of facilities management in South Africa," Ph.D. dissertation, Univ. Johannesburg, Johannesburg, South Africa, 2023.

[88] T. Ntloedibe, T. Foko, and M. A. Segooa, "Cloud leakage in higher education in South Africa," S. Afr. J. Inf. Manage., vol. 26, no. 1, pp. 1–8, 2024.