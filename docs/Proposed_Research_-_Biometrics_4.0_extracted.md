# Proposed Research - Biometrics 4.0.docx

Adaptive multimodal biometric systems for enhancing physical security in South African universities

Student Name: Mr. Fulufhelo Bismarck Thavhanyedza

Student Number: 56099606

Discipline: Computer Science

Proposed Degree: PhD Computer Science

Institution:  North-West University, Mafikeng

Proposed Supervisor(s): Prof Bassey Isong

Key Concepts And Definitions

The Internet of Things (IoT) is a network of networked devices with sensors and software that collect, process, and exchange data to enable automation and smart decision-making in intelligent environments [14]. 

The term Artificial Intelligence (AI) describes the development of computer programs that replicate aspects of human intelligence, including pattern recognition, learning, and reasoning [4]. 

Adaptive security, classification, and prediction are common applications of Machine Learning (ML), a subset of artificial intelligence that enables systems to automatically learn from data and experience [5]. 

CNNs, RNNs, and transformers are examples of multi-layer neural networks, a subset of machine learning known as "Deep Learning" [6]. 

Biometrics are techniques for identification and verification that depend on differentiating between behavioral (such as a voice, movement, or keyboard habits) or physiological (such as a fingerprint, iris, or face) characteristics. [5, 7]. 

Systems that combine two or more behavioral or physiological characteristics to increase accuracy and lessen vulnerability to spoofing attacks are known as Multimodal Biometrics. [5], [7]. 

A security framework called an Access Control System (ACS) is made to control access, either digitally or physically, usually with the use of passwords, PINs, cards, or biometrics [3].

A risk-based security technique called Adaptive Authentication dynamically modifies authentication requirements according on user behavior, device type, location, or access time [15].

In order to enhance decision-making and system performance, context-aware computing systems identify and analyze human or environmental context [14]. 

An insider threat is a security risk that arises when employees abuse their access rights to compromise systems or sensitive data [16]. 

An impersonation technique known as "Spoofing" allows an attacker to get around security measures by using forged biometric characteristics, like a mask or fingerprint [6]. 

The ability to perceive, evaluate, and project events and environmental aspects in real-time to enable prompt threat identification and reaction is known as situational awareness [3]. 

The term "privacy-preserving" describes authentication techniques intended to protect identifiable and personal data while it is being collected, processed, and verified [17].

List Of Acronyms

AI – Artificial Intelligence

ACS – Access Control System

API – Application Programming Interface

CNN – Convolutional Neural Network

DL – Deep Learning

EER – Equal Error Rate

FAR – False Acceptance Rate

FRR – False Rejection Rate

GDPR – General Data Protection Regulation

ICT – Information and Communication Technology

IoT – Internet of Things

LSTM – Long Short-Term Memory (neural network model)

ML – Machine Learning

PIN – Personal Identification Number

POPIA – Protection of Personal Information Act

RNN – Recurrent Neural Network

VPN – Virtual Private Network

Introduction and problem statement

Introduction

Protecting critical areas such as data centres, research labs, and examination storage facilities is a growing concern for South African universities. These areas house sensitive academic data and digital infrastructure essential to institutional legitimacy and national innovation goals. Traditional access control methods, including PINs, access cards, and fingerprint scanners, offer limited security and are increasingly ineffective against insider threats, modern intrusion techniques, and unusual user behaviour [3], [4]. Biometric technologies improve identification by using unique physical or behavioural traits, but systems relying on a single trait, such as fingerprints or facial recognition, remain vulnerable to environmental factors, user variability, and spoofing attempts [12]. Multimodal biometric systems, which combine multiple traits like facial features, typing patterns, and movement, enhance accuracy, strengthen defences against intrusions, and improve system dependability [5], [6], [7].

Artificial intelligence and machine learning developments have made it possible for continuous and adaptive authentication systems to react instantly to user behavior, environmental changes, and emerging threats [5], [8], [9], 30]. Studies demonstrate that AI-powered multimodal systems perform better than single-trait methods, providing context-aware monitoring, increased accuracy, and reliability [4], [9], and [10]. Despite these benefits, there are still challenges such as limitations on IoT devices, privacy and ethical concerns, regulatory compliance, and emerging threats like AI based deepfakes [11], [17].

In South Africa, the inadequate and insufficient utilisation of AI powered multimodal behavioural biometrics creates a significant risk to the integrity and sustainability of institutional trust [10], [11]. To address this pressing issue, there is an urgent need for the development of  ethical, adaptable, and context-sensitive authentication frameworks that can effectively protect vital resources while ensuring both privacy and integrity for individuals involved in the system. This approach not only enhance security but also fosters a more trustworthy environment.

Problem statement

Univesities today employ a diverse range of access control systems that are aimed at securing students, staff, and assets across their campuses. Despite these systems, theft, vandalism and other criminal activities are the major security challenges faced by the universities in South Africa today. Poor access control and surveillance measures contributes to security breaches and vulnerabilities in academic buildings, student housing, and other critical facilities [31]-[33]. Facilities like research laboratories, data centres and examination storage rooms are prime targets for both insider threats and external attacks because they store sensitive academic records, research outputs, and core digital infrastructure. Incidents, such as the ransomware breach at Tshwane University of Technology [1] and examination paper leaks at the University of South Africa [2], underscore the pressing need for adaptive security measures. Although these assets are critical, most universities still utilise traditional access control systems, such as fingerprint scanners, magnetic cards, and PIN authentication. 

Static measures are no longer effective against credential theft, tailgating, and social engineering [5], [6]. Recent developments in artificial intelligence (AI) and machine learning (ML) have made it possible to develop multimodal behavioural biometric systems, which integrate many modalities like speech, gait, facial features, and mouse and keyboard dynamics. These systems provide constant, undetectable, and extremely precise authentication making them more appropriate for high-security settings [17], [30]. Despite these emerging well-established recent access control frameworks [5]–[10], universities have not yet adopted these solutions in practise. Compared to unimodal authentication, Pasupuleti [7] highlighted that multimodal biometrics have more benefits. Tse and Hung [5] and Shaw et al. [6] demonstrated that these adaptive techniques can also increase resilience and flexibility. Additionally, Adenola [10] provided a theoretical framework with small empirical evidence to support it in real-world settings. 

However, most studies were based on trials in controlled environments or IoT prototypes lacking real world implementation in high-security physical environments [4]. Moreover, ethical, legal, and cultural elements such as stakeholder trust, data governance, permission, and privacy are also necessary for the successful implementation of these systems, but they are frequently disregarded [17], [18]. The acceptability may be lowered if they are not addressed.

This study will addresses these gaps by examining a context-aware access control architecture that combines adaptive risk analysis and multimodal behavioural biometrics. The framework aims to provide real-time anomaly detection and dynamic access decisions, designed for the unique operational and ethical challenges of university environments. Through empirical testing and ethical review within a South African institution, the research seeks to develop a robust and responsible security solution for safeguarding academic infrastructure.

Motivation

This study is important because it bridges the gap between the experimental models and the operational implementation of context-aware multimodal access control systems in South African institutions. The study will integrate continuous biometric authentication with real-time risk analysis to provide empirical evidence of system effectiveness, institutional influence, and ethical acceptability. In high-risk academic settings, the results are anticipated to inform the technological design and governance of next-generation access control systems, improving security, usability, and ethical compliance [1], [2], [5]–[8], [10], [15].

Research Questions

RQ1: What are the limitations of existing access control systems in higher education, particularly regarding physical security and user authentication?

RQ2: How can adaptive authentication frameworks and multimodal biometrics improve robustness, usability, and operational reliability in academic settings?

RQ3: To what extent can a context-aware access control framework integrating multimodal biometrics and adaptive risk analysis enhance security in real university environments?

RQ4: What are the ethical, legal, cultural, and privacy implications of deploying such a framework in higher education?

Aim

To evaluate a context-aware access control framework using multimodal behavioural biometrics and adaptive risk analysis to improve security, usability, and ethical compliance in higher education.

Research Objectives

RO1: Analyse current access control mechanisms and their limitations in South African universities.

RO2: Examine adaptive authentication frameworks and multimodal biometric approaches for potential application in higher education.

RO3: Design and implement a context-aware access control framework that integrates multimodal behavioural biometrics with adaptive risk analysis.

RO4: Empirically evaluate the framework’s effectiveness in detecting anomalies, supporting dynamic access decisions, and addressing operational, ethical, privacy, legal, and cultural considerations.

Preliminary Literature Study 

Traditional access control in universities relies mainly on unimodal biometrics, such as fingerprints or facial recognition, combined with static credentials like ID cards, passwords, or PINs. While widely used, these systems have clear limitations: static credentials can be lost, stolen, or compromised, and unimodal biometrics are vulnerable to environmental interference, variability, and spoofing, reducing reliability[6]. Verification usually occurs only at the point of entry, leaving sensitive areas unprotected [19]. Behavioural biometrics offers a continuous, non-intrusive alternative by monitoring patterns such as gait, gestures, speech, or typing dynamics  [20]. These traits complement traditional physiological biometrics, providing adaptive and forgery-resistant authentication. However, single behavioural traits are susceptible to variability caused by environment, fatigue, or health, which may lead to errors [5].

AI and deep learning have enhanced behavioural biometric systems’ accuracy and adaptability. CNNs handle visual tasks, RNNs and LSTMs track temporal patterns, and transformer-based models integrate multiple data types [21]. Hybrid approaches combining CNNs with attention mechanisms or audio-visual data improve robustness and reduce false rejections [12], [21], [22]. Fusion at feature, score, or decision levels balances accuracy and complexity, and ensemble techniques strengthen authentication by combining multiple modalities [13], [14], [16]. Adaptive frameworks continuously learn user behaviour and adjust thresholds based on context such as location, time, or device [14], [16], while Edge AI and lightweight models enable real-time operation on mobile and IoT devices [4]. Challenges remain, including limited real-world testing, computational demands, and vulnerability to sophisticated attacks [9]. Multimodal behavioural biometrics combine multiple physiological and behavioural traits to improve security, resilience, and accuracy [13]. Fusion can occur at sensor, feature, or score levels, with hybrid techniques demonstrating better performance and lower false acceptance rates [22]. Empirical studies report reduced equal error rates when combining face and iris recognition [6], improved authentication when fusing fingerprint and keystroke dynamics [7], and rapid intrusion detection using gait-keystroke fusion in smartphones [19].

Despite technological progress, multimodal systems raise significant privacy, ethical, and cultural concerns. Continuous monitoring of sensitive data can create issues regarding consent, surveillance, and misuse [17]. Trust requires explainable AI, transparent governance, and accountability [18]. Cultural and socioeconomic diversity affects acceptance, highlighting the need to address fairness, algorithmic bias, secure data handling, and contextual privacy [10], , [12], [17].

The above highlighted literature shows significant advances in multimodal biometrics, AI-driven adaptive frameworks, and privacy-preserving methods, yet gaps remain. Real-world testing is limited, AI-driven risk-aware models are not fully adapted to practical or ethical needs  [14], and questions of ethical acceptability, transparency, trust, privacy, and consent remain unresolved [10], [17]. This study aims to address these gaps by designing and empirically testing an AI-enabled, context-aware multimodal biometric framework that balances operational performance with ethical responsibility.

Methods Of Investigation

Research paradigm and design science research

This study follows a pragmatic research paradigm, which allows for flexibility in addressing both technical and social aspects of access control. This is because pragmatism emphasises practical problem-solving, making it suitable for evaluating AI-driven multimodal biometric systems in real-world university settings [23], [25]. The study specifically focusses on developing, implementing, and assessing a context-aware access control framework utilizing Design Science Research methodology (DSR) [34]. This method ensures that the study instantly leads to a practical solution while maintaining academic rigor. The paradigm and approach support RO1-RO4, which deals with the formulation of guidelines, operational evaluation, ethical assessment, and framework building.

Research approach

This work will follow a mixed-method approach, integrating qualitative and quantitative tools to provide a thorough knowledge combined issues [24], [44]. To address RO4, the quantitative methods will assess technical performance in terms of accuracy, false acceptance/rejection rates, and anomaly detection time. Using qualitative methods, stakeholder perspectives on privacy, trust, ethics, legal compliance, and usability will be examined; this will also address RO4). Lastly, combining the two methods guarantees thorough coverage by linking framework implementation (RO3) and empirical evaluation (RO4) with framework investigation (RO2).

Research design

An exploratory–explanatory design is used in this investigation [26]. The exploratory phase analyses existing access control mechanisms and limitations, addressing RO1 and reviews adaptive authentication and multimodal biometrics for higher education will be used to achieve RO2. In addition, the explanatory phase focuses on designing and implementing the context-aware access control framework, addressing RO3. Also, the study will be empirically evaluated in operational university environments, including ethical, privacy, legal, and cultural considerations, addressing RO4. This design ensures the study addresses all RQs thoroughly.

Data collection methods

In the context of this study, multiple methods are used to capture both technical and stakeholder-focused data to address all ROs. A comprehensive literature review will be used to analyse current access control mechanisms and multimodal biometric approaches, addressing RO1–RO2, using sources from IEEE Xplore, ScienceDirect, Google Scholar, and other academic databases. Experimental deployment tests the framework in controlled and live university settings to evaluate performance under real-world conditions, addressing RO3–RO4. Likewise, qualitative methods, as online surveys with staff, students, and security personnel, will be used to capture perceptions of privacy, trust, ethics, and usability, addressing RO4.

Population and sampling

The study population includes staff, students, and security personnel from selected South African universities [26]. In this case, a purposive sampling is employed to ensure participants have relevant experience in security, information technology (IT) systems, or access control. In this case, about 100–150 participants will complete online surveys to obtain broad representation across academic, administrative, and security roles, addressing RO4.

Data analysis methods

In the context of this study, data analysis will combine quantitative, qualitative, and mixed methods approaches. In particular, quantitative analysis will be used to compare system performance metrics with traditional access control to assess accuracy, reliability, and resilience to threats [60–62]., addressing RO4. Thematic methods are also used in qualitative analysis to find trends in privacy, ethics, and stakeholder confidence in order to address RO4. A comprehensive understanding of framework performance and user acceptance is also provided by mixed-methods integration, which addresses RO4 by integrating findings from both strands [1, 2].

Validity, reliability, and trustworthiness

Ensuring the credibility and reliability of findings is one of the goals in this study [26]. Repeated trials and cross-validation will validate the robustness and repeatability of quantitative measurements, solving RO4. Triangulation, member verification, and peer debriefing will improve the confirmability and reliability of qualitative data, addressing RO4. In order to assist practical implementation and address RO3–RO4, this integration guarantees that findings are reliable and actionable.

Tools and technologies

The framework is implemented and assessed in the study using both hardware and software [5, 27, 28]. Python libraries like TensorFlow, PyTorch, MATLAB for algorithm development, SPSS for quantitative analysis, and NVivo for qualitative coding are examples of software tools. Hardware includes Internet of Things (IoT)-enabled access terminals, like Raspberry Pi devices, that have biometric sensors to record keystroke dynamics, speech, and gait. RO3–RO4 are addressed by applying fusion techniques at the feature, score, and decision levels to increase accuracy and resistance to spoofing attacks.

Ethical considerations and data management

Ethical oversight is central to this study because it handles sensitive biometric and behavioural data [29]. Ethical approval and informed consent will be obtained, and all data will be anonymised and encrypted to comply with POPIA and GDPR []. Monitoring will be restricted to high-security areas, and continuous stakeholder engagement will ensure transparency, cultural sensitivity, and trust. These measures specifically address RO4, safeguarding participant rights while maintaining research integrity. In addition, the research will adhere strictly to NWU research ethics policy.

Expected outputs

The study is designed to deliver outputs that directly correspond to the ROs:

Access control analysis - identifies vulnerabilities and limitations in current systems [3, 31, 33] to sddress RO1.

Framework evaluation - analyses adaptive authentication and multimodal biometrics for applicability in higher education, addressing RO2.

Implemented framework - designs, develops, and tests the context-aware multimodal access control system to address RO3.

Empirical evidence - captures operational performance, anomaly detection, usability, ethical, legal, privacy, and cultural insights from real-world deployment, addressing RO4.

Provisional Division Of Chapters 

The study will be structured into the following chapters:

Chapter 1: Introduction

Chapter 2: Literature review

Chapter 3: Research methodology and design

Chapter 4: Algorithmic design and implementation

Chapter 5: Results and analysis

Chapter 6: Summary, conclusions, and recommendations

Proposed Time Frame 

This study is expected to be completed over a period of 24 months. 

Activity

Duration

Proposal development, refinement, and ethical clearance

3 months

Comprehensive literature review and theoretical framework

4 months

Research methodology design and pilot study

3 months

Data collection (interviews, case studies, system evaluation at selected universities)

4 months

Data analysis and interpretation

3 months

Drafting of thesis chapters (findings, discussion, conclusion)

4 months

Review, editing, and final submission

3 months

This study focuses on enhancing physical security in South African universities through AI-powered multimodal behavioural biometrics and adaptive access control frameworks. It examines current challenges in protecting high-security facilities, reviews biometric and AI-driven technologies (including gait, keystroke dynamics, voice, fingerprints, iris, and facial recognition), and conducts empirical work in selected universities. Interviews, case studies, and system evaluations will capture stakeholder perspectives, adoption challenges, and feasibility, aiming to propose a practical and context-sensitive implementation framework.

Possible limitations include the South African setting, restricting generalisability; a narrow technological focus excluding systems like CCTV analytics; potential restrictions on sensitive security data; and a 24-month timeframe that prevents long-term longitudinal assessment.

References

[1] MyBroadband, “Tshwane University of Technology hit by ransomware,” MyBroadband, May 12, 2023. [Online]. Available: https://mybroadband.co.za/news/security/487911-tshwane-university-of-technology-hit-by-ransomware.html

[2] TimesLIVE, “UNISA admits to exam paper leaks,” TimesLIVE, Oct. 21, 2019. [Online]. Available: https://www.timeslive.co.za/news/south-africa/2019-10-21-unisa-admits-to-exam-paper-leaks/

[3] F. Skopik, D. Schall, and M. Wurzenberger, “Behaviour-based anomaly detection in log data of physical access control systems,” IEEE Trans. Dependable Secure Comput., vol. 20, no. 1, pp. 289–302, 2023, doi: 10.1109/TDSC.2022.3187859.

[4] K. M. M. Uddin, N. Rahman, M. M. Rahman, and S. K. Dey, “Artificial intelligence-based domotics using multimodal security,” Int. J. Intell. Syst. Appl., vol. 15, no. 3, pp. 44–55, 2023.

[5] M. K. Pasupuleti, “AI-enabled multimodal biometrics: Advancing security with facial, voice, and behavioural integration,” Int. J. Acad. Ind. Res. Innovations, vol. 5, no. 1, 2025, doi: 10.62311/nesx/77579.

[6] S. Salturk and N. Kahraman, “Deep learning-powered multimodal biometric authentication: Integrating dynamic signatures and facial data for enhanced online security,” Neural Comput. Appl., vol. 36, pp. 11311–11322, 2024.

[7] J. Samatha and G. Madhavi, “SECURESENSE: Enhancing person verification through multimodal biometrics for robust authentication,” Scal. Comput. Pract. Exper., vol. 25, no. 2, pp. 1040–1055, 2024, doi: 10.12694/scpe.v25i2.2524.

[8] A. Verma, V. Moghaddam, and A. Anwar, “Data-driven behavioural biometrics for continuous and adaptive user verification using smartphone and smartwatch,” Sustainability, vol. 14, no. 12, p. 7362, 2021, doi: 10.3390/su14127362.

[9] J. Liu, J. Lin, C. Yang, and Y. Zhou, “Risk-aware access control in cyber-physical contexts,” Digit. Threats: Res. Pract., vol. 3, no. 4, Art. no. 43, 2022, doi: 10.1145/3480468.

[10] V. Adenola, Artificial intelligence-based access management system. Greenville, NC, USA: East Carolina Univ., 2023.

[11] Mail & Guardian, “South Africa is sleepwalking into becoming a surveillance state,” Mail & Guardian, Aug. 20, 2025. [Online]. Available: https://mg.co.za/thought-leader/2025-08-20-south-africa-is-sleepwalking-into-becoming-a-surveillance-state/

[12] B. Ammour, L. Boubchir, T. Bouden, and M. Ramdani, “Face–iris multimodal biometric identification system,” Electronics, vol. 9, no. 1, p. 85, 2020.

[13] M. Leghari et al., “Deep feature fusion of fingerprint and online signature for multimodal biometrics,” Computers, vol. 10, no. 2, p. 21, 2021, doi: 10.3390/computers10020021.

[14] R. Kalaria, D. Patel, and P. Shah, “Adaptive context-aware access control for IoT with fog computing,” Int. J. Inf. Secur., vol. 23, pp. 3089–3107, 2024, doi: 10.1007/s10207-024-00866-4.

[15] S. Durgaraju, K. P. Kumar, K. R. Rao, and M. V. Reddy, “AI-driven adaptive multimodal authentication,” J. Electr. Syst., vol. 17, no. 1, pp. 75–88, 2021, doi: 10.52783/jes.6643.

[16] A. Budžys, R. Damaševičius, and T. Blažauskas, “Deep learning-based authentication for insider threat detection,” Artif. Intell. Rev., vol. 57, Art. no. 272, 2024, doi: 10.1007/s10462-024-10893-1.

[17] A. F. Baig, Q. Nasir, and M. A. Khan, “Privacy-preserving continuous authentication using behavioural biometrics,” Int. J. Inf. Secur., vol. 22, no. 6, pp. 1833–1847, 2023, doi: 10.1007/s10207-023-00721-y.

[18] C. Tucci, E. Cippitelli, E. Gambi, and S. Spinsante, “Explainable biometrics: A systematic literature review,” J. Ambient Intell. Humaniz. Comput., 2024, doi: 10.1007/s12652-024-04856-1.

[19] A. Rahman et al., “Multimodal EEG and keystroke dynamics based biometric system using machine learning algorithms,” IEEE Access, vol. 9, pp. 94625–94645, 2021, doi: 10.1109/ACCESS.2021.3092840.

[20] L. Md Ali, M. Qiu, and S. Schmeelk, “Access control, biometrics, and the future,” in Proc. 2023 5th Int. Conf. Image, Video Signal Process. (IVSP 2023), 2023, pp. 1–8, doi: 10.1145/3591156.3591158.

[21] L. Li, X. Lin, H. Yang, and C.-T. Lin, “A review of face recognition technology,” IEEE Access, vol. 8, pp. 139110–139120, 2020, doi: 10.1109/ACCESS.2020.3011028.

[22] A. Desai, N. Sharma, and K. Mehta, “Multimodal authentication for keyless door locks,” Int. J. Cybern. Netw. Secur., vol. 5, no. 1, 2025, doi: 10.54105/ijcns.A1436.05010525.

[23] C. Kivunja and A. B. Kuyini, “Understanding and applying research paradigms in educational contexts,” Int. J. High. Educ., vol. 6, no. 5, pp. 26–41, 2017, doi: 10.5430/ijhe.v6n5p26.

[24] M. D. Fetters and D. Freshwater, “The 1 + 1 = 3 integration challenge,” J. Mixed Methods Res., vol. 9, no. 2, pp. 115–117, 2015, doi: 10.1177/1558689815581222.

[25] A. J. Fletcher, “Applying critical realism in qualitative research: Methodology meets method,” Int. J. Soc. Res. Methodol., vol. 20, no. 2, pp. 181–194, 2017, doi: 10.1080/13645579.2016.1144401.

[26] J. W. Creswell and J. D. Creswell, Research Design: Qualitative, Quantitative, and Mixed Methods Approaches, 5th ed. Thousand Oaks, CA, USA: Sage, 2018.

[27] M. Islam, “Data analysis: Types, process, methods, techniques and tools,” Int. J. Data Sci. Technol., vol. 6, no. 1, pp. 10–15, 2020, doi: 10.11648/j.ijdst.20200601.12.

[28] P. Mane and M. Bhosale, “Multimodal biometric authentication: A review of techniques and deployment challenges,” J. Intell. Secur. Syst., vol. 9, no. 4, pp. 245–260, 2023.

[29] P. Bhandari, “Ethical considerations in research | Types & examples,” Scribbr, Oct. 18, 2021. [Online]. Available: https://www.scribbr.com/methodology/research-ethics/

[30] J. Vegas and C. Llamas, “Opportunities and challenges of artificial intelligence applied to identity and access management in industrial environments: A review,” Future Internet, vol. 16, no. 12, Art. no. 469, 2024, doi: 10.3390/fi16120469.

[31] M. D. Magano, M. T. Sithole, and C. C. Ngwakwe, “Health and safety challenges in South African universities: A qualitative review of campus risks and institutional responses,” Int. J. Environ. Res. Public Health, vol. 20, no. 22, pp. 1–15, 2023, doi: 10.3390/ijerph20227023.

[32] S. Adisa and F. Simpeh, “A comparative analysis of student housing security measures,” IOP Conf. Ser..: Earth Environ. Sci., vol. 654, no. 1, p. 012017, 2021, doi: 10.1088/1755-1315/654/1/012017.

[33] D. P. Gonçalves, “Security access control effectiveness design,” S. Afr. J. Ind. Eng., vol. 34, no. 3, pp. 108–119, 2023, doi: 10.7166/34-3-2954.

[34] H. Smuts, R. Winter, A. J. Gerber, and A. van der Merwe, “Designing design science research – A taxonomy for supporting study design decisions,” in The Transdisciplinary Reach of Design Science Research, A. Drechsler, A. Gerber, and A. Hevner, Eds., Lecture Notes in Computer Science, vol. 13229. Cham, Switzerland: Springer, 2022, pp. 517–529. doi: 10.1007/978-3-031-06516-3_36.